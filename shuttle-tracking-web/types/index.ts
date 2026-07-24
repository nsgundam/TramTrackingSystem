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
  
export interface LocationUpdateData {
  vehicleId?: string | number;
  id?: string | number;
  lat: string | number;
  lng: string | number;
  speed?: string | number;
  velocity?: string | number;
  actualStation?: string | number;
  station?: string | number;
  bearing?: string | number;
  heading?: string | number;
}

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
