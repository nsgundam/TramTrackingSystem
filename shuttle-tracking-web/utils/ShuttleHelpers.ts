import L from "leaflet";
import { Stop } from "@/types";
import { METERS_PER_MIN } from "@/constants/shuttle";

// ===== Helpers ที่ 1: createStopsSignature =====
export const createStopsSignature = (stops: Stop[]): string =>
  stops
    .map((stop, index) => `${index}:${stop.id}:${stop.lat.toFixed(6)}:${stop.lng.toFixed(6)}`)
    .join("|");

// ===== Helpers ที่ 2: isCoordinateList =====
export const isCoordinateList = (value: unknown): value is [number, number][] =>
  Array.isArray(value) &&
  value.length > 1 &&
  value.every(
    (point) =>
      Array.isArray(point) && point.length === 2 && point.every(Number.isFinite)
  );

// ===== Helpers ที่ 3: calcPolylineDistance =====
export const calcPolylineDistance = (
  coords: [number, number][],
  startIdx: number,
  endIdx: number
): number => {
  let d = 0;
  for (let i = startIdx; i < endIdx; i++) {
    d += L.latLng(coords[i]).distanceTo(L.latLng(coords[i + 1]));
  }
  return d;
};

// ===== Helpers ที่ 4: getVehicleETAToStop =====
interface EtaDeps {
  vehicleRouteMap: Record<string, string>;
  routeGeometry: Record<string, [number, number][]>;
  vehicleLastPolyIndex: Record<string, number>;
  prevPositions: Record<string, [number, number]>;
  vehicleSpeedHistory: Record<string, number[]>;
  stopsByRoute: Record<string, Stop[]>;
}

export const getVehicleETAToStop = (
  vehicleId: string,
  stop: Stop,
  deps: EtaDeps
): number | null => {
  const routeId = deps.vehicleRouteMap[vehicleId];
  const coords = deps.routeGeometry[routeId];
  if (!coords || coords.length === 0) return null;

  const busIdx = deps.vehicleLastPolyIndex[vehicleId];
  const stopIdx = stop.polyIndex;
  if (busIdx === undefined || busIdx === -1 || stopIdx === undefined) return null;

  const pos = deps.prevPositions[vehicleId];
  const physicalDist = pos
    ? L.latLng(pos[0], pos[1]).distanceTo(L.latLng(stop.lat, stop.lng))
    : Infinity;

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
      pathDist = calcPolylineDistance(coords, busIdx, stopIdx);
    } else {
      pathDist =
        calcPolylineDistance(coords, busIdx, coords.length - 1) +
        calcPolylineDistance(coords, 0, stopIdx);
    }
    const routeStops = deps.stopsByRoute[routeId] || [];
    stopsBetween = routeStops.filter((s) => {
      if (s.polyIndex === undefined) return false;
      if (busIdx <= stopIdx) {
        return s.polyIndex > busIdx && s.polyIndex < stopIdx;
      } else {
        return s.polyIndex > busIdx || s.polyIndex < stopIdx;
      }
    }).length;
  }

  const history = deps.vehicleSpeedHistory[vehicleId] || [];
  let speedKmh = 15;
  if (history.length > 0)
    speedKmh = history.reduce((a, b) => a + b, 0) / history.length;
  if (speedKmh < 10) speedKmh = 10;

  const pureDrivingTime = pathDist / METERS_PER_MIN;
  const stopDwellTime = stopsBetween * 0.5;

  return Math.max(1, Math.ceil(pureDrivingTime + stopDwellTime));
};

// ===== Helpers ที่ 5: calculateETA =====
interface EtaCalcDeps extends EtaDeps {
  vehicles: Record<string, L.Marker>;
  map: L.Map | null;
}

export const calculateETAForStop = (
  targetStop: Stop,
  routeId: string,
  deps: EtaCalcDeps
): number | null => {
  const coords = deps.routeGeometry[routeId];
  const stops = deps.stopsByRoute[routeId] || [];
  let minEtaMinutes = Infinity;

  if (!coords || coords.length === 0) return null;

  Object.keys(deps.vehicles).forEach((id) => {
    if (
      deps.vehicleRouteMap[id] !== routeId ||
      !deps.map?.hasLayer(deps.vehicles[id])
    )
      return;

    const busIdx = deps.vehicleLastPolyIndex[id];
    const stopIdx = targetStop.polyIndex;

    if (busIdx === undefined || busIdx === -1 || stopIdx === undefined) return;

    const pos = deps.prevPositions[id];
    const physicalDist = pos
      ? L.latLng(pos[0], pos[1]).distanceTo(L.latLng(targetStop.lat, targetStop.lng))
      : Infinity;

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
        pathDist = calcPolylineDistance(coords, busIdx, stopIdx);
      } else {
        pathDist =
          calcPolylineDistance(coords, busIdx, coords.length - 1) +
          calcPolylineDistance(coords, 0, stopIdx);
      }

      stopsBetween = stops.filter((s) => {
        if (s.polyIndex === undefined) return false;
        if (busIdx <= stopIdx) {
          return s.polyIndex > busIdx && s.polyIndex < stopIdx;
        } else {
          return s.polyIndex > busIdx || s.polyIndex < stopIdx;
        }
      }).length;
    }

    const history = deps.vehicleSpeedHistory[id] || [];
    let speedKmh = 15;
    if (history.length > 0)
      speedKmh = history.reduce((a, b) => a + b, 0) / history.length;
    if (speedKmh < 10) speedKmh = 10;

    const pureDrivingTime = pathDist / METERS_PER_MIN;
    const stopDwellTime = stopsBetween * 0.5;

    const etaMinutes = Math.max(1, Math.ceil(pureDrivingTime + stopDwellTime));
    if (etaMinutes < minEtaMinutes) minEtaMinutes = etaMinutes;
  });

  return minEtaMinutes === Infinity ? null : minEtaMinutes;
};

// ===== Helpers ที่ 6: findPrevNextStops =====
export const findPrevNextStops = (
  routeStops: Stop[],
  currentIdx: number,
  coords?: [number, number][]
): { prevStopName: string; nextStopName: string; nextStopObj: Stop | null } => {
  if (routeStops.length === 0 || currentIdx === -1) {
    return {
      prevStopName: "กำลังประเมิน...",
      nextStopName: "กำลังประเมิน...",
      nextStopObj: null,
    };
  }

  let minPositiveDiff = Infinity;
  let prevStopObj: Stop | null = null;
  let nextStopObj: Stop | null = null;
  let prevStopName = "กำลังประเมิน...";
  let nextStopName = "กำลังประเมิน...";

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

  if (prevStopObj)
    prevStopName = prevStopObj.nameTh || prevStopObj.name || "ไม่ทราบชื่อป้าย";
  if (nextStopObj)
    nextStopName = nextStopObj.nameTh || nextStopObj.name || "ไม่ทราบชื่อป้าย";

  return { prevStopName, nextStopName, nextStopObj };
};