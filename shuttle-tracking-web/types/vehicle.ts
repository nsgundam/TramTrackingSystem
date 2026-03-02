export interface Vehicle {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  assignedRouteId?: string | null;
  route?: {
    id: string;
    name: string;
    color: string;
  };
}