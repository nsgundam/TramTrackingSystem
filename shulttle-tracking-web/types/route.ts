export interface Route {
  id: string;
  name: string;
  color: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}