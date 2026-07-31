import type { CanonicalServiceState, CanonicalVehicleStateV1 } from "@/types";

export type CanonicalVehicleStateCounts = Record<CanonicalServiceState, number>;

export const projectCanonicalVehicleStateCounts = (
  vehicleStates: Record<string, CanonicalVehicleStateV1>,
  expiredVehicles: Record<string, boolean>,
): CanonicalVehicleStateCounts => Object.values(vehicleStates).reduce<CanonicalVehicleStateCounts>(
  (counts, vehicleState) => {
    const displayState = vehicleState.serviceState === "live" && expiredVehicles[vehicleState.vehicleId]
      ? "stale"
      : vehicleState.serviceState;
    counts[displayState] += 1;
    return counts;
  },
  { live: 0, stale: 0, no_service: 0, unknown: 0 },
);

export const canDisplayCanonicalVehicleMarker = (
  state: CanonicalVehicleStateV1 | undefined,
  selectedRouteId: string,
  isLocallyExpired: boolean,
): boolean => state?.serviceState === "live"
  && state.routeAuthority !== "unknown"
  && state.routeId === selectedRouteId
  && !isLocallyExpired;
