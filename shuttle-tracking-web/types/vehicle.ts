import { Route } from "./route";

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  status: string;
  assignedRouteId?: string;
  route?: Route;
}