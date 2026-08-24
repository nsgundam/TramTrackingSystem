export type TripHistoryStatus = "in_progress" | "completed" | "aborted";

export interface TripHistoryVehicle {
  id: string;
  name: string;
  type: string;
}

export interface TripHistoryRoute {
  id: string;
  name: string;
  color: string;
}

export interface TripHistorySummary {
  id: string;
  vehicleId: string;
  routeId: string;
  status: TripHistoryStatus | string;
  startTime: string;
  endTime: string | null;
  lastTripActivityAt: string | null;
  closedAt: string | null;
  endReason: string | null;
  createdAt: string;
  vehicle: TripHistoryVehicle | null;
  route: TripHistoryRoute | null;
  trackCount: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TripHistoryListResponse {
  data: TripHistorySummary[];
  pagination: PaginationInfo;
  trackSemantics: "sampled_canonical" | string;
  completeness: "sampled_not_ground_truth" | string;
  coordinatesIncluded: boolean;
}

export interface SampledCanonicalPoint {
  id: string;
  recordedAt: string;
  lat: number | string | null;
  lng: number | string | null;
  speed: number | string | null;
  heading: number | string | null;
  station: string | null;
  sourceId: string | null;
}

export interface TripHistoryDetailResponse {
  trip: TripHistorySummary;
  points: SampledCanonicalPoint[];
  pagination: PaginationInfo;
  trackSemantics: "sampled_canonical" | string;
  completeness: "sampled_not_ground_truth" | string;
}

export type AdminAuditOutcome = "success" | "denied" | "failure";

export interface AdminAuditEvent {
  id: string;
  actorUserId: string | null;
  actorUsername: string | null;
  actorRole: string | null;
  action: string;
  targetType: string;
  targetId: string;
  outcome: AdminAuditOutcome | string;
  responseStatus: number | null;
  requestId: string | null;
  occurredAt: string;
}

export interface AdminHistoryListResponse {
  data: AdminAuditEvent[];
  pagination: PaginationInfo;
}

export interface TripHistoryFilterValues {
  vehicleId: string;
  routeId: string;
  status: string;
  from: string;
  to: string;
}

export interface AdminHistoryFilterValues {
  action: string;
  targetType: string;
  outcome: string;
  actor: string;
  from: string;
  to: string;
}
