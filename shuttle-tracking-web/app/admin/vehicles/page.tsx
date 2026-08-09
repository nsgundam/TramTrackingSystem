"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import api from "@/services/api";
import { Vehicle } from "@/types/vehicle";
import VehicleModal from "@/components/admin/VehicleModal";
import RouteColorBadge from "@/components/shared/RouteColorBadge";
import {
  AdminIconButton,
  AdminResourcePage,
  AdminResourcePanel,
  AdminResourceState,
  AdminStatusBadge,
} from "@/components/admin/AdminResourcePage";

interface RouteOption {
  id: string;
  name: string;
}

const vehicleStatusTone = (status: string): "positive" | "warning" | "neutral" => {
  if (status === "active") return "positive";
  if (status === "maintenance") return "warning";
  return "neutral";
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [vehiclesRes, routesRes] = await Promise.all([
        api.get<Vehicle[]>("admin/vehicles"),
        api.get<RouteOption[]>("admin/routes"),
      ]);
      setVehicles(vehiclesRes.data);
      setRoutes(routesRes.data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      setLoadError("Unable to load vehicles. Check the connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, []);

  const handleSave = async (data: Partial<Vehicle>) => {
    try {
      if (editingVehicle) {
        await api.put(`admin/vehicles/${editingVehicle.id}`, data);
      } else {
        await api.post("admin/vehicles", data);
      }
      setIsModalOpen(false);
      setEditingVehicle(null);
      await fetchData();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save vehicle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await api.delete(`admin/vehicles/${id}`);
      await fetchData();
    } catch (error) {
      alert(`Error deleting vehicle: ${String(error)}`);
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const actionsFor = (vehicle: Vehicle) => (
    <div className="admin-resource-actions">
      <AdminIconButton
        label={`Edit ${vehicle.name}`}
        tone="primary"
        onClick={() => openEditModal(vehicle)}
      >
        <Pencil size={17} aria-hidden="true" />
      </AdminIconButton>
      <AdminIconButton
        label={`Delete ${vehicle.name}`}
        tone="danger"
        onClick={() => void handleDelete(vehicle.id)}
      >
        <Trash2 size={17} aria-hidden="true" />
      </AdminIconButton>
    </div>
  );

  return (
    <AdminResourcePage
      resource="vehicles"
      eyebrow="Service inventory"
      title="Vehicles Management"
      description="Manage fleet records, availability status, and route assignments."
      actionLabel="Add Vehicle"
      actionIcon={<Plus size={18} aria-hidden="true" />}
      onAction={openAddModal}
    >
      <AdminResourcePanel>
        {loading ? (
          <AdminResourceState state="loading" message="Loading vehicles…" />
        ) : loadError ? (
          <AdminResourceState
            state="error"
            message={loadError}
            retryLabel="Retry loading vehicles"
            onRetry={() => void fetchData()}
          />
        ) : vehicles.length === 0 ? (
          <AdminResourceState
            state="empty"
            message={'No vehicles found. Click "Add Vehicle" to start.'}
          />
        ) : (
          <>
            <div className="admin-resource-card-view" data-admin-view="cards">
              {vehicles.map((vehicle) => (
                <article key={vehicle.id} className="admin-resource-card">
                  <div className="admin-resource-card__header">
                    <div>
                      <span className="admin-resource-id">{vehicle.id}</span>
                      <h2 className="admin-resource-name">{vehicle.name}</h2>
                      <p className="admin-resource-detail">Type: {vehicle.type}</p>
                    </div>
                    <AdminStatusBadge
                      label={vehicle.status}
                      tone={vehicleStatusTone(vehicle.status)}
                    />
                  </div>
                  <div className="admin-resource-card__footer">
                    <div>
                      <p className="admin-resource-label">Assigned route</p>
                      <div className="admin-resource-detail">
                        {vehicle.route ? (
                          <RouteColorBadge
                            className="mt-1 rounded px-2 py-1 text-xs font-semibold"
                            routeColor={vehicle.route.color}
                          >
                            {vehicle.route.name}
                          </RouteColorBadge>
                        ) : (
                          <span>Not assigned</span>
                        )}
                      </div>
                    </div>
                    {actionsFor(vehicle)}
                  </div>
                </article>
              ))}
            </div>

            <div className="admin-resource-table-view" data-admin-view="table">
              <table className="admin-resource-table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Type</th>
                    <th scope="col">Route</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="admin-resource-table__actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td><span className="admin-resource-id">{vehicle.id}</span></td>
                      <td className="admin-resource-table__name">{vehicle.name}</td>
                      <td className="admin-resource-table__muted">{vehicle.type}</td>
                      <td>
                        {vehicle.route ? (
                          <RouteColorBadge
                            className="rounded px-2 py-1 text-xs font-semibold"
                            routeColor={vehicle.route.color}
                          >
                            {vehicle.route.name}
                          </RouteColorBadge>
                        ) : (
                          <span className="admin-resource-table__muted">Not assigned</span>
                        )}
                      </td>
                      <td>
                        <AdminStatusBadge
                          label={vehicle.status}
                          tone={vehicleStatusTone(vehicle.status)}
                        />
                      </td>
                      <td className="admin-resource-table__actions">{actionsFor(vehicle)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminResourcePanel>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVehicle(null);
        }}
        onSubmit={handleSave}
        initialData={editingVehicle}
        routes={routes}
      />
    </AdminResourcePage>
  );
}
