"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import { io, Socket } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import "@/app/shuttle-tracker.css";
import { RSU_CENTER } from "@/constants";
import { useLeafletMap } from "@/hooks/useLeafletMap";
import { generateBusIconHtml } from "@/utils/IconHelpers";
import AvailabilityCard from "@/components/public/AvailabilityCard";
import StopInfoCard from "@/components/public/StopInfoCard";
import VehicleInfoCard from "@/components/public/VehicleInfoCard";
import AppTour from "@/components/public/AppTour";
import { shouldMove, animateMove, getNearestPointIndex, getDirectionalPointIndex } from "@/utils/MapHelpers";
import {
  Stop,
  CanonicalVehicleStateV1,
  LocationUpdateData,
  isCanonicalStateNewer,
} from "@/types";
import { getActiveVehicles } from "@/services/publicApi";

import { Plus, Minus, Locate, MessageSquarePlus, ChevronDown } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

interface RouteData {
  id: string;
  name: string;
  color: string;
  status: string;
}

// === Constants & Icons ===
const AVERAGE_BUS_SPEED_KMH = 15;
const METERS_PER_MIN = AVERAGE_BUS_SPEED_KMH * (1000 / 60);
const ROUTE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type RouteGeometryCache = {
  version: 2;
  signature: string;
  source: "osrm";
  createdAt: number;
  coords: [number, number][];
};

const createStopsSignature = (stops: Stop[]) =>
  stops.map((stop, index) => `${index}:${stop.id}:${stop.lat.toFixed(6)}:${stop.lng.toFixed(6)}`).join("|");

const isCoordinateList = (value: unknown): value is [number, number][] =>
  Array.isArray(value) && value.length > 1 && value.every(
    (point) => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite)
  );

const DEFAULT_STOP_ICON = L.icon({
  iconUrl: "/icons/stop.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'stop-marker-tour'
});

const ACTIVE_STOP_ICON = L.icon({
  iconUrl: "/icons/stop.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
  className: 'stop-marker-tour'
});

export default function ShuttleTracker() {
  const { mapRef, LRef } = useLeafletMap();
  const configuredBackendOrigin =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "");

  // === 1. State ===
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isRouteMenuOpen, setIsRouteMenuOpen] = useState<boolean>(false);
  const routeMenuRef = useRef<HTMLDivElement>(null);
  
  const [selectedRoute, setSelectedRoute] = useState<string>("R01");
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [targetStop, setTargetStop] = useState<Stop | null>(null);
  const [realEta, setRealEta] = useState<number | null>(null);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(true);

  // เพิ่ม State สำหรับ Card รถ
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [activeVehicleInfo, setActiveVehicleInfo] = useState<{ prev: string; next: string; eta: number | null; nextStopId: string | number | null } | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [stopsByRoute, setStopsByRoute] = useState<Record<string, Stop[]>>({});
  const [vehicleStateCounts, setVehicleStateCounts] = useState<Record<"live" | "stale" | "no_service" | "unknown", number>>({
    live: 0,
    stale: 0,
    no_service: 0,
    unknown: 0,
  });

  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [feedbackVehicleId, setFeedbackVehicleId] = useState<string | null>(null);
  const [vehicleNames, setVehicleNames] = useState<Record<string, string>>({});
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // === Preloader States & Refs ===
  const [showPreloader, setShowPreloader] = useState<boolean>(true);
  const [isIntroFinished, setIsIntroFinished] = useState<boolean>(false);

  const namesLoadedRef = useRef<boolean>(false);
  const loadedRoutesRef = useRef<Set<string>>(new Set());
  const mapReadyRef = useRef<boolean>(false);
  const checkLoadingCompleteRef = useRef<() => void>(() => {});

  const checkLoadingComplete = useCallback(() => {
    const totalRoutes = routes.length > 0 ? routes.length : 1;

    if (mapReadyRef.current && loadedRoutesRef.current.size === totalRoutes && totalRoutes > 0 && namesLoadedRef.current) {
      setTimeout(() => {
        setIsIntroFinished(true);
        setTimeout(() => {
          setShowPreloader(false);
        }, 800);
      }, 500);
    }
  }, [routes.length]);
  
  useEffect(() => {
    checkLoadingCompleteRef.current = checkLoadingComplete;
  }, [checkLoadingComplete]);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsIntroFinished(true);
      setTimeout(() => {
        setShowPreloader(false);
      }, 800);
    }, 5000); // 5 seconds safety timeout

    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (routeMenuRef.current && !routeMenuRef.current.contains(event.target as Node)) {
        setIsRouteMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // PWA Registration & Install Interceptor
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(
        (reg) => console.log("SW Registered:", reg.scope),
        (err) => console.error("SW Registration Failed:", err)
      );
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("Install prompt outcome:", outcome);
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleOpenFeedback = (vehicleId?: string | null) => {
    setFeedbackVehicleId(vehicleId || null);
    setIsFeedbackOpen(true);
  };

  // === 2. Refs (Background Data) ===
  const selectedRouteRef = useRef<string>("R01");
  const targetStopRef = useRef<Stop | null>(null);
  
  // เพิ่ม Ref สำหรับ Card รถ เพื่อใช้ใน useCallback
  const selectedVehicleIdRef = useRef<string | null>(null);
  const vehicleStopsStatusRef = useRef<Record<string, { prev: string; next: string; eta: number | null; nextStopId: string | number | null }>>({});
  const isTrackingRef = useRef<boolean>(false);
  
  // Data Storage
  const stopsByRouteRef = useRef<Record<string, Stop[]>>({});
  const routeGeometryRef = useRef<Record<string, [number, number][]>>({});
  
  // Vehicles Tracking
  const vehiclesRef = useRef<Record<string, L.Marker>>({});
  const prevPositionsRef = useRef<Record<string, [number, number]>>({});
  const vehicleSpeedHistoryRef = useRef<Record<string, number[]>>({});
  const vehicleRouteMapRef = useRef<Record<string, string>>({});
  const vehicleLastPolyIndexRef = useRef<Record<string, number>>({});
  const canonicalVersionsRef = useRef<Record<string, Pick<CanonicalVehicleStateV1, "stateEpoch" | "stateVersion">>>({});
  const vehicleStatesRef = useRef<Record<string, CanonicalVehicleStateV1>>({});
  const expiredVehiclesRef = useRef<Record<string, boolean>>({});
  const expiryTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const hasConnectedRef = useRef<boolean>(false);
  
  // Map Layers
  const activeStopMarkerRef = useRef<L.Marker | null>(null);
  const stopMarkersMapRef = useRef<Record<string, L.Marker>>({});
  const routeLayersRef = useRef<Record<string, L.LayerGroup>>({});
  const stopLayersRef = useRef<Record<string, L.LayerGroup>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  
  // Event Queues
  const isZoomingRef = useRef<boolean>(false);
  const pendingUpdatesRef = useRef<Record<string, LocationUpdateData>>({});
  const processLocationUpdateRef = useRef<(data: LocationUpdateData, alreadyAccepted?: boolean) => void>(() => {});
  const calculateETARef = useRef<() => void>(() => {});

  const removeVehicleMarker = (id: string) => {
    const marker = vehiclesRef.current[id];
    if (marker && mapRef.current?.hasLayer(marker)) mapRef.current.removeLayer(marker);
  };

  const scheduleLocalExpiry = (state: CanonicalVehicleStateV1) => {
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
        removeVehicleMarker(id);
        calculateETARef.current();
      }
    }, expiresInMs);
  };

  const acceptCanonicalState = (state: CanonicalVehicleStateV1): boolean => {
    if (state.schemaVersion !== 1 || state.eventType !== "canonical_vehicle_state") return false;
    const previous = canonicalVersionsRef.current[state.vehicleId];
    if (!isCanonicalStateNewer(state, previous)) return false;

    canonicalVersionsRef.current[state.vehicleId] = {
      stateEpoch: state.stateEpoch,
      stateVersion: state.stateVersion,
    };
    vehicleStatesRef.current[state.vehicleId] = state;
    const counts = { live: 0, stale: 0, no_service: 0, unknown: 0 } as Record<"live" | "stale" | "no_service" | "unknown", number>;
    Object.values(vehicleStatesRef.current).forEach((vehicleState) => {
      counts[vehicleState.serviceState] += 1;
    });
    setVehicleStateCounts(counts);
    scheduleLocalExpiry(state);
    return true;
  };

  // === 3. Core Functions ===

  const calculateETA = () => {
    if (!targetStopRef.current || !mapRef.current) {
      setRealEta(null);
      return;
    }

    const stop = targetStopRef.current;
    const routeId = selectedRouteRef.current;
    const coords = routeGeometryRef.current[routeId];
    const stops = stopsByRouteRef.current[routeId] || [];
    let minEtaMinutes = Infinity;

    if (!coords || coords.length === 0) return;

    Object.keys(vehiclesRef.current).forEach((id) => {
      const state = vehicleStatesRef.current[id];
      if (
        !state ||
        state.serviceState !== "live" ||
        expiredVehiclesRef.current[id] ||
        vehicleRouteMapRef.current[id] !== routeId ||
        !mapRef.current?.hasLayer(vehiclesRef.current[id])
      ) return;

      const busIdx = vehicleLastPolyIndexRef.current[id];
      const stopIdx = stop.polyIndex;

      if (busIdx === undefined || busIdx === -1 || stopIdx === undefined) return;

      const calcDist = (startIdx: number, endIdx: number) => {
        let d = 0;
        for (let i = startIdx; i < endIdx; i++) {
          d += L.latLng(coords[i]).distanceTo(L.latLng(coords[i + 1]));
        }
        return d;
      };

      const pos = prevPositionsRef.current[id];
      const physicalDist = pos ? L.latLng(pos[0], pos[1]).distanceTo(L.latLng(stop.lat, stop.lng)) : Infinity;

      // ระยะห่างแบบ 1D Index (เดินหน้าอย่างเดียว)
      let forwardDiff = stopIdx - busIdx;
      if (forwardDiff < 0) forwardDiff += coords.length;

      let backwardDiff = busIdx - stopIdx;
      if (backwardDiff < 0) backwardDiff += coords.length;

      let pathDist = 0;
      let stopsBetween = 0;

      // ถ้ารถอยู่ใกล้ป้ายจริง (ระยะทาง < 30m) และ Index อยู่ใกล้กัน ถือว่าถึงแล้ว
      if (physicalDist <= 30 && (forwardDiff < 15 || backwardDiff < 15)) {
          pathDist = 0;
          stopsBetween = 0;
      } else {
          // บังคับคำนวณตามลำดับ Index (ถ้ารถอยู่เลนสวน มันจะบวกระยะทางตามเลนจนกว่าจะวนรถกลับมาเอง)
          if (busIdx <= stopIdx) {
              pathDist = calcDist(busIdx, stopIdx);
          } else {
              pathDist = calcDist(busIdx, coords.length - 1) + calcDist(0, stopIdx);
          }

          // นับป้ายที่อยู่ระหว่างทาง (เฉพาะป้ายที่ยังไม่ถึง)
          stopsBetween = stops.filter(s => {
              if (s.polyIndex === undefined) return false;
              if (busIdx <= stopIdx) {
                  return s.polyIndex > busIdx && s.polyIndex < stopIdx;
              } else {
                  return s.polyIndex > busIdx || s.polyIndex < stopIdx;
              }
          }).length;
      }

      const history = vehicleSpeedHistoryRef.current[id] || [];
      let speedKmh = 15;
      if (history.length > 0) speedKmh = history.reduce((a, b) => a + b, 0) / history.length;
      if (speedKmh < 10) speedKmh = 10;

      const pureDrivingTime = pathDist / METERS_PER_MIN;
      const stopDwellTime = stopsBetween * 0.5;

      const etaMinutes = Math.max(1, Math.ceil(pureDrivingTime + stopDwellTime));
      if (etaMinutes < minEtaMinutes) minEtaMinutes = etaMinutes;
    });

    setRealEta(minEtaMinutes === Infinity ? null : minEtaMinutes);
  };

  const updateMapDerivedState = () => {
    if (!mapRef.current) return;
    calculateETA();
  };

  const handleFindNearestStop = () => {
    if (!userLoc) return alert("กรุณาเปิดการเข้าถึงตำแหน่งที่ตั้ง (GPS) ในเบราว์เซอร์ของคุณ");
    const currentStops = stopsByRouteRef.current[selectedRouteRef.current] || [];
    if (currentStops.length === 0) return;

    let nearest: Stop | null = null;
    let minDst = Infinity;
    
    for (const stop of currentStops)  {
      const dst = L.latLng(userLoc[0], userLoc[1]).distanceTo(L.latLng(stop.lat, stop.lng));
      if (dst < minDst) { minDst = dst; nearest = stop; }
    }

    if (nearest && mapRef.current) {
      // ซ่อน Card รถ
      setSelectedVehicleId(null);
      selectedVehicleIdRef.current = null;
      setIsTracking(false);
      isTrackingRef.current = false;

      setTargetStop(nearest);
      targetStopRef.current = nearest;
      calculateETA();
      mapRef.current.flyTo([nearest.lat, nearest.lng], 19, { animate: true });

      if (activeStopMarkerRef.current) activeStopMarkerRef.current.setIcon(DEFAULT_STOP_ICON);
      const nearestMarker = stopMarkersMapRef.current[String(nearest.id)];
      if (nearestMarker) {
        nearestMarker.setIcon(ACTIVE_STOP_ICON);
        activeStopMarkerRef.current = nearestMarker;
      }
    }
  };

  const handleRouteChange = (routeId: string) => {
    if (!mapRef.current) return;
    setSelectedRoute(routeId);
    selectedRouteRef.current = routeId;

    Object.values(routeLayersRef.current).forEach(layer => mapRef.current?.removeLayer(layer));
    routeLayersRef.current[routeId]?.addTo(mapRef.current);

    Object.values(stopLayersRef.current).forEach(layer => mapRef.current?.removeLayer(layer));
    stopLayersRef.current[routeId]?.addTo(mapRef.current);

    Object.keys(vehiclesRef.current).forEach(id => {
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
    
    // ซ่อน Card รถตอนเปลี่ยนสาย
    setSelectedVehicleId(null);
    selectedVehicleIdRef.current = null;
    setIsTracking(false);
    isTrackingRef.current = false;

    updateMapDerivedState();
  };

  const handleLocateUser = () => {
    if (userLoc) {
      mapRef.current?.flyTo(userLoc, 18, { animate: true, duration: 1.0 });
      handleFindNearestStop();
    } else {
      alert("กรุณาเปิดการเข้าถึงตำแหน่งที่ตั้ง (GPS) ในเบราว์เซอร์ของคุณ");
    }
  };

  const handleRecenter = () => {
    if (selectedVehicleIdRef.current && mapRef.current) {
      const marker = vehiclesRef.current[selectedVehicleIdRef.current];
      if (marker) {
        const pos = marker.getLatLng();
        setIsTracking(true);
        isTrackingRef.current = true;
        mapRef.current.flyTo([pos.lat, pos.lng], 19, { animate: true, duration: 0.8 });
      }
    }
  };

  const getVehicleETAToStop = (vehicleId: string, stop: Stop): number | null => {
    const routeId = vehicleRouteMapRef.current[vehicleId];
    const coords = routeGeometryRef.current[routeId];
    if (!coords || coords.length === 0) return null;

    const busIdx = vehicleLastPolyIndexRef.current[vehicleId];
    const stopIdx = stop.polyIndex;
    if (busIdx === undefined || busIdx === -1 || stopIdx === undefined) return null;

    const calcDist = (startIdx: number, endIdx: number) => {
      let d = 0;
      for (let i = startIdx; i < endIdx; i++) {
        d += L.latLng(coords[i]).distanceTo(L.latLng(coords[i + 1]));
      }
      return d;
    };

    const pos = prevPositionsRef.current[vehicleId];
    const physicalDist = pos ? L.latLng(pos[0], pos[1]).distanceTo(L.latLng(stop.lat, stop.lng)) : Infinity;

    let forwardDiff = stopIdx - busIdx;
    if (forwardDiff < 0) forwardDiff += coords.length;

    let backwardDiff = busIdx - stopIdx;
    if (backwardDiff < 0) backwardDiff += coords.length;

    let pathDist = 0;
    let stopsBetween = 0;

    if (physicalDist <= 30 && (forwardDiff < 15 || backwardDiff < 15)) {
      pathDist = 0;
      stopsBetween = 0;
    } else {
      if (busIdx <= stopIdx) {
        pathDist = calcDist(busIdx, stopIdx);
      } else {
        pathDist = calcDist(busIdx, coords.length - 1) + calcDist(0, stopIdx);
      }
      const routeStops = stopsByRouteRef.current[routeId] || [];
      stopsBetween = routeStops.filter(s => {
        if (s.polyIndex === undefined) return false;
        if (busIdx <= stopIdx) {
          return s.polyIndex > busIdx && s.polyIndex < stopIdx;
        } else {
          return s.polyIndex > busIdx || s.polyIndex < stopIdx;
        }
      }).length;
    }

    const history = vehicleSpeedHistoryRef.current[vehicleId] || [];
    let speedKmh = 15;
    if (history.length > 0) speedKmh = history.reduce((a, b) => a + b, 0) / history.length;
    if (speedKmh < 10) speedKmh = 10;

    const pureDrivingTime = pathDist / METERS_PER_MIN;
    const stopDwellTime = stopsBetween * 0.5;

    return Math.max(1, Math.ceil(pureDrivingTime + stopDwellTime));
  };

  const processLocationUpdate = (data: LocationUpdateData, alreadyAccepted = false) => {
    if (!alreadyAccepted && !acceptCanonicalState(data)) return;
    if (!mapRef.current) return;

    const id = data.vehicleId;
    const stateLocation = data.serviceState === "live" ? data.liveLocation : data.lastKnownLocation;
    const routeId = data.routeAuthority === "unknown" ? null : data.routeId;

    if (
      data.serviceState === "no_service" ||
      data.serviceState === "unknown" ||
      !stateLocation ||
      !routeId
    ) {
      vehicleRouteMapRef.current[id] = "";
      removeVehicleMarker(id);
      updateMapDerivedState();
      return;
    }

    vehicleRouteMapRef.current[id] = routeId;
    const currentSpeed = Number(stateLocation.speed ?? 15);
    if (data.serviceState === "live") {
      if (!vehicleSpeedHistoryRef.current[id]) vehicleSpeedHistoryRef.current[id] = [];
      vehicleSpeedHistoryRef.current[id].push(currentSpeed);
      if (vehicleSpeedHistoryRef.current[id].length > 5) vehicleSpeedHistoryRef.current[id].shift();
    }

    const rawLat = Number(stateLocation.lat);
    const rawLng = Number(stateLocation.lng);
    const newPos: [number, number] = [rawLat, rawLng];

    // ดึงองศาการหมุนจาก Backend ตรงๆ
    const backendBearing = Number(stateLocation.heading ?? 0);

    // 1. คำนวณ index บน polyline สำหรับ ETA และป้ายถัดไปเท่านั้น (ตำแหน่งรถใช้ GPS ดิบ พร้อม snap เข้าถนน OSM)
    const coords = routeGeometryRef.current[routeId];
    if (coords && coords.length > 0) {
      let currentIdx = vehicleLastPolyIndexRef.current[id] ?? -1;
      let needGlobalSearch = (currentIdx === -1);

      if (!needGlobalSearch) {
        const lastCoord = coords[currentIdx];
        const distFromLast = L.latLng(rawLat, rawLng).distanceTo(L.latLng(lastCoord[0], lastCoord[1]));
        if (distFromLast > 150) needGlobalSearch = true; 
      }

      if (needGlobalSearch) {
        currentIdx = getNearestPointIndex([rawLat, rawLng], coords);
      } else {
        currentIdx = getDirectionalPointIndex([rawLat, rawLng], coords, currentIdx);
      }
      vehicleLastPolyIndexRef.current[id] = currentIdx;
    }

    // Snap GPS เข้าถนนจริงโดยใช้ OSRM Nearest API (snap ไปยัง road network ไม่ใช่ polyline)
    (async () => {
      try {
        const nearestUrl = `https://router.project-osrm.org/nearest/v1/driving/${rawLng},${rawLat}?number=1`;
        const res = await fetch(nearestUrl);
        const nearestData = await res.json();
        if (nearestData.code === 'Ok' && nearestData.waypoints?.[0]?.location) {
          const snappedLng = nearestData.waypoints[0].location[0];
          const snappedLat = nearestData.waypoints[0].location[1];
          newPos[0] = snappedLat;
          newPos[1] = snappedLng;
        }
      } catch {
        // fallback: ใช้ GPS ดิบ
      }
    })();

    // 2. สร้าง Marker รถใหม่ (ดึง HTML จากไฟล์แยกมาใช้)
    if (!vehiclesRef.current[id]) {
      const busHtml = generateBusIconHtml(id, backendBearing, routeId);

      const marker = L.marker(newPos, { 
        icon: L.divIcon({ 
          html: busHtml,
          className: 'bus-marker-tour',
          iconSize: [36, 44], 
          iconAnchor: [18, 22] 
        }) 
      });
      vehiclesRef.current[id] = marker;
      prevPositionsRef.current[id] = newPos;

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
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

        const info = vehicleStopsStatusRef.current[id];
        if (info) setActiveVehicleInfo(info);

        const pos = marker.getLatLng();
        mapRef.current?.flyTo([pos.lat, pos.lng], 19, { animate: true, duration: 0.8 });
      });

      if (vehicleRouteMapRef.current[id] === selectedRouteRef.current) marker.addTo(mapRef.current);
      updateMapDerivedState();
      return;
    }

    // 3. อัปเดต Marker รถที่มีอยู่แล้ว
    const marker = vehiclesRef.current[id];
    if (vehicleRouteMapRef.current[id] === selectedRouteRef.current) {
      if (!mapRef.current.hasLayer(marker)) marker.addTo(mapRef.current);
    } else {
      if (mapRef.current.hasLayer(marker)) { mapRef.current.removeLayer(marker); return; }
    }

    // 4. สั่งหมุนไอคอนเข็มทิศ และหมุนตัวเลขกลับให้ตั้งตรง
    const wrapperEl = document.getElementById(`bus-wrapper-${id}`);
    const textEl = document.getElementById(`bus-text-${id}`);
    if (wrapperEl && textEl) {
      wrapperEl.style.transform = `rotate(${backendBearing}deg)`;
      const snappedBearing = Math.round(backendBearing / 90) * 90;
      textEl.setAttribute('transform', `rotate(${-snappedBearing}, 16, 24)`);
    }

    // 5. ระบบหาป้ายก่อนหน้า / ถัดไป แบบ 1D Index
    const routeStops = stopsByRouteRef.current[routeId] || [];
    let prevStopName = "กำลังประเมิน...";
    let nextStopName = "กำลังประเมิน...";
    let nextStopObj: Stop | null = null;

    const currentIdx = vehicleLastPolyIndexRef.current[id] ?? -1;

    if (routeStops.length > 0 && currentIdx !== -1) {
      let minPositiveDiff = Infinity;
      let prevStopObj: Stop | null = null;

      for (let i = 0; i < routeStops.length; i++) {
        const stop = routeStops[i];
        const stopIdx = stop.polyIndex;
        if (stopIdx === undefined) continue;

        if (!coords) continue;
        let diff = stopIdx - currentIdx;
        if (diff < 0) diff += coords.length; 

        if (diff < minPositiveDiff) {
          minPositiveDiff = diff;
          nextStopObj = stop;
          
          const prevIndex = (i - 1 + routeStops.length) % routeStops.length;
          prevStopObj = routeStops[prevIndex];
        }
      }

      if (prevStopObj) prevStopName = prevStopObj.nameTh || prevStopObj.name || "ไม่ทราบชื่อป้าย";
      if (nextStopObj) nextStopName = nextStopObj.nameTh || nextStopObj.name || "ไม่ทราบชื่อป้าย";
    }

    const etaVal = data.serviceState === "live" && !expiredVehiclesRef.current[id] && nextStopObj
      ? getVehicleETAToStop(id, nextStopObj)
      : null;
    const newInfo = { 
      prev: prevStopName, 
      next: nextStopName, 
      eta: etaVal,
      nextStopId: nextStopObj ? nextStopObj.id : null
    };
    vehicleStopsStatusRef.current[id] = newInfo;

    if (selectedVehicleIdRef.current === id) {
      setActiveVehicleInfo(newInfo);
    }

    // 6. อนิเมชันเลื่อนรถให้เนียนตา
    const oldPos = prevPositionsRef.current[id];
    if (shouldMove(oldPos, newPos)) {
      animateMove(marker, oldPos, newPos);
      prevPositionsRef.current[id] = newPos;
    }

    // Camera Tracking ตามรถที่เลือก
    if (id === selectedVehicleIdRef.current && isTrackingRef.current) {
      mapRef.current?.panTo(newPos, { animate: true, duration: 0.8 });
    }
    
    updateMapDerivedState();
  };
  // === 4. Effects ===
  useEffect(() => {
    calculateETARef.current = calculateETA;
  });

  useEffect(() => {
    processLocationUpdateRef.current = processLocationUpdate;
  });

  const hydrateActiveVehicles = useCallback(async () => {
    type ActiveVehicleResponse = Awaited<ReturnType<typeof getActiveVehicles>>;
    let data: ActiveVehicleResponse = [];
    try {
      data = await getActiveVehicles(configuredBackendOrigin);
    } catch {
      const apiOrigins = (() => {
        const origins: string[] = [];
        const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
        if (isHttps && typeof window !== "undefined") origins.push(window.location.origin);
        if (configuredBackendOrigin) origins.push(configuredBackendOrigin.replace(/\/$/, ""));
        if (!isHttps && typeof window !== "undefined") origins.push(window.location.origin);
        origins.push("http://localhost:3001");
        return [...new Set(origins)];
      })();

      for (const origin of apiOrigins) {
        try {
          const response = await fetch(`${origin}/api/public/active-vehicles`);
          if (response.ok) {
            data = await response.json() as ActiveVehicleResponse;
            break;
          }
        } catch {
          // Try the next configured origin.
        }
      }
    }

    const mapping = data.reduce<Record<string, string>>((acc, vehicle) => {
      acc[String(vehicle.id)] = vehicle.name || String(vehicle.id);
      return acc;
    }, {});
    setVehicleNames(mapping);

    for (const vehicle of data) {
      if (acceptCanonicalState(vehicle.state)) {
        processLocationUpdateRef.current(vehicle.state, true);
      }
    }
    return data;
  }, [configuredBackendOrigin]);

  useEffect(() => {
    const apiOrigins = (() => {
      const origins: string[] = [];
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      if (isHttps && typeof window !== "undefined") origins.push(window.location.origin);
      if (configuredBackendOrigin) origins.push(configuredBackendOrigin.replace(/\/$/, ""));
      if (!isHttps && typeof window !== "undefined") origins.push(window.location.origin);
      origins.push("http://localhost:3001");
      return [...new Set(origins)];
    })();

    const loadRouteData = async (routeId: string, routeColor: string) => {
      try {
        let stops: Stop[] | null = null;
        let lastError: unknown = null;

        for (const origin of apiOrigins) {
          try {
            const stopRes = await fetch(`${origin}/api/public/routes/${routeId}/stops`);
            if (!stopRes.ok) {
              throw new Error(`HTTP ${stopRes.status}`);
            }
            stops = (await stopRes.json()) as Stop[];
            break;
          } catch (error) {
            lastError = error;
          }
        }

        if (!stops) {
          throw new Error(
            `Could not fetch route ${routeId} stops from any backend (${apiOrigins.join(", ")}).`,
            { cause: lastError as Error | undefined }
          );
        }

        const stopLayer = L.layerGroup();
        stopsByRouteRef.current[routeId] = stops;
        setStopsByRoute(prev => ({ ...prev, [routeId]: stops }));

        stops.forEach((stop) => {
          const marker = L.marker([stop.lat, stop.lng], { icon: DEFAULT_STOP_ICON }).addTo(stopLayer);
          stopMarkersMapRef.current[String(stop.id)] = marker;

          marker.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            
            // ปิด Card รถ เพื่อโชว์ Card ป้าย
            setSelectedVehicleId(null);
            selectedVehicleIdRef.current = null;
            setIsTracking(false);
            isTrackingRef.current = false;

            if (activeStopMarkerRef.current) activeStopMarkerRef.current.setIcon(DEFAULT_STOP_ICON);
            marker.setIcon(ACTIVE_STOP_ICON);
            activeStopMarkerRef.current = marker;
            setTargetStop(stop);
            targetStopRef.current = stop;
            calculateETARef.current();
            mapRef.current?.flyTo([stop.lat, stop.lng], 19, { animate: true, duration: 0.8 });
          });
        });

        if (stopLayersRef.current[routeId] && mapRef.current) {
          mapRef.current.removeLayer(stopLayersRef.current[routeId]);
        }
        stopLayersRef.current[routeId] = stopLayer;
        if (routeId === selectedRouteRef.current && mapRef.current) stopLayer.addTo(mapRef.current);

        // Resolution order: OSRM -> LocalStorage -> bundled JSON
        const stopsSignature = createStopsSignature(stops);
        const cacheKey = `rsu-route-cache-${routeId}`;
        let finalCoords: [number, number][] = [];

        // Step 1: OSRM API (online) — ดึง route geometry จากถนนจริง
        if (stops.length > 1) {
          try {
            console.log(`[${routeId}] Fetching route geometry from OSRM...`);
            const points = stops.map((stop) => `${stop.lng},${stop.lat}`);
            points.push(points[0]);
            const osrmRes = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${points.join(";")}?overview=full&geometries=geojson`
            );
            if (!osrmRes.ok) throw new Error(`OSRM returned HTTP ${osrmRes.status}`);

            const osrmData = (await osrmRes.json()) as {
              code?: string;
              routes?: Array<{ geometry?: { coordinates?: unknown } }>;
            };
            const routeCoords = osrmData.routes?.[0]?.geometry?.coordinates;
            if (osrmData.code !== "Ok" || !isCoordinateList(routeCoords)) {
              throw new Error("OSRM did not return valid route geometry");
            }

            finalCoords = routeCoords.map(([lng, lat]) => [lat, lng]);
            const cache: RouteGeometryCache = {
              version: 2,
              signature: stopsSignature,
              source: "osrm",
              createdAt: Date.now(),
              coords: finalCoords,
            };
            localStorage.setItem(cacheKey, JSON.stringify(cache));
          } catch (error) {
            console.warn(`[${routeId}] OSRM unavailable; trying LocalStorage.`, error);
          }
        }

        // Step 2: LocalStorage cache (fallback เมื่อ OSRM ล้มเหลว)
        if (finalCoords.length === 0) {
          const cachedDataStr = localStorage.getItem(cacheKey);
          if (cachedDataStr) {
            try {
              const cachedData = JSON.parse(cachedDataStr) as Partial<RouteGeometryCache>;
              const isFresh = typeof cachedData.createdAt === "number" && Date.now() - cachedData.createdAt < ROUTE_CACHE_TTL_MS;
              if (
                cachedData.version === 2 &&
                cachedData.source === "osrm" &&
                cachedData.signature === stopsSignature &&
                isFresh &&
                isCoordinateList(cachedData.coords)
              ) {
                finalCoords = cachedData.coords;
              }
            } catch {
              localStorage.removeItem(cacheKey);
            }
          }
        }

        // Step 3: bundled JSON (fallback สุดท้าย)
        if (finalCoords.length === 0) {
          try {
            const bundledRouteRes = await fetch(`/data/route-${routeId}.json`);
            const bundledCoords: unknown = bundledRouteRes.ok ? await bundledRouteRes.json() : null;
            if (isCoordinateList(bundledCoords)) finalCoords = bundledCoords;
          } catch (error) {
            console.warn(`[${routeId}] Could not load bundled route geometry.`, error);
          }
        }

        if (finalCoords.length === 0) {
          console.error(`[${routeId}] No valid route geometry is available.`);
        }

        if (finalCoords.length > 0) {
          routeGeometryRef.current[routeId] = finalCoords;

          let currentSearchIdx = 0;
          stops.forEach(stop => {
            let bestIdx = currentSearchIdx;
            let minDst = Infinity;
            for (let i = currentSearchIdx; i < finalCoords.length; i++) {
              const dst = L.latLng(stop.lat, stop.lng).distanceTo(L.latLng(finalCoords[i][0], finalCoords[i][1]));
              if (dst < minDst) { minDst = dst; bestIdx = i; }
            }
            stop.polyIndex = bestIdx;
            currentSearchIdx = bestIdx;
          });

          const routeLayer = L.layerGroup();
          L.polyline(finalCoords, { color: routeColor || "#3B82F6", weight: 5, smoothFactor: 1.5, className: 'neon-path' }).addTo(routeLayer);
          if (routeLayersRef.current[routeId] && mapRef.current) {
            mapRef.current.removeLayer(routeLayersRef.current[routeId]);
          }
          routeLayersRef.current[routeId] = routeLayer;
          
          if (routeId === selectedRouteRef.current && mapRef.current) routeLayer.addTo(mapRef.current);
        }
      } catch (err) {
        console.error(`Failed to load route ${routeId}`, err);
      } finally {
        loadedRoutesRef.current.add(routeId);
        checkLoadingCompleteRef.current();
      }
    };

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
          } catch (e) {
            // next origin
          }
        }
      } catch (err) {
        console.error("Failed to fetch active routes", err);
      }
      
      if (activeRoutes.length === 0) {
         activeRoutes = [

         ];
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
            processLocationUpdateRef.current(state, true);
          });

          mapRef.current.on('zoomstart', (e: L.LeafletEvent & { originalEvent?: unknown }) => { 
            isZoomingRef.current = true; 
            setIsAppLocked(true); 
            if (e.originalEvent) {
              setIsTracking(false);
              isTrackingRef.current = false;
            }
          });
          mapRef.current.on('zoomend', () => { 
            isZoomingRef.current = false; 
            setIsAppLocked(false);
            Object.values(pendingUpdatesRef.current).forEach(data => processLocationUpdateRef.current(data));
            pendingUpdatesRef.current = {};
          });
          mapRef.current.on('dragstart', () => {
            setIsTracking(false);
            isTrackingRef.current = false;
          });
          
          mapRef.current.on("click", () => {
            if (isZoomingRef.current) return;
            if (targetStopRef.current || activeStopMarkerRef.current || selectedVehicleIdRef.current) {
              setTargetStop(null); targetStopRef.current = null;
              if (activeStopMarkerRef.current) { activeStopMarkerRef.current.setIcon(DEFAULT_STOP_ICON); activeStopMarkerRef.current = null; }
              setSelectedVehicleId(null); selectedVehicleIdRef.current = null;
              setIsTracking(false); isTrackingRef.current = false;
              mapRef.current?.flyTo(RSU_CENTER, 16.7, { animate: true, duration: 0.8 });
            }
          });
          
          activeRoutes.forEach(r => loadRouteData(r.id, r.color));
        }
      }

      interval = setInterval(waitForMap, 200);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [LRef, mapRef, configuredBackendOrigin]);

  useEffect(() => {
    const handleZoomCenter = () => {
      if (mapRef.current) {
        // เคลียร์การเลือกต่างๆ
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
        
        // พากล้องร่อนกลับมาจุดศูนย์กลางมหาลัย
        mapRef.current.flyTo(RSU_CENTER, 16.7, {
          animate: true,
          duration: 1.2
        });
      }
    };
  
    window.addEventListener('tour-zoom-center', handleZoomCenter);
    return () => window.removeEventListener('tour-zoom-center', handleZoomCenter);
  }, [mapRef]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos: GeolocationPosition) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLoc(coords);
        if (!mapRef.current) return;
        
        if (!userMarkerRef.current) {
          const userIcon = L.divIcon({ className: "user-loc-marker", html: `<div class="user-pulse"></div>`, iconSize: [20, 20], iconAnchor: [10, 10] });
          userMarkerRef.current = L.marker(coords, { icon: userIcon }).addTo(mapRef.current);
        } else {
          userMarkerRef.current.setLatLng(coords);
        }
      },
      (err) => console.log("GPS Error:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [mapRef]);

  useEffect(() => {
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const socketOrigin = isHttps
      ? (typeof window !== "undefined" ? window.location.origin : "")
      : (configuredBackendOrigin || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001"));
    let disposed = false;
    let socket: Socket | null = null;

    const connectAfterSnapshot = async () => {
      await hydrateActiveVehicles();
      namesLoadedRef.current = true;
      checkLoadingComplete();
      if (disposed) return;

      socket = io(socketOrigin, { autoConnect: false });
      socket.on("connect", () => {
        if (hasConnectedRef.current) void hydrateActiveVehicles();
        hasConnectedRef.current = true;
      });
      socket.on("location-update", (data: LocationUpdateData) => {
        if (!acceptCanonicalState(data)) return;
        if (isZoomingRef.current) {
          pendingUpdatesRef.current[data.vehicleId] = data;
          return;
        }
        processLocationUpdateRef.current(data, true);
      });
      socket.connect();
    };

    void connectAfterSnapshot().catch(() => undefined);
    return () => {
      disposed = true;
      socket?.disconnect();
    };
  }, [configuredBackendOrigin, hydrateActiveVehicles, mapRef]);

  return (
    <div className="h-dvh w-screen overflow-hidden font-body-sm text-on-surface bg-surface map-bg relative select-none">
      {showPreloader && (
      <div className={`preloader-overlay ${isIntroFinished ? "fade-out" : ""}`}>
        <div className="loader-logo" />
        <div className="loader"></div>
      </div>
    )}

    {isAppLocked && (
      <div 
        style={{ position: 'fixed', inset: 0, zIndex: 99999, cursor: 'wait', touchAction: 'none' }} 
        onTouchStart={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />
    )}

      <div className={`w-full h-full relative z-0 transition-all duration-700 ${showPreloader ? 'map-blur-effect' : ''}`}>
        <div id="rsu-map" className="w-full h-full absolute inset-0 z-0" />

        {/* Top Left: Branding */}
        <div className="absolute top-4 left-4 md:top-10 md:left-10 z-10 glass-panel backdrop-blur-sm rounded-full flex items-center gap-2.5 px-4 py-1.5 md:px-6 md:py-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            alt="RSU Logo" 
            className="h-9 md:h-11 w-auto object-contain drop-shadow-sm select-none" 
            src="/icons/RSU_logo.png" 
          />
          <div className="flex flex-col">
            <h1 className="font-headline-md text-[15px] md:text-[18px] text-on-surface leading-tight">
              <span className="hidden sm:inline">Rangsit University</span>
              <span className="sm:hidden">RSU</span>
            </h1>
            <span className="font-body-sm text-[10px] md:text-[12px] text-on-surface-variant leading-none">Tram Tracker</span>
          </div>
        </div>

        {/* Top Right: Controls */}
        <div className="absolute top-4 right-4 md:top-10 md:right-10 z-10 flex flex-col items-stretch gap-3 w-40 md:w-45">
          <AvailabilityCard count={vehicleStateCounts.live} />
          <div className="flex gap-3 w-full relative" ref={routeMenuRef}>
            <div className="route-selector-menu w-full relative">
              <button 
                className="w-full glass-panel backdrop-blur-sm rounded-full py-2 px-4 md:py-2.5 font-headline-md text-[14px] md:text-[15px] transition-all duration-300 cursor-pointer flex items-center justify-between text-on-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] hover:bg-white/40!"
                onClick={() => setIsRouteMenuOpen(!isRouteMenuOpen)}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)]" 
                    style={{ backgroundColor: routes.find(r => r.id === selectedRoute)?.color || "#3B82F6" }}
                  />
                  <span className="truncate max-w-25 md:max-w-30">{routes.find(r => r.id === selectedRoute)?.name || selectedRoute}</span>
                </div>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isRouteMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isRouteMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-panel backdrop-blur-sm rounded-2xl py-2 flex flex-col gap-1 shadow-lg border border-outline-variant/30 overflow-hidden z-50">
                  {routes.map(route => (
                    <button 
                      key={route.id} 
                      className={`w-full px-4 py-2 text-left text-[14px] transition-all duration-200 flex items-center gap-2 ${
                        selectedRoute === route.id 
                          ? "bg-black/5! font-medium" 
                          : "hover:bg-white/40!"
                      }`}
                      onClick={() => {
                        handleRouteChange(route.id);
                        setIsRouteMenuOpen(false);
                      }}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: route.color }}
                      />
                      <span className="truncate">{route.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            className="rsu-feedback-btn w-full glass-panel backdrop-blur-sm rounded-full py-2 text-[13px] md:text-[14px] text-on-surface hover:bg-white/40! hover:scale-[1.02] transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 font-medium border border-outline-variant/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
            onClick={() => handleOpenFeedback(selectedVehicleId)}
          >
            <MessageSquarePlus size={16} className="text-on-surface-variant" />
            <span>ส่งข้อเสนอแนะ</span>
          </button>


        </div>

        {/* Bottom Left: Floating Dock */}
        <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 z-10 w-70 sm:w-[320px] max-w-[calc(100%-32px)] flex flex-col gap-1 md:gap-2">
          {/* โชว์ Stop Info Card เมื่อไม่ได้เลือกรถ */}
          {!selectedVehicleId && (
            <StopInfoCard 
              targetStop={targetStop} 
              eta={realEta} 
            />
          )}

          {/* โชว์ Vehicle Info Card เมื่อเลือกรถ */}
          {selectedVehicleId && activeVehicleInfo && (
            <VehicleInfoCard 
              vehicleId={selectedVehicleId}
              vehicleName={vehicleNames[selectedVehicleId]}
              nextStop={activeVehicleInfo.next}
              stops={stopsByRoute[selectedRoute] || []}
              nextStopId={activeVehicleInfo.nextStopId}
              isTracking={isTracking}
              onRecenter={handleRecenter}
              onFeedbackClick={handleOpenFeedback}
            />
          )}
        </div>

        {/* Bottom Right: Map Controls */}
        <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 z-10 flex flex-col gap-1 md:gap-2">
          <button 
            className="glass-panel backdrop-blur-sm rounded-lg w-9 h-9 flex items-center justify-center text-on-surface hover:bg-white/40! transition-colors cursor-pointer" 
            title="Zoom In"
            onClick={() => mapRef.current?.zoomIn()}
          >
            <Plus size={20} className="text-on-surface" />
          </button>
          <button 
            className="glass-panel backdrop-blur-sm rounded-lg w-9 h-9 flex items-center justify-center text-on-surface hover:bg-white/40! transition-colors cursor-pointer" 
            title="Zoom Out"
            onClick={() => mapRef.current?.zoomOut()}
          >
            <Minus size={20} className="text-on-surface" />
          </button>
          <button 
            className="glass-panel backdrop-blur-sm rounded-lg w-9 h-9 flex items-center justify-center text-on-surface hover:bg-white/40! transition-colors mt-2 cursor-pointer" 
            title="Current Location"
            onClick={handleLocateUser}
          >
            <Locate size={20} className="text-on-surface" />
          </button>
        </div>
      </div>
      <AppTour 
        onInstallClick={handleInstallClick}
        isPwaAvailable={!!deferredPrompt}
      />

      {isFeedbackOpen && (
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          initialVehicleId={feedbackVehicleId}
          apiOrigin={configuredBackendOrigin}
        />
      )}
    </div>
  );
}
