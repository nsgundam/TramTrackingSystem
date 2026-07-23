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
  
export type LocationUpdateData = import("./canonical-state").CanonicalVehicleStateV1;
