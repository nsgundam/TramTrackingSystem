"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import { RSU_CENTER } from "@/constants";
import { useLeafletMap } from "@/hooks/useLeafletMap";
import { usePreloader } from "@/hooks/usePreloader";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSocketConnection } from "@/hooks/useSocketConnection";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { generateBusIconHtml } from "@/utils/IconHelpers";
import { createStopsSignature, isCoordinateList, getVehicleETAToStop, calculateETAForStop, findPrevNextStops } from "@/utils/ShuttleHelpers";
import { shouldMove, animateMove, getNearestPointIndex, getDirectionalPointIndex } from "@/utils/MapHelpers";
import { Stop, LocationUpdateData, RouteData, RouteGeometryCache, ActiveVehicleInfo } from "@/types";
import { DEFAULT_STOP_ICON, ACTIVE_STOP_ICON, ROUTE_CACHE_TTL_MS } from "@/constants/shuttle";

export function useShuttleTracker() {
  const { mapRef, LRef } = useLeafletMap();
  const configuredBackendOrigin =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "");

  // === UI State ===
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isRouteMenuOpen, setIsRouteMenuOpen] = useState<boolean>(false);
  const routeMenuRef = useRef<HTMLDivElement>(null);

  const [selectedRoute, setSelectedRoute] = useState<string>("R01");
  const [availableCount, setAvailableCount] = useState<number>(0);
  const [targetStop, setTargetStop] = useState<Stop | null>(null);
  const [realEta, setRealEta] = useState<number | null>(null);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(true);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [activeVehicleInfo, setActiveVehicleInfo] = useState<ActiveVehicleInfo | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [stopsByRoute, setStopsByRoute] = useState<Record<string, Stop[]>>({});

  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [feedbackVehicleId, setFeedbackVehicleId] = useState<string | null>(null);
  const [vehicleNames, setVehicleNames] = useState<Record<string, string>>({});

  // === Small Hooks ===
  const { deferredPrompt, handleInstallClick } = usePWAInstall();
  const preloader = usePreloader({ routesLength: routes.length });
  const { userLoc } = useGeolocation(mapRef);

  // === Refs (Background Data) ===
  const selectedRouteRef = useRef<string>("R01");
  const targetStopRef = useRef<Stop | null>(null);
  const selectedVehicleIdRef = useRef<string | null>(null);
  const vehicleStopsStatusRef = useRef<Record<string, ActiveVehicleInfo>>({});
  const isTrackingRef = useRef<boolean>(false);

  const stopsByRouteRef = useRef<Record<string, Stop[]>>({});
  const routeGeometryRef = useRef<Record<string, [number, number][]>>({});

  const vehiclesRef = useRef<Record<string, L.Marker>>({});
  const prevPositionsRef = useRef<Record<string, [number, number]>>({});
  const vehicleSpeedHistoryRef = useRef<Record<string, number[]>>({});
  const vehicleRouteMapRef = useRef<Record<string, string>>({});
  const vehicleLastPolyIndexRef = useRef<Record<string, number>>({});

  const activeStopMarkerRef = useRef<L.Marker | null>(null);
  const stopMarkersMapRef = useRef<Record<string, L.Marker>>({});
  const routeLayersRef = useRef<Record<string, L.LayerGroup>>({});
  const stopLayersRef = useRef<Record<string, L.LayerGroup>>({});

  const isZoomingRef = useRef<boolean>(false);
  const hasInitRoutesRef = useRef<boolean>(false);
  const pendingUpdatesRef = useRef<Record<string, LocationUpdateData>>({});
  const processLocationUpdateRef = useRef<(data: LocationUpdateData) => void>(() => {});
  const calculateETARef = useRef<() => void>(() => {});

  // === Socket Connection ===
  useSocketConnection({
    configuredBackendOrigin,
    mapRef,
    isZoomingRef,
    pendingUpdatesRef,
    processLocationUpdateRef,
  });

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

  // === Core Functions ===

  const loadRouteData = useCallback(
    async (routeId: string, routeColor: string, apiOrigins: string[]) => {
      try {
        let stops: Stop[] | null = null;
        let lastError: unknown = null;

        for (const origin of apiOrigins) {
          try {
            const stopRes = await fetch(`${origin}/api/public/routes/${routeId}/stops`);
            if (!stopRes.ok) throw new Error(`HTTP ${stopRes.status}`);
            stops = (await stopRes.json()) as Stop[];
            break;
          } catch (error) {
            lastError = error;
          }
        }

        if (!stops) {
          console.warn(
            `Could not fetch route ${routeId} stops from any backend (${apiOrigins.join(", ")}).`,
            lastError
          );
          return;
        }

        const stopLayer = L.layerGroup();
        stopsByRouteRef.current[routeId] = stops;
        setStopsByRoute((prev) => ({ ...prev, [routeId]: stops }));

        stops.forEach((stop) => {
          const marker = L.marker([stop.lat, stop.lng], { icon: DEFAULT_STOP_ICON }).addTo(stopLayer);
          stopMarkersMapRef.current[String(stop.id)] = marker;

          marker.on("click", (e) => {
            L.DomEvent.stopPropagation(e);

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
          });
        });

        if (stopLayersRef.current[routeId] && mapRef.current) {
          mapRef.current.removeLayer(stopLayersRef.current[routeId]);
        }
        stopLayersRef.current[routeId] = stopLayer;
        if (routeId === selectedRouteRef.current && mapRef.current)
          stopLayer.addTo(mapRef.current);

        // Resolution order: LocalStorage -> OSRM -> bundled JSON
        const stopsSignature = createStopsSignature(stops);
        const cacheKey = `rsu-route-cache-${routeId}`;
        let finalCoords: [number, number][] = [];

        // Step 1: LocalStorage cache check FIRST
        const cachedDataStr = localStorage.getItem(cacheKey);
        if (cachedDataStr) {
          try {
            const cachedData = JSON.parse(cachedDataStr) as Partial<RouteGeometryCache>;
            const isFresh =
              typeof cachedData.createdAt === "number" &&
              Date.now() - cachedData.createdAt < ROUTE_CACHE_TTL_MS;
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

        // Step 2: OSRM API (only if cache missed)
        if (finalCoords.length === 0 && stops.length > 1) {
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
            console.warn(`[${routeId}] OSRM unavailable; trying bundled JSON fallback.`, error);
          }
        }

        // Step 3: bundled JSON fallback
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
          stops.forEach((stop) => {
            let bestIdx = currentSearchIdx;
            let minDst = Infinity;
            for (let i = currentSearchIdx; i < finalCoords.length; i++) {
              const dst = L.latLng(stop.lat, stop.lng).distanceTo(
                L.latLng(finalCoords[i][0], finalCoords[i][1])
              );
              if (dst < minDst) { minDst = dst; bestIdx = i; }
            }
            stop.polyIndex = bestIdx;
            currentSearchIdx = bestIdx;
          });

          const routeLayer = L.layerGroup();
          L.polyline(finalCoords, {
            color: routeColor || "#3B82F6",
            weight: 5,
            smoothFactor: 1.5,
            className: "neon-path",
          }).addTo(routeLayer);
          if (routeLayersRef.current[routeId] && mapRef.current) {
            mapRef.current.removeLayer(routeLayersRef.current[routeId]);
          }
          routeLayersRef.current[routeId] = routeLayer;

          if (routeId === selectedRouteRef.current && mapRef.current)
            routeLayer.addTo(mapRef.current);
        }
      } catch (err) {
        console.error(`Failed to load route ${routeId}`, err);
      } finally {
        preloader.loadedRoutesRef.current.add(routeId);
        preloader.checkLoadingCompleteRef.current();
      }
    },
    [mapRef, preloader]
  );

  const calculateETA = () => {
    if (!targetStopRef.current || !mapRef.current) {
      setRealEta(null);
      return;
    }
    const eta = calculateETAForStop(targetStopRef.current, selectedRouteRef.current, {
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
  };

  const updateAvailableCount = () => {
    if (!mapRef.current) return;
    const count = Object.values(vehiclesRef.current).filter((marker) =>
      mapRef.current?.hasLayer(marker)
    ).length;
    setAvailableCount(count);
    calculateETA();
  };

  const processLocationUpdate = (data: LocationUpdateData) => {
    if (!mapRef.current) return;

    const id = String(data.vehicleId || data.id);

    const currentSpeed = Number(data.speed ?? data.velocity ?? 15);
    if (!vehicleSpeedHistoryRef.current[id])
      vehicleSpeedHistoryRef.current[id] = [];
    vehicleSpeedHistoryRef.current[id].push(currentSpeed);
    if (vehicleSpeedHistoryRef.current[id].length > 5)
      vehicleSpeedHistoryRef.current[id].shift();

    const rawLat = Number(data.lat);
    const rawLng = Number(data.lng);
    const newPos: [number, number] = [rawLat, rawLng];

    if (!vehicleRouteMapRef.current[id])
      vehicleRouteMapRef.current[id] = selectedRouteRef.current;
    const routeId = vehicleRouteMapRef.current[id];

    const backendBearing = Number(data.bearing ?? data.heading ?? 0);

    // 1. Calculate polyline index for ETA
    const coords = routeGeometryRef.current[routeId];
    if (coords && coords.length > 0) {
      let currentIdx = vehicleLastPolyIndexRef.current[id] ?? -1;
      let needGlobalSearch = currentIdx === -1;

      if (!needGlobalSearch) {
        const lastCoord = coords[currentIdx];
        const distFromLast = L.latLng(rawLat, rawLng).distanceTo(
          L.latLng(lastCoord[0], lastCoord[1])
        );
        if (distFromLast > 150) needGlobalSearch = true;
      }

      if (needGlobalSearch) {
        currentIdx = getNearestPointIndex([rawLat, rawLng], coords);
      } else {
        currentIdx = getDirectionalPointIndex([rawLat, rawLng], coords, currentIdx);
      }
      vehicleLastPolyIndexRef.current[id] = currentIdx;
    }

    // 2. Create new vehicle marker
    if (!vehiclesRef.current[id]) {
      const busHtml = generateBusIconHtml(id, backendBearing, routeId);

      const marker = L.marker(newPos, {
        icon: L.divIcon({
          html: busHtml,
          className: "bus-marker-tour",
          iconSize: [36, 44],
          iconAnchor: [18, 22],
        }),
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

      if (vehicleRouteMapRef.current[id] === selectedRouteRef.current)
        marker.addTo(mapRef.current);
      updateAvailableCount();
      return;
    }

    // 3. Update existing marker
    const marker = vehiclesRef.current[id];
    if (vehicleRouteMapRef.current[id] === selectedRouteRef.current) {
      if (!mapRef.current.hasLayer(marker)) marker.addTo(mapRef.current);
    } else {
      if (mapRef.current.hasLayer(marker)) {
        mapRef.current.removeLayer(marker);
        return;
      }
    }

    // 4. Rotate icon
    const wrapperEl = document.getElementById(`bus-wrapper-${id}`);
    const textEl = document.getElementById(`bus-text-${id}`);
    if (wrapperEl && textEl) {
      wrapperEl.style.transform = `rotate(${backendBearing}deg)`;
      const snappedBearing = Math.round(backendBearing / 90) * 90;
      textEl.setAttribute("transform", `rotate(${-snappedBearing}, 16, 24)`);
    }

    // 5. Find prev/next stops
    const routeStops = stopsByRouteRef.current[routeId] || [];
    const currentIdx = vehicleLastPolyIndexRef.current[id] ?? -1;
    const { prevStopName, nextStopName, nextStopObj } = findPrevNextStops(routeStops, currentIdx, coords);

    const etaVal = nextStopObj ? getVehicleETAToStop(id, nextStopObj, {
      vehicleRouteMap: vehicleRouteMapRef.current,
      routeGeometry: routeGeometryRef.current,
      vehicleLastPolyIndex: vehicleLastPolyIndexRef.current,
      prevPositions: prevPositionsRef.current,
      vehicleSpeedHistory: vehicleSpeedHistoryRef.current,
      stopsByRoute: stopsByRouteRef.current,
    }) : null;

    const newInfo: ActiveVehicleInfo = {
      prev: prevStopName,
      next: nextStopName,
      eta: etaVal,
      nextStopId: nextStopObj ? nextStopObj.id : null,
    };
    vehicleStopsStatusRef.current[id] = newInfo;

    if (selectedVehicleIdRef.current === id) {
      setActiveVehicleInfo(newInfo);
    }

    // 6. Animate movement
    const oldPos = prevPositionsRef.current[id];
    if (shouldMove(oldPos, newPos)) {
      animateMove(marker, oldPos, newPos);
      prevPositionsRef.current[id] = newPos;
    }

    // Camera tracking
    if (id === selectedVehicleIdRef.current && isTrackingRef.current) {
      mapRef.current?.panTo(newPos, { animate: true, duration: 0.8 });
    }

    updateAvailableCount();
  };

  // === Event Handlers ===

  const handleFindNearestStop = () => {
    if (!userLoc)
      return alert("กรุณาเปิดการเข้าถึงตำแหน่งที่ตั้ง (GPS) ในเบราว์เซอร์ของคุณ");
    const currentStops = stopsByRouteRef.current[selectedRouteRef.current] || [];
    if (currentStops.length === 0) return;

    let nearest: Stop | null = null;
    let minDst = Infinity;

    for (const stop of currentStops) {
      const dst = L.latLng(userLoc[0], userLoc[1]).distanceTo(L.latLng(stop.lat, stop.lng));
      if (dst < minDst) { minDst = dst; nearest = stop; }
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
  };

  const handleRouteChange = (routeId: string) => {
    if (!mapRef.current) return;
    setSelectedRoute(routeId);
    selectedRouteRef.current = routeId;

    Object.values(routeLayersRef.current).forEach((layer) =>
      mapRef.current?.removeLayer(layer)
    );
    routeLayersRef.current[routeId]?.addTo(mapRef.current);

    Object.values(stopLayersRef.current).forEach((layer) =>
      mapRef.current?.removeLayer(layer)
    );
    stopLayersRef.current[routeId]?.addTo(mapRef.current);

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

    updateAvailableCount();
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

  const handleOpenFeedback = (vehicleId?: string | null) => {
    setFeedbackVehicleId(vehicleId || null);
    setIsFeedbackOpen(true);
  };

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
    processLocationUpdateRef.current = processLocationUpdate;
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
        preloader.namesLoadedRef.current = true;
        preloader.checkLoadingComplete();
      }
    };
    fetchVehicleNames();
  }, [configuredBackendOrigin, preloader.checkLoadingComplete, getApiOrigins]);

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

      if (activeRoutes.length === 0) {
        activeRoutes = [];
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
          preloader.mapReadyRef.current = true;
          preloader.checkLoadingCompleteRef.current();

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

          activeRoutes.forEach((r) => loadRouteData(r.id, r.color, apiOrigins));
        }
      }

      interval = setInterval(waitForMap, 200);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [LRef, mapRef, configuredBackendOrigin, getApiOrigins, preloader, loadRouteData]);

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
  }, [mapRef]);

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