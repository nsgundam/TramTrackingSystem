"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import { RSU_CENTER } from "@/constants";
import { useLeafletMap } from "@/hooks/useLeafletMap";
import { usePreloader } from "@/hooks/usePreloader";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSocketConnection } from "@/hooks/useSocketConnection";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { calculateETAForStop } from "@/utils/ShuttleHelpers";
import {
  Stop,
  LocationUpdateData,
  RouteData,
  ActiveVehicleInfo,
  ActiveVehicleState,
  CanonicalVehicleStateV1,
  isCanonicalStateNewer,
} from "@/types";
import { DEFAULT_STOP_ICON, ACTIVE_STOP_ICON } from "@/constants/shuttle";
import { useRouteGeometry } from "@/hooks/useRouteGeometry";
import { useVehicleTracking } from "@/hooks/useVehicleTracking";
import { getActiveVehicles } from "@/services/publicApi";
import { backendConnection } from "@/config/backend";
import {
  canDisplayCanonicalVehicleMarker,
  CanonicalVehicleStateCounts,
  projectCanonicalVehicleStateCounts,
} from "@/utils/canonical-public-state";

const BACKEND_ORIGINS = [backendConnection.origin];

export function useShuttleTracker() {
  const { mapRef, LRef } = useLeafletMap();
  const configuredBackendOrigin = backendConnection.origin;

  // === UI State ===
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("R01");
  const [stopsByRoute, setStopsByRoute] = useState<Record<string, Stop[]>>({});
  const [isRouteMenuOpen, setIsRouteMenuOpen] = useState<boolean>(false);
  const routeMenuRef = useRef<HTMLDivElement>(null);

  const [availableCount, setAvailableCount] = useState<number>(0);
  const [vehicleStateCounts, setVehicleStateCounts] = useState<CanonicalVehicleStateCounts>({
    live: 0,
    stale: 0,
    no_service: 0,
    unknown: 0,
  });
  const [targetStop, setTargetStop] = useState<Stop | null>(null);
  const [realEta, setRealEta] = useState<number | null>(null);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(true);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [activeVehicleInfo, setActiveVehicleInfo] = useState<ActiveVehicleInfo | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);

  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [feedbackVehicleId, setFeedbackVehicleId] = useState<string | null>(null);
  const [vehicleNames, setVehicleNames] = useState<Record<string, string>>({});

  // === Small Hooks ===
  const { deferredPrompt, handleInstallClick } = usePWAInstall();
  const preloader = usePreloader({ routesLength: routes.length });
  const {
    namesLoadedRef,
    mapReadyRef,
    checkLoadingCompleteRef,
  } = preloader;
  const { userLoc } = useGeolocation(mapRef);

  // === Refs (Background Data) ===
  const targetStopRef = useRef<Stop | null>(null);
  const selectedVehicleIdRef = useRef<string | null>(null);
  const isTrackingRef = useRef<boolean>(false);

  const selectedRouteRef = useRef<string>("R01");
  const stopsByRouteRef = useRef<Record<string, Stop[]>>({});
  const routeGeometryRef = useRef<Record<string, [number, number][]>>({});
  const stopMarkersMapRef = useRef<Record<string, L.Marker>>({});
  const activeStopMarkerRef = useRef<L.Marker | null>(null);
  const routeLayersRef = useRef<Record<string, L.LayerGroup>>({});
  const stopLayersRef = useRef<Record<string, L.LayerGroup>>({});

  const vehiclesRef = useRef<Record<string, L.Marker>>({});
  const prevPositionsRef = useRef<Record<string, [number, number]>>({});
  const vehicleSpeedHistoryRef = useRef<Record<string, number[]>>({});
  const vehicleRouteMapRef = useRef<Record<string, string>>({});
  const vehicleLastPolyIndexRef = useRef<Record<string, number>>({});
  const vehicleStopsStatusRef = useRef<Record<string, ActiveVehicleInfo>>({});
  const canonicalVersionsRef = useRef<Record<string, Pick<CanonicalVehicleStateV1, "stateEpoch" | "stateVersion">>>({});
  const vehicleStatesRef = useRef<Record<string, CanonicalVehicleStateV1>>({});
  const expiredVehiclesRef = useRef<Record<string, boolean>>({});
  const expiryTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const isZoomingRef = useRef<boolean>(false);
  const hasInitRoutesRef = useRef<boolean>(false);
  const pendingUpdatesRef = useRef<Record<string, LocationUpdateData>>({});
  const processLocationUpdateRef = useRef<(data: LocationUpdateData) => void>(() => {});
  const calculateETARef = useRef<() => void>(() => {});

  const removeVehicleMarker = useCallback((id: string) => {
    const marker = vehiclesRef.current[id];
    if (marker && mapRef.current?.hasLayer(marker)) mapRef.current.removeLayer(marker);
  }, [mapRef]);

  const refreshVehicleStateCounts = useCallback(() => {
    const counts = projectCanonicalVehicleStateCounts(
      vehicleStatesRef.current,
      expiredVehiclesRef.current,
    );
    setVehicleStateCounts(counts);
    setAvailableCount(counts.live);
  }, []);

  const scheduleLocalExpiry = useCallback((state: CanonicalVehicleStateV1) => {
    const id = state.vehicleId;
    const previousTimer = expiryTimersRef.current[id];
    if (previousTimer) clearTimeout(previousTimer);
    expiredVehiclesRef.current[id] = false;

    if (state.serviceState !== "live") return;

    const elapsedMs = state.freshness.ageMs ?? 0;
    const expiresInMs = Math.max(0, state.freshness.thresholdMs - elapsedMs);
    expiryTimersRef.current[id] = setTimeout(() => {
      const current = vehicleStatesRef.current[id];
      if (
        current &&
        current.stateEpoch === state.stateEpoch &&
        current.stateVersion === state.stateVersion &&
        current.serviceState === "live"
      ) {
        expiredVehiclesRef.current[id] = true;
        refreshVehicleStateCounts();
        removeVehicleMarker(id);
        calculateETARef.current();
      }
    }, expiresInMs);
  }, [refreshVehicleStateCounts, removeVehicleMarker]);

  const acceptCanonicalState = useCallback((state: LocationUpdateData): boolean => {
    if (
      state.schemaVersion !== 1 ||
      state.eventType !== "canonical_vehicle_state" ||
      !state.vehicleId
    ) return false;

    const previous = canonicalVersionsRef.current[state.vehicleId];
    if (!isCanonicalStateNewer(state, previous)) return false;

    canonicalVersionsRef.current[state.vehicleId] = {
      stateEpoch: state.stateEpoch,
      stateVersion: state.stateVersion,
    };
    vehicleStatesRef.current[state.vehicleId] = state;
    scheduleLocalExpiry(state);
    refreshVehicleStateCounts();
    return true;
  }, [refreshVehicleStateCounts, scheduleLocalExpiry]);

  // === Stop Select callback ===
  const onStopSelect = useCallback((stop: Stop, marker: L.Marker) => {
    setSelectedVehicleId(null);
    selectedVehicleIdRef.current = null;
    setIsTracking(false);
    isTrackingRef.current = false;

    if (activeStopMarkerRef.current)
      activeStopMarkerRef.current.setIcon(DEFAULT_STOP_ICON);
    marker.setIcon(ACTIVE_STOP_ICON);
    activeStopMarkerRef.current = marker;
    setTargetStop(stop);
    targetStopRef.current = stop;
    calculateETARef.current();
    mapRef.current?.flyTo([stop.lat, stop.lng], 19, { animate: true, duration: 0.8 });
  }, [mapRef]);

  // === Hook 1: Route and Geometry Manager ===
  const routeGeometry = useRouteGeometry({
    mapRef,
    LRef,
    setStopsByRoute,
    onStopSelect,
    preloader,
    setSelectedRoute,
    selectedRouteRef,
    stopsByRouteRef,
    routeGeometryRef,
    stopMarkersMapRef,
    routeLayersRef,
    stopLayersRef,
  });

  // === Hook 2: Vehicle Tracking Manager ===
  const vehicleTracking = useVehicleTracking({
    mapRef,
    selectedRouteRef,
    routeGeometryRef,
    stopsByRouteRef,
    onVehicleSelect: useCallback((id: string, marker: L.Marker, info?: ActiveVehicleInfo) => {
      setSelectedVehicleId(id);
      selectedVehicleIdRef.current = id;
      setIsTracking(true);
      isTrackingRef.current = true;

      setTargetStop(null);
      targetStopRef.current = null;
      if (activeStopMarkerRef.current) {
        activeStopMarkerRef.current.setIcon(DEFAULT_STOP_ICON);
        activeStopMarkerRef.current = null;
      }

      if (info) setActiveVehicleInfo(info);

      const pos = marker.getLatLng();
      mapRef.current?.flyTo([pos.lat, pos.lng], 19, { animate: true, duration: 0.8 });
    }, [mapRef]),
    onVehicleUpdate: useCallback((id: string, info: ActiveVehicleInfo) => {
      if (selectedVehicleIdRef.current === id) {
        setActiveVehicleInfo(info);
      }
    }, []),
    onCameraTrack: useCallback((id: string, pos: [number, number]) => {
      if (id === selectedVehicleIdRef.current && isTrackingRef.current) {
        mapRef.current?.panTo(pos, { animate: true, duration: 0.8 });
      }
    }, [mapRef]),
    updateAvailableCount: useCallback(() => {
      refreshVehicleStateCounts();
      calculateETARef.current();
    }, [refreshVehicleStateCounts]),
    vehiclesRef,
    prevPositionsRef,
    vehicleSpeedHistoryRef,
    vehicleRouteMapRef,
    vehicleLastPolyIndexRef,
    vehicleStopsStatusRef,
    expiredVehiclesRef,
  });

  const hydrateActiveVehicles = useCallback(async () => {
    try {
      const vehicles = await getActiveVehicles();
      const names = vehicles.reduce<Record<string, string>>((mapping, vehicle) => {
        mapping[String(vehicle.id)] = vehicle.name || String(vehicle.id);
        return mapping;
      }, {});
      setVehicleNames((current) => ({ ...current, ...names }));

      vehicles.forEach((vehicle: ActiveVehicleState) => {
        if (acceptCanonicalState(vehicle.state)) {
          processLocationUpdateRef.current(vehicle.state);
        }
      });
    } catch {
      // The Socket.IO connection can still recover if this REST snapshot is unavailable.
    } finally {
      namesLoadedRef.current = true;
      checkLoadingCompleteRef.current();
    }
  }, [acceptCanonicalState, namesLoadedRef, checkLoadingCompleteRef]);

  // === Sync Socket Connection ===
  useSocketConnection({
    mapRef,
    isZoomingRef,
    pendingUpdatesRef,
    processLocationUpdateRef,
    hydrateActiveVehicles,
    acceptCanonicalState,
  });

  // === Calculation / Handlers ===
  const calculateETA = useCallback(() => {
    if (!targetStopRef.current || !mapRef.current) {
      setRealEta(null);
      return;
    }
    const eta = calculateETAForStop(targetStopRef.current, selectedRoute, {
      vehicleRouteMap: vehicleRouteMapRef.current,
      routeGeometry: routeGeometryRef.current,
      vehicleLastPolyIndex: vehicleLastPolyIndexRef.current,
      prevPositions: prevPositionsRef.current,
      vehicleSpeedHistory: vehicleSpeedHistoryRef.current,
      stopsByRoute: stopsByRouteRef.current,
      vehicles: vehiclesRef.current,
      map: mapRef.current,
      canonicalStates: vehicleStatesRef.current,
      expiredVehicles: expiredVehiclesRef.current,
    });
    setRealEta(eta);
  }, [mapRef, selectedRoute, routeGeometryRef, stopsByRouteRef, vehicleRouteMapRef, vehicleLastPolyIndexRef, prevPositionsRef, vehicleSpeedHistoryRef, vehiclesRef]);

  const handleFindNearestStop = useCallback(() => {
    if (!userLoc)
      return alert("กรุณาเปิดการเข้าถึงตำแหน่งที่ตั้ง (GPS) ในเบราว์เซอร์ของคุณ");
    const currentStops = stopsByRouteRef.current[selectedRoute] || [];
    if (currentStops.length === 0) return;

    let nearest: Stop | null = null;
    let minDst = Infinity;

    for (const stop of currentStops) {
      const dst = L.latLng(userLoc[0], userLoc[1]).distanceTo(L.latLng(stop.lat, stop.lng));
      if (dst < minDst) {
        minDst = dst;
        nearest = stop;
      }
    }

    if (nearest && mapRef.current) {
      setSelectedVehicleId(null);
      selectedVehicleIdRef.current = null;
      setIsTracking(false);
      isTrackingRef.current = false;

      setTargetStop(nearest);
      targetStopRef.current = nearest;
      calculateETA();
      mapRef.current.flyTo([nearest.lat, nearest.lng], 19, { animate: true });

      if (activeStopMarkerRef.current)
        activeStopMarkerRef.current.setIcon(DEFAULT_STOP_ICON);
      const nearestMarker = stopMarkersMapRef.current[String(nearest.id)];
      if (nearestMarker) {
        nearestMarker.setIcon(ACTIVE_STOP_ICON);
        activeStopMarkerRef.current = nearestMarker;
      }
    }
  }, [mapRef, userLoc, selectedRoute, stopsByRouteRef, activeStopMarkerRef, stopMarkersMapRef, calculateETA]);

  const handleRouteChange = useCallback((routeId: string) => {
    routeGeometry.handleRouteChange(routeId);

    Object.keys(vehiclesRef.current).forEach((id) => {
      const marker = vehiclesRef.current[id];
      const state = vehicleStatesRef.current[id];
      const canDisplayMarker = canDisplayCanonicalVehicleMarker(
        state,
        routeId,
        Boolean(expiredVehiclesRef.current[id]),
      );

      if (canDisplayMarker) {
        if (!mapRef.current?.hasLayer(marker)) marker.addTo(mapRef.current!);
      } else {
        if (mapRef.current?.hasLayer(marker)) mapRef.current.removeLayer(marker);
      }
    });

    setTargetStop(null);
    targetStopRef.current = null;
    if (activeStopMarkerRef.current) {
      activeStopMarkerRef.current.setIcon(DEFAULT_STOP_ICON);
      activeStopMarkerRef.current = null;
    }

    setSelectedVehicleId(null);
    selectedVehicleIdRef.current = null;
    setIsTracking(false);
    isTrackingRef.current = false;

    calculateETA();
  }, [mapRef, routeGeometry, calculateETA, vehiclesRef, activeStopMarkerRef]);

  const handleLocateUser = useCallback(() => {
    if (userLoc) {
      mapRef.current?.flyTo(userLoc, 18, { animate: true, duration: 1.0 });
      handleFindNearestStop();
    } else {
      alert("กรุณาเปิดการเข้าถึงตำแหน่งที่ตั้ง (GPS) ในเบราว์เซอร์ของคุณ");
    }
  }, [mapRef, userLoc, handleFindNearestStop]);

  const handleRecenter = useCallback(() => {
    if (selectedVehicleIdRef.current && mapRef.current) {
      const marker = vehiclesRef.current[selectedVehicleIdRef.current];
      if (marker) {
        const pos = marker.getLatLng();
        setIsTracking(true);
        isTrackingRef.current = true;
        mapRef.current.flyTo([pos.lat, pos.lng], 19, { animate: true, duration: 0.8 });
      }
    }
  }, [mapRef, vehiclesRef]);

  const handleOpenFeedback = useCallback((vehicleId?: string | null) => {
    setFeedbackVehicleId(vehicleId || null);
    setIsFeedbackOpen(true);
  }, []);

  // === Click Outside for Route Menu ===
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (routeMenuRef.current && !routeMenuRef.current.contains(event.target as Node)) {
        setIsRouteMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === Sync refs ===
  useEffect(() => {
    calculateETARef.current = calculateETA;
  });

  useEffect(() => {
    processLocationUpdateRef.current = vehicleTracking.processLocationUpdate;
  });

  // === Init Routes & Map ===
  useEffect(() => {
    if (hasInitRoutesRef.current) return;
    hasInitRoutesRef.current = true;

    const initRoutes = async () => {
      let activeRoutes: RouteData[] = [];
      try {
        const res = await fetch(`${backendConnection.apiBaseUrl}/public/active-routes`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            activeRoutes = data.data;
          } else if (Array.isArray(data)) {
            activeRoutes = data;
          }
        }
      } catch (err) {
        console.error("Failed to fetch active routes", err);
      }

      setRoutes(activeRoutes);
      if (activeRoutes.length > 0) {
        setSelectedRoute(activeRoutes[0].id);
        selectedRouteRef.current = activeRoutes[0].id;
      }

      return activeRoutes;
    };

    let interval: NodeJS.Timeout;

    initRoutes().then((activeRoutes) => {
      function waitForMap() {
        if (mapRef.current && LRef.current) {
          clearInterval(interval);
          mapRef.current.flyTo(RSU_CENTER, 16.7, { animate: true, duration: 1.2 });
          mapReadyRef.current = true;
          checkLoadingCompleteRef.current();
          Object.values(vehicleStatesRef.current).forEach((state) => {
            processLocationUpdateRef.current(state);
          });

          mapRef.current.on("zoomstart", (e: L.LeafletEvent & { originalEvent?: unknown }) => {
            isZoomingRef.current = true;
            setIsAppLocked(true);
            if (e.originalEvent) {
              setIsTracking(false);
              isTrackingRef.current = false;
            }
          });
          mapRef.current.on("zoomend", () => {
            isZoomingRef.current = false;
            setIsAppLocked(false);
            Object.values(pendingUpdatesRef.current).forEach((data) =>
              processLocationUpdateRef.current(data)
            );
            pendingUpdatesRef.current = {};
          });
          mapRef.current.on("dragstart", () => {
            setIsTracking(false);
            isTrackingRef.current = false;
          });

          mapRef.current.on("click", () => {
            if (isZoomingRef.current) return;
            if (targetStopRef.current || activeStopMarkerRef.current || selectedVehicleIdRef.current) {
              setTargetStop(null);
              targetStopRef.current = null;
              if (activeStopMarkerRef.current) {
                activeStopMarkerRef.current.setIcon(DEFAULT_STOP_ICON);
                activeStopMarkerRef.current = null;
              }
              setSelectedVehicleId(null);
              selectedVehicleIdRef.current = null;
              setIsTracking(false);
              isTrackingRef.current = false;
              mapRef.current?.flyTo(RSU_CENTER, 16.7, { animate: true, duration: 0.8 });
            }
          });

          if (activeRoutes) {
            activeRoutes.forEach((r) => routeGeometry.loadRouteData(r.id, r.color, BACKEND_ORIGINS));
          }
        }
      }

      interval = setInterval(waitForMap, 200);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [LRef, mapRef, mapReadyRef, checkLoadingCompleteRef, routeGeometry, setSelectedRoute, selectedRouteRef]);

  // === Tour Zoom Center ===
  useEffect(() => {
    const handleZoomCenter = () => {
      if (mapRef.current) {
        setSelectedVehicleId(null);
        selectedVehicleIdRef.current = null;
        setTargetStop(null);
        targetStopRef.current = null;
        if (activeStopMarkerRef.current) {
          activeStopMarkerRef.current.setIcon(DEFAULT_STOP_ICON);
          activeStopMarkerRef.current = null;
        }
        setIsTracking(false);
        isTrackingRef.current = false;

        mapRef.current.flyTo(RSU_CENTER, 16.7, { animate: true, duration: 1.2 });
      }
    };

    window.addEventListener("tour-zoom-center", handleZoomCenter);
    return () => window.removeEventListener("tour-zoom-center", handleZoomCenter);
  }, [mapRef, activeStopMarkerRef]);

  return {
    // State
    routes,
    selectedRoute,
    availableCount,
    vehicleStateCounts,
    userLoc,
    targetStop,
    realEta,
    isAppLocked,
    selectedVehicleId,
    activeVehicleInfo,
    isTracking,
    stopsByRoute,
    isFeedbackOpen,
    feedbackVehicleId,
    vehicleNames,
    deferredPrompt,
    showPreloader: preloader.showPreloader,
    isIntroFinished: preloader.isIntroFinished,
    isRouteMenuOpen,
    routeMenuRef,

    // Refs
    mapRef,

    // Config
    configuredBackendOrigin,

    // Handlers
    handleRouteChange,
    handleLocateUser,
    handleRecenter,
    handleOpenFeedback,
    handleInstallClick,
    setIsRouteMenuOpen,
    setIsFeedbackOpen,
  };
}
