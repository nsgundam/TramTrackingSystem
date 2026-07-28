import type { CanonicalVehicleStatePublic } from "./canonical-state";

export * from "./canonical-state";

export interface Stop {
    id: string | number;
    name?: string;
    nameTh?: string;
    imageUrl?: string;
    lat: number;
    lng: number;
    polyIndex?: number;
  }
  
  export interface Vehicle {
    id: string | number;
    assigned_route_id: string;
    actualStation?: string | number;
  }
  
/** Compatibility name for consumers that now receive the canonical envelope. */
export type LocationUpdateData = CanonicalVehicleStatePublic;

export interface RouteData {
  id: string;
  name: string;
  color: string;
  status: string;
}

export interface ActiveVehicleInfo {
  prev: string;
  next: string;
  eta: number | null;
  nextStopId: string | number | null;
}

export type RouteGeometryCache = {
  version: 2;
  signature: string;
  source: "osrm";
  createdAt: number;
  coords: [number, number][];
};
