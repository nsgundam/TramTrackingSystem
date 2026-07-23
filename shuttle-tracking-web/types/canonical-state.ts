export const CANONICAL_SCHEMA_VERSION = 1 as const;

export type CanonicalServiceState = "live" | "stale" | "no_service" | "unknown";
export type CanonicalRouteAuthority = "active_trip" | "vehicle_assignment" | "unknown";
export type CanonicalSourceType = "mobile" | "esp32" | "lorawan" | "simulator";
export type CanonicalReasonCode =
  | "CANONICAL_SELECTED"
  | "FALLBACK_SOURCE_SELECTED"
  | "ALL_SOURCES_STALE"
  | "SOURCE_NEVER_SEEN"
  | "NO_ACTIVE_SOURCE"
  | "DEPENDENCY_UNAVAILABLE"
  | "RECOVERED";

export interface CanonicalLocation {
  lat: number;
  lng: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  station: string | null;
}

export interface CanonicalVehicleStateV1 {
  schemaVersion: 1;
  eventType: "canonical_vehicle_state";
  stateEpoch: string;
  stateVersion: number;
  vehicleId: string;
  tripId: string | null;
  routeId: string | null;
  routeAuthority: CanonicalRouteAuthority;
  serviceState: CanonicalServiceState;
  reasonCode: CanonicalReasonCode;
  liveLocation: CanonicalLocation | null;
  lastKnownLocation: CanonicalLocation | null;
  timing: {
    observedAt: string | null;
    receivedAt: string;
    selectedAt: string;
    freshnessClock: "server_receive";
  };
  freshness: {
    ageMs: number | null;
    thresholdMs: number;
    bucket: "fresh" | "stale" | "none";
  };
  sourceType: CanonicalSourceType | null;
  sourceId?: string | null;
}

export type CanonicalVehicleStatePublic = Omit<CanonicalVehicleStateV1, "sourceId">;

export interface ActiveVehicleState {
  id: string;
  name: string;
  assignedRouteId: string | null;
  state: CanonicalVehicleStatePublic;
}

export type RealtimeConnectionState = "connected" | "reconnecting" | "disconnected";

export const compareCanonicalStateVersion = (
  left: Pick<CanonicalVehicleStateV1, "stateEpoch" | "stateVersion">,
  right: Pick<CanonicalVehicleStateV1, "stateEpoch" | "stateVersion">,
): number => {
  if (left.stateEpoch !== right.stateEpoch) return 1;
  return Math.sign(left.stateVersion - right.stateVersion);
};

export const isCanonicalStateNewer = (
  candidate: Pick<CanonicalVehicleStateV1, "stateEpoch" | "stateVersion">,
  previous?: Pick<CanonicalVehicleStateV1, "stateEpoch" | "stateVersion">,
): boolean => !previous || compareCanonicalStateVersion(candidate, previous) > 0;
