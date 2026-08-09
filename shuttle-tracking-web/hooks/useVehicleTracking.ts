"use client";
import { useCallback, useEffect } from "react";
import L from "leaflet";
import { Stop, LocationUpdateData, ActiveVehicleInfo } from "@/types";
import { generateBusIconHtml } from "@/utils/IconHelpers";
import { getNearestPointIndex, getDirectionalPointIndex, shouldMove, animateMove } from "@/utils/MapHelpers";
import { findPrevNextStops, getVehicleETAToStop } from "@/utils/ShuttleHelpers";
import {
  cancelAllOwnedMotions,
  cancelOwnedMotion,
  replaceOwnedMotion,
  type OwnedMotionRegistry,
} from "@/utils/motion";

interface UseVehicleTrackingOptions {
  mapRef: React.RefObject<L.Map | null>;
  selectedRouteRef: React.MutableRefObject<string>;
  routeGeometryRef: React.RefObject<Record<string, [number, number][]>>;
  stopsByRouteRef: React.RefObject<Record<string, Stop[]>>;
  onVehicleSelect: (id: string, marker: L.Marker, info?: ActiveVehicleInfo) => void;
  onVehicleUpdate: (id: string, info: ActiveVehicleInfo) => void;
  onCameraTrack: (id: string, pos: [number, number]) => void;
  updateAvailableCount: () => void;
  vehiclesRef: React.MutableRefObject<Record<string, L.Marker>>;
  prevPositionsRef: React.MutableRefObject<Record<string, [number, number]>>;
  vehicleSpeedHistoryRef: React.MutableRefObject<Record<string, number[]>>;
  vehicleRouteMapRef: React.MutableRefObject<Record<string, string>>;
  vehicleLastPolyIndexRef: React.MutableRefObject<Record<string, number>>;
  vehicleStopsStatusRef: React.MutableRefObject<Record<string, ActiveVehicleInfo>>;
  expiredVehiclesRef: React.MutableRefObject<Record<string, boolean>>;
  vehicleAnimationsRef: React.MutableRefObject<OwnedMotionRegistry>;
}

export function useVehicleTracking({
  mapRef,
  selectedRouteRef,
  routeGeometryRef,
  stopsByRouteRef,
  onVehicleSelect,
  onVehicleUpdate,
  onCameraTrack,
  updateAvailableCount,
  vehiclesRef,
  prevPositionsRef,
  vehicleSpeedHistoryRef,
  vehicleRouteMapRef,
  vehicleLastPolyIndexRef,
  vehicleStopsStatusRef,
  expiredVehiclesRef,
  vehicleAnimationsRef,
}: UseVehicleTrackingOptions) {

  useEffect(
    () => () => cancelAllOwnedMotions(vehicleAnimationsRef.current),
    [vehicleAnimationsRef],
  );

  const processLocationUpdate = useCallback(
    (data: LocationUpdateData) => {
      if (!mapRef.current) return;

      const id = data.vehicleId;
      const stateLocation = data.serviceState === "live"
        ? data.liveLocation
        : data.serviceState === "stale"
          ? data.lastKnownLocation
          : null;
      const routeId = data.routeAuthority === "unknown" ? null : data.routeId;

      if (!stateLocation || !routeId) {
        cancelOwnedMotion(vehicleAnimationsRef.current, id);
        vehicleRouteMapRef.current[id] = "";
        const marker = vehiclesRef.current[id];
        if (marker && mapRef.current.hasLayer(marker)) mapRef.current.removeLayer(marker);
        const unavailableInfo: ActiveVehicleInfo = {
          prev: "ไม่พร้อมให้บริการ",
          next: "ไม่พร้อมให้บริการ",
          eta: null,
          nextStopId: null,
        };
        vehicleStopsStatusRef.current[id] = unavailableInfo;
        onVehicleUpdate(id, unavailableInfo);
        updateAvailableCount();
        return;
      }

      const currentSpeed = Number(stateLocation.speed ?? 15);
      if (data.serviceState === "live") {
        if (!vehicleSpeedHistoryRef.current[id])
          vehicleSpeedHistoryRef.current[id] = [];
        vehicleSpeedHistoryRef.current[id].push(currentSpeed);
        if (vehicleSpeedHistoryRef.current[id].length > 5)
          vehicleSpeedHistoryRef.current[id].shift();
      }

      const rawLat = Number(stateLocation.lat);
      const rawLng = Number(stateLocation.lng);
      const newPos: [number, number] = [rawLat, rawLng];
      vehicleRouteMapRef.current[id] = routeId;

      if (data.serviceState !== "live" || expiredVehiclesRef.current[id]) {
        cancelOwnedMotion(vehicleAnimationsRef.current, id);
        const marker = vehiclesRef.current[id];
        if (marker && mapRef.current.hasLayer(marker)) mapRef.current.removeLayer(marker);
        const unavailableInfo: ActiveVehicleInfo = {
          prev: "ไม่พร้อมให้บริการ",
          next: "ไม่พร้อมให้บริการ",
          eta: null,
          nextStopId: null,
        };
        vehicleStopsStatusRef.current[id] = unavailableInfo;
        onVehicleUpdate(id, unavailableInfo);
        updateAvailableCount();
        return;
      }

      const backendBearing = Number(stateLocation.heading ?? 0);

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
        cancelOwnedMotion(vehicleAnimationsRef.current, id);
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
        marker.setOpacity(1);

        marker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          const info = vehicleStopsStatusRef.current[id];
          onVehicleSelect(id, marker, info);
        });

        if (vehicleRouteMapRef.current[id] === selectedRouteRef.current)
          marker.addTo(mapRef.current);
        updateAvailableCount();
        return;
      }

      // 3. Update existing marker
      const marker = vehiclesRef.current[id];
      marker.setOpacity(1);
      if (vehicleRouteMapRef.current[id] === selectedRouteRef.current) {
        if (!mapRef.current.hasLayer(marker)) marker.addTo(mapRef.current);
      } else {
        if (mapRef.current.hasLayer(marker)) {
          cancelOwnedMotion(vehicleAnimationsRef.current, id);
          marker.setLatLng(newPos);
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

      const etaVal = data.serviceState === "live" && !expiredVehiclesRef.current[id] && nextStopObj
        ? getVehicleETAToStop(id, nextStopObj, {
            vehicleRouteMap: vehicleRouteMapRef.current,
            routeGeometry: routeGeometryRef.current,
            vehicleLastPolyIndex: vehicleLastPolyIndexRef.current,
            prevPositions: prevPositionsRef.current,
            vehicleSpeedHistory: vehicleSpeedHistoryRef.current,
            stopsByRoute: stopsByRouteRef.current,
          })
        : null;

      const newInfo: ActiveVehicleInfo = {
        prev: prevStopName,
        next: nextStopName,
        eta: etaVal,
        nextStopId: nextStopObj ? nextStopObj.id : null,
      };
      vehicleStopsStatusRef.current[id] = newInfo;

      onVehicleUpdate(id, newInfo);

      // 6. Animate movement
      const oldPos = prevPositionsRef.current[id];
      if (shouldMove(oldPos, newPos)) {
        const currentPosition = marker.getLatLng();
        replaceOwnedMotion(vehicleAnimationsRef.current, id, () => animateMove(
          marker,
          [currentPosition.lat, currentPosition.lng],
          newPos,
        ));
        prevPositionsRef.current[id] = newPos;
      }

      // Camera tracking
      if (data.serviceState === "live") onCameraTrack(id, newPos);

      updateAvailableCount();
    },
    [
      mapRef,
      selectedRouteRef,
      routeGeometryRef,
      stopsByRouteRef,
      onVehicleSelect,
      onVehicleUpdate,
      onCameraTrack,
      updateAvailableCount,
      vehiclesRef,
      prevPositionsRef,
      vehicleSpeedHistoryRef,
      vehicleRouteMapRef,
      vehicleLastPolyIndexRef,
      vehicleStopsStatusRef,
      expiredVehiclesRef,
      vehicleAnimationsRef,
    ]
  );

  return {
    processLocationUpdate,
  };
}
