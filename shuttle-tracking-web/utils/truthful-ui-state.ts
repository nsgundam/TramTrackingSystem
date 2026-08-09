import type {
  CanonicalLocation,
  CanonicalServiceState,
  CanonicalVehicleStateV1,
  RealtimeConnectionState,
} from "../types/canonical-state";
import { isCanonicalStateNewer } from "../types/canonical-state";

type CanonicalVehicleStateCounts = Record<CanonicalServiceState, number>;

export interface IdentifiedVehicle {
  id: string;
}

export const resolveVerifiedFeedbackVehicleId = (
  initialVehicleId: string | null | undefined,
  vehicles: readonly IdentifiedVehicle[],
): string => {
  if (!initialVehicleId) return "";
  return vehicles.some((vehicle) => vehicle.id === initialVehicleId) ? initialVehicleId : "";
};

export type AvailabilityTone = "live" | "warning" | "unavailable" | "neutral";
export type PublicVehicleSnapshotState = "loading" | "ready" | "error";
export type PublicAvailabilityReason =
  | "reconnecting"
  | "disconnected"
  | "snapshot_error"
  | "waiting"
  | "live"
  | "stale"
  | "no_service"
  | "unknown"
  | "empty";

export interface PublicAvailabilityPresentation {
  reason: PublicAvailabilityReason;
  label: string;
  value: string;
  tone: AvailabilityTone;
  isLive: boolean;
  detail: string | null;
  lastUpdateText: string | null;
  canRetry: boolean;
}

export interface PublicAvailabilityStateInput {
  counts: CanonicalVehicleStateCounts;
  connectionState: RealtimeConnectionState;
  hasAuthoritativeState: boolean;
  snapshotState: PublicVehicleSnapshotState;
}

export interface PublicAvailabilityInput extends PublicAvailabilityStateInput {
  lastCanonicalUpdateAt: string | null;
  nowMs?: number;
}

export const formatPublicLastUpdate = (
  selectedAt: string | null,
  nowMs: number,
): string | null => {
  if (!selectedAt || !Number.isFinite(nowMs)) return null;
  const selectedAtMs = Date.parse(selectedAt);
  if (!Number.isFinite(selectedAtMs)) return null;

  const ageMs = Math.max(0, nowMs - selectedAtMs);
  const ageMinutes = Math.floor(ageMs / 60_000);
  if (ageMinutes < 1) return "อัปเดตล่าสุดไม่ถึง 1 นาที";
  if (ageMinutes < 60) return `อัปเดตล่าสุด ${ageMinutes} นาทีที่แล้ว`;

  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) return `อัปเดตล่าสุด ${ageHours} ชั่วโมงที่แล้ว`;

  const ageDays = Math.floor(ageHours / 24);
  return `อัปเดตล่าสุด ${ageDays} วันที่แล้ว`;
};

export const selectLatestCanonicalUpdateAt = (
  current: string | null,
  candidate: string,
): string | null => {
  const candidateMs = Date.parse(candidate);
  if (!Number.isFinite(candidateMs)) return current;

  if (!current) return candidate;
  const currentMs = Date.parse(current);
  if (!Number.isFinite(currentMs) || candidateMs > currentMs) return candidate;
  return current;
};

export const getPublicAvailabilityReason = ({
  counts,
  connectionState,
  hasAuthoritativeState,
  snapshotState,
}: PublicAvailabilityStateInput): PublicAvailabilityReason => {
  if (connectionState === "reconnecting") return "reconnecting";
  if (connectionState === "disconnected") return "disconnected";
  if (!hasAuthoritativeState && snapshotState === "error") return "snapshot_error";
  if (!hasAuthoritativeState) return "waiting";
  if (counts.live > 0) return "live";
  if (counts.stale > 0) return "stale";
  if (counts.no_service > 0) return "no_service";
  if (counts.unknown > 0) return "unknown";
  return "empty";
};

export const getPublicAvailabilityPresentation = ({
  counts,
  connectionState,
  hasAuthoritativeState,
  snapshotState,
  lastCanonicalUpdateAt,
  nowMs = Date.now(),
}: PublicAvailabilityInput): PublicAvailabilityPresentation => {
  const reason = getPublicAvailabilityReason({
    counts,
    connectionState,
    hasAuthoritativeState,
    snapshotState,
  });
  const lastUpdateText = formatPublicLastUpdate(lastCanonicalUpdateAt, nowMs);

  if (reason === "reconnecting") {
    return {
      reason,
      label: "กำลังเชื่อมต่อใหม่",
      value: "—",
      tone: "warning",
      isLive: false,
      detail: snapshotState === "error" && !hasAuthoritativeState
        ? "ยังไม่มีสถานะรถที่ยืนยันได้ ระบบกำลังเชื่อมต่อใหม่"
        : "ระบบกำลังเรียกข้อมูลสดกลับมา",
      lastUpdateText,
      canRetry: snapshotState === "error",
    };
  }

  if (reason === "disconnected") {
    return {
      reason,
      label: "ข้อมูลสดไม่พร้อม",
      value: "—",
      tone: "unavailable",
      isLive: false,
      detail: "ระบบจะลองเชื่อมต่อข้อมูลสดอีกครั้งอัตโนมัติ",
      lastUpdateText,
      canRetry: true,
    };
  }

  if (reason === "snapshot_error") {
    return {
      reason,
      label: "โหลดสถานะล่าสุดไม่สำเร็จ",
      value: "—",
      tone: "unavailable",
      isLive: false,
      detail: "ยังไม่มีสถานะรถที่ยืนยันได้",
      lastUpdateText: null,
      canRetry: true,
    };
  }

  if (reason === "waiting") {
    return {
      reason,
      label: "กำลังรอข้อมูลรถ",
      value: "—",
      tone: "neutral",
      isLive: false,
      detail: "กำลังโหลดสถานะล่าสุด",
      lastUpdateText: null,
      canRetry: false,
    };
  }

  if (reason === "live") {
    return {
      reason,
      label: "Active Trams",
      value: `${counts.live} คัน`,
      tone: "live",
      isLive: true,
      detail: null,
      lastUpdateText,
      canRetry: false,
    };
  }

  if (reason === "stale") {
    return {
      reason,
      label: "ข้อมูลตำแหน่งล่าช้า",
      value: `${counts.stale} คัน`,
      tone: "warning",
      isLive: false,
      detail: "แสดงสถานะล่าสุดที่ระบบยืนยันได้",
      lastUpdateText,
      canRetry: false,
    };
  }

  if (reason === "no_service") {
    return {
      reason,
      label: "ยังไม่มีตำแหน่งรถ",
      value: `${counts.no_service} คัน`,
      tone: "unavailable",
      isLive: false,
      detail: "ระบบยังไม่มีตำแหน่งที่ยืนยันได้",
      lastUpdateText,
      canRetry: false,
    };
  }

  if (reason === "unknown") {
    return {
      reason,
      label: "ตรวจสอบสถานะไม่ได้",
      value: `${counts.unknown} คัน`,
      tone: "unavailable",
      isLive: false,
      detail: "ระบบยังยืนยันสถานะรถไม่ได้",
      lastUpdateText,
      canRetry: false,
    };
  }

  return {
    reason,
    label: "ไม่มีรถที่กำลังให้บริการ",
    value: "0 คัน",
    tone: "neutral",
    isLive: false,
    detail: "ตรวจสอบแล้วและไม่พบรถที่ให้บริการ",
    lastUpdateText: null,
    canRetry: false,
  };
};

export interface PublicEtaPresentation {
  value: number | null;
  statusText: string;
  tone: AvailabilityTone;
}

export const getPublicEtaPresentation = (
  eta: number | null,
  availabilityReason: PublicAvailabilityReason,
): PublicEtaPresentation => {
  if (availabilityReason === "reconnecting") {
    return { value: null, statusText: "ETA รอข้อมูลสด", tone: "warning" };
  }
  if (availabilityReason === "disconnected") {
    return { value: null, statusText: "ETA รอข้อมูลสด", tone: "unavailable" };
  }
  if (availabilityReason === "snapshot_error" || availabilityReason === "waiting") {
    return { value: null, statusText: "ETA ยังไม่พร้อม", tone: "unavailable" };
  }
  if (availabilityReason === "stale") {
    return { value: null, statusText: "ข้อมูลรถล่าช้า", tone: "warning" };
  }
  if (availabilityReason === "no_service") {
    return { value: null, statusText: "ยังไม่มี ETA ที่ยืนยันได้", tone: "unavailable" };
  }
  if (availabilityReason === "unknown") {
    return { value: null, statusText: "ตรวจสอบ ETA ไม่ได้", tone: "unavailable" };
  }
  if (availabilityReason === "empty" || eta === null || !Number.isFinite(eta) || eta < 0) {
    return { value: null, statusText: "ยังไม่มี ETA สำหรับป้ายนี้", tone: "neutral" };
  }
  if (eta === 0) {
    return { value: 0, statusText: "กำลังมาถึง!", tone: "live" };
  }
  return { value: eta, statusText: "กำลังเดินทาง", tone: "live" };
};

export const getCanonicalExpiryDelayMs = (
  state: CanonicalVehicleStateV1,
): number | null => {
  if (state.serviceState !== "live") return null;
  return Math.max(0, state.freshness.thresholdMs - (state.freshness.ageMs ?? 0));
};

export interface CanonicalDisplayState {
  serviceState: CanonicalServiceState;
  location: CanonicalLocation | null;
  isLocallyExpired: boolean;
}

export const getCanonicalDisplayState = (
  state: CanonicalVehicleStateV1,
  isLocallyExpired: boolean,
): CanonicalDisplayState => {
  if (state.serviceState === "live" && isLocallyExpired) {
    return {
      serviceState: "stale",
      location: state.lastKnownLocation ?? state.liveLocation,
      isLocallyExpired: true,
    };
  }

  return {
    serviceState: state.serviceState,
    location: state.serviceState === "live"
      ? state.liveLocation
      : state.serviceState === "stale"
        ? state.lastKnownLocation
        : null,
    isLocallyExpired: false,
  };
};

export const reconcileCanonicalVehicleSnapshot = (
  snapshotStates: readonly CanonicalVehicleStateV1[],
  queuedStates: readonly CanonicalVehicleStateV1[],
): Record<string, CanonicalVehicleStateV1> => {
  const reconciled = snapshotStates.reduce<Record<string, CanonicalVehicleStateV1>>(
    (states, state) => {
      const existing = states[state.vehicleId];
      if (!existing || isCanonicalStateNewer(state, existing)) {
        states[state.vehicleId] = state;
      }
      return states;
    },
    {},
  );

  queuedStates.forEach((state) => {
    const existing = reconciled[state.vehicleId];
    if (!existing || isCanonicalStateNewer(state, existing)) {
      reconciled[state.vehicleId] = state;
    }
  });

  return reconciled;
};
