"use client";
import { useCallback } from "react";
import L from "leaflet";
import { Stop, RouteGeometryCache } from "@/types";
import { DEFAULT_STOP_ICON, ROUTE_CACHE_TTL_MS } from "@/constants/shuttle";
import { createStopsSignature, isCoordinateList } from "@/utils/ShuttleHelpers";

interface UseRouteGeometryOptions {
  mapRef: React.RefObject<L.Map | null>;
  LRef: React.RefObject<typeof L | null>;
  setStopsByRoute: React.Dispatch<React.SetStateAction<Record<string, Stop[]>>>;
  onStopSelect: (stop: Stop, marker: L.Marker) => void;
  preloader: {
    loadedRoutesRef: React.MutableRefObject<Set<string>>;
    checkLoadingCompleteRef: React.MutableRefObject<() => void>;
  };
  setSelectedRoute: React.Dispatch<React.SetStateAction<string>>;
  selectedRouteRef: React.MutableRefObject<string>;
  stopsByRouteRef: React.MutableRefObject<Record<string, Stop[]>>;
  routeGeometryRef: React.MutableRefObject<Record<string, [number, number][]>>;
  stopMarkersMapRef: React.MutableRefObject<Record<string, L.Marker>>;
  routeLayersRef: React.MutableRefObject<Record<string, L.LayerGroup>>;
  stopLayersRef: React.MutableRefObject<Record<string, L.LayerGroup>>;
}

export function useRouteGeometry({
  mapRef,
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
}: UseRouteGeometryOptions) {

  const { loadedRoutesRef, checkLoadingCompleteRef } = preloader;

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
            onStopSelect(stop, marker);
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
              if (dst < minDst) {
                minDst = dst;
                bestIdx = i;
              }
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
        loadedRoutesRef.current.add(routeId);
        checkLoadingCompleteRef.current();
      }
    },
    [mapRef, loadedRoutesRef, checkLoadingCompleteRef, onStopSelect, setStopsByRoute, stopsByRouteRef, routeGeometryRef, stopMarkersMapRef, selectedRouteRef, stopLayersRef, routeLayersRef]
  );

  const handleRouteChange = useCallback(
    (routeId: string) => {
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
    },
    [mapRef, setSelectedRoute, selectedRouteRef, routeLayersRef, stopLayersRef]
  );

  return {
    loadRouteData,
    handleRouteChange,
  };
}
