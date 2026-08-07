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

export interface PublicAvailabilityPresentation {
  label: string;
  value: string;
  tone: AvailabilityTone;
  isLive: boolean;
}

interface PublicAvailabilityInput {
  counts: CanonicalVehicleStateCounts;
  connectionState: RealtimeConnectionState;
  hasAuthoritativeState: boolean;
}

export const getPublicAvailabilityPresentation = ({
  counts,
  connectionState,
  hasAuthoritativeState,
}: PublicAvailabilityInput): PublicAvailabilityPresentation => {
  if (connectionState === "reconnecting") {
    return {
      label: "กำลังเชื่อมต่อใหม่",
      value: "—",
      tone: "warning",
      isLive: false,
    };
  }

  if (connectionState === "disconnected") {
    return {
      label: "ข้อมูลสดไม่พร้อม",
      value: "—",
      tone: "unavailable",
      isLive: false,
    };
  }

  if (!hasAuthoritativeState) {
    return {
      label: "กำลังรอข้อมูลรถ",
      value: "—",
      tone: "neutral",
      isLive: false,
    };
  }

  if (counts.live > 0) {
    return {
      label: "Active Trams",
      value: `${counts.live} คัน`,
      tone: "live",
      isLive: true,
    };
  }

  if (counts.stale > 0) {
    return {
      label: "ข้อมูลตำแหน่งล่าช้า",
      value: `${counts.stale} คัน`,
      tone: "warning",
      isLive: false,
    };
  }

  if (counts.no_service > 0) {
    return {
      label: "ยังไม่มีสัญญาณรถ",
      value: `${counts.no_service} คัน`,
      tone: "unavailable",
      isLive: false,
    };
  }

  if (counts.unknown > 0) {
    return {
      label: "ตรวจสอบสถานะไม่ได้",
      value: `${counts.unknown} คัน`,
      tone: "unavailable",
      isLive: false,
    };
  }

  return {
    label: "ไม่มีรถที่กำลังให้บริการ",
    value: "0 คัน",
    tone: "neutral",
    isLive: false,
  };
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
