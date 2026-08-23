import type L from "leaflet";
import {
  prefersReducedMotion,
  startCoordinateAnimation,
  type CancelMotion,
} from "./motion";

type Coordinate = [number, number];

const EARTH_RADIUS_METERS = 6371000;
const DEG_TO_RAD = Math.PI / 180;

function computeDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLng = (lng2 - lng1) * DEG_TO_RAD;
  const lat1Rad = lat1 * DEG_TO_RAD;
  const lat2Rad = lat2 * DEG_TO_RAD;

  const sinHalfDLat = Math.sin(dLat / 2);
  const sinHalfDLng = Math.sin(dLng / 2);

  const a =
    sinHalfDLat * sinHalfDLat +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * sinHalfDLng * sinHalfDLng;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  return EARTH_RADIUS_METERS * c;
}

export function shouldMove(oldPos: Coordinate | undefined, newPos: Coordinate): boolean {
  if (!oldPos || !Number.isFinite(oldPos[0]) || !Number.isFinite(oldPos[1])) return true;
  if (!newPos || !Number.isFinite(newPos[0]) || !Number.isFinite(newPos[1])) return false;
  const dx = oldPos[0] - newPos[0];
  const dy = oldPos[1] - newPos[1];
  return Math.sqrt(dx * dx + dy * dy) > 0.00003;
}

export function animateMove(
  marker: L.Marker,
  start: Coordinate,
  end: Coordinate,
  duration = 2800,
): CancelMotion {
  return startCoordinateAnimation({
    start,
    end,
    durationMs: duration,
    reducedMotion: prefersReducedMotion(),
    write: (position) => marker.setLatLng(position),
  });
}

// ฟังก์ชันเดิม (ใช้ตอนเริ่มหาตำแหน่งครั้งแรก)
export function getNearestPointIndex(pos: Coordinate, coords: Coordinate[]): number {
  if (!coords || !Array.isArray(coords) || coords.length === 0) return 0;
  if (coords.length === 1) return 0;
  if (!pos || !Number.isFinite(pos[0]) || !Number.isFinite(pos[1])) return 0;

  let minDst = Infinity;
  let minIdx = 0;

  for (let i = 0; i < coords.length; i++) {
    const coord = coords[i];
    if (!coord || !Number.isFinite(coord[0]) || !Number.isFinite(coord[1])) continue;
    const dst = computeDistanceMeters(pos[0], pos[1], coord[0], coord[1]);
    if (dst < minDst) {
      minDst = dst;
      minIdx = i;
    }
  }
  return minIdx;
}

// 🚀 ฟังก์ชันใหม่: ล็อกทิศทาง ค้นหาเฉพาะจุดที่อยู่ข้างหน้า (แก้ปัญหาเลนสวนกัน)
export function getDirectionalPointIndex(pos: Coordinate, coords: Coordinate[], lastIdx: number): number {
  if (!coords || !Array.isArray(coords) || coords.length === 0) return 0;
  if (coords.length === 1) return 0;
  if (!pos || !Number.isFinite(pos[0]) || !Number.isFinite(pos[1])) return 0;
  if (
    typeof lastIdx !== "number" ||
    !Number.isFinite(lastIdx) ||
    !Number.isInteger(lastIdx) ||
    lastIdx < 0 ||
    lastIdx >= coords.length
  ) {
    return getNearestPointIndex(pos, coords);
  }

  let minDst = Infinity;
  let bestIdx = lastIdx;
  const total = coords.length;

  for (let i = -5; i <= 15; i++) {
    const checkIdx = ((lastIdx + i) % total + total) % total;
    const target = coords[checkIdx];
    if (!target || !Number.isFinite(target[0]) || !Number.isFinite(target[1])) continue;
    const dst = computeDistanceMeters(pos[0], pos[1], target[0], target[1]);
    if (dst < minDst) {
      minDst = dst;
      bestIdx = checkIdx;
    }
  }

  // ถ้ารถวาร์ปไปไกลมาก (เกิน 100 เมตร) อาจจะเพราะเริ่มรอบใหม่ ให้รีเซ็ตกลับไปหาแบบปกติ
  if (minDst > 100) {
    return getNearestPointIndex(pos, coords);
  }

  return bestIdx;
}
