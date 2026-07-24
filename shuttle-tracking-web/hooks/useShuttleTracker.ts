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
import { Stop, LocationUpdateData, RouteData, ActiveVehicleInfo } from "@/types";
import { DEFAULT_STOP_ICON, ACTIVE_STOP_ICON } from "@/constants/shuttle";
import { useRouteGeometry } from "@/hooks/useRouteGeometry";
import { useVehicleTracking } from "@/hooks/useVehicleTracking";

export function useShuttleTracker() {
  const { mapRef, LRef } = useLeafletMap();
  const configuredBackendOrigin =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "");

  // === UI State ===
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("R01");
  const [stopsByRoute, setStopsByRoute] = useState<Record<string, Stop[]>>({});
  const [isRouteMenuOpen, setIsRouteMenuOpen] = useState<boolean>(false);
  const routeMenuRef = useRef<HTMLDivElement>(null);

  const [availableCount, setAvailableCount] = useState<number>(0);
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
    checkLoadingComplete,
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

  const isZoomingRef = useRef<boolean>(false);
  const hasInitRoutesRef = useRef<boolean>(false);
  const pendingUpdatesRef = useRef<Record<string, LocationUpdateData>>({});
  const processLocationUpdateRef = useRef<(data: LocationUpdateData) => void>(() => {});
  const calculateETARef = useRef<() => void>(() => {});

  // === Helper: get API origins ===
  const getApiOrigins = useCallback((): string[] => {
    const origins: string[] = [];
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    if (isHttps && typeof window !== "undefined") origins.push(window.location.origin);
    if (configuredBackendOrigin) origins.push(configuredBackendOrigin.replace(/\/$/, ""));
    if (!isHttps && typeof window !== "undefined") origins.push(window.location.origin);
    origins.push("http://localhost:3001");
    return [...new Set(origins)];
  }, [configuredBackendOrigin]);

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
    selectedRoute,
    setSelectedRoute,
    selectedRouteRef,
    stopsByRouteRef,
    routeGeometryRef,
    stopMarkersMapRef,
    activeStopMarkerRef,
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
      if (!mapRef.current) return;
      const count = Object.values(vehiclesRef.current).filter((marker) =>
        mapRef.current?.hasLayer(marker)
      ).length;
      setAvailableCount(count);
      calculateETARef.current();
    }, [mapRef, vehiclesRef]),
    vehiclesRef,
    prevPositionsRef,
    vehicleSpeedHistoryRef,
    vehicleRouteMapRef,
    vehicleLastPolyIndexRef,
    vehicleStopsStatusRef,
  });

  // === Sync Socket Connection ===
  useSocketConnection({
    configuredBackendOrigin,
    mapRef,
    isZoomingRef,
    pendingUpdatesRef,
    processLocationUpdateRef,
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
      if (vehicleRouteMapRef.current[id] === routeId) {
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

    // Trigger local count calculation
    if (!mapRef.current) return;
    const count = Object.values(vehiclesRef.current).filter((marker) =>
      mapRef.current?.hasLayer(marker)
    ).length;
    setAvailableCount(count);
    calculateETA();
  }, [mapRef, routeGeometry, calculateETA, vehiclesRef, vehicleRouteMapRef, activeStopMarkerRef]);

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

  // === Fetch Vehicle Names ===
  useEffect(() => {
    const fetchVehicleNames = async () => {
      try {
        const apiOrigins = getApiOrigins();
        let data = null;
        for (const origin of apiOrigins) {
          try {
            const res = await fetch(`${origin}/api/public/active-vehicles`);
            if (res.ok) {
              data = await res.json();
              break;
            }
          } catch { /* try next origin */ }
        }

        if (data && Array.isArray(data)) {
          const mapping = data.reduce(
            (acc: Record<string, string>, v: { id: string | number; name: string }) => {
              acc[String(v.id)] = v.name || String(v.id);
              return acc;
            },
            {}
          );
          setVehicleNames(mapping);
        }
      } catch (err) {
        console.error("Failed to fetch vehicle names:", err);
      } finally {
        namesLoadedRef.current = true;
        checkLoadingComplete();
      }
    };
    fetchVehicleNames();
  }, [configuredBackendOrigin, checkLoadingComplete, getApiOrigins, namesLoadedRef]);

  // === Init Routes & Map ===
  useEffect(() => {
    if (hasInitRoutesRef.current) return;
    hasInitRoutesRef.current = true;

    const apiOrigins = getApiOrigins();

    const initRoutes = async () => {
      let activeRoutes: RouteData[] = [];
      try {
        for (const origin of apiOrigins) {
          try {
            const res = await fetch(`${origin}/api/public/active-routes`);
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.data) {
                activeRoutes = data.data;
                break;
              } else if (Array.isArray(data)) {
                activeRoutes = data;
                break;
              }
            }
          } catch { /* next origin */ }
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
            activeRoutes.forEach((r) => routeGeometry.loadRouteData(r.id, r.color, apiOrigins));
          }
        }
      }

      interval = setInterval(waitForMap, 200);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [LRef, mapRef, configuredBackendOrigin, getApiOrigins, mapReadyRef, checkLoadingCompleteRef, routeGeometry, setSelectedRoute, selectedRouteRef]);

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