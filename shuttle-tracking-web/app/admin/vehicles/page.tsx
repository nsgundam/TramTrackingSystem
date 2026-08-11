"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  AdminDeleteConfirmation,
  AdminMutationReceipt,
  adminMutationErrorMessage,
  type AdminMutationAction,
} from "@/components/admin/AdminMutationFeedback";

interface RouteOption {
  id: string;
  name: string;
}

interface MutationReceipt {
  action: AdminMutationAction;
  target: string;
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<MutationReceipt | null>(null);
  const saveInFlight = useRef(false);
  const deleteInFlight = useRef(false);

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
    } catch {
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
    if (saveInFlight.current) return;
    saveInFlight.current = true;
    setSaving(true);
    setSaveError(null);
    setReceipt(null);
    const isUpdate = Boolean(editingVehicle);
    const target = data.name?.trim() || editingVehicle?.name || data.id?.trim() || "Vehicle";

    try {
      if (editingVehicle) {
        await api.put(`admin/vehicles/${editingVehicle.id}`, {
          ...data,
          id: editingVehicle.id,
        });
      } else {
        await api.post("admin/vehicles", data);
      }
      setIsModalOpen(false);
      setEditingVehicle(null);
      setReceipt({ action: isUpdate ? "updated" : "created", target });
      await fetchData();
    } catch (error) {
      setSaveError(adminMutationErrorMessage(
        error,
        "Vehicle could not be saved. Try again.",
      ));
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleteInFlight.current) return;
    const target = deleteTarget;
    deleteInFlight.current = true;
    setDeleting(true);
    setDeleteError(null);
    setReceipt(null);

    try {
      await api.delete(`admin/vehicles/${target.id}`);
      setDeleteTarget(null);
      setReceipt({ action: "deleted", target: target.name });
      await fetchData();
    } catch (error) {
      setDeleteError(adminMutationErrorMessage(
        error,
        "Vehicle could not be deleted. Try again.",
      ));
    } finally {
      deleteInFlight.current = false;
      setDeleting(false);
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setSaveError(null);
    setReceipt(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setSaveError(null);
    setReceipt(null);
    setIsModalOpen(true);
  };

  const closeEditor = () => {
    if (saveInFlight.current) return;
    setIsModalOpen(false);
    setEditingVehicle(null);
    setSaveError(null);
  };

  const openDeleteConfirmation = (vehicle: Vehicle) => {
    setDeleteTarget(vehicle);
    setDeleteError(null);
    setReceipt(null);
  };

  const closeDeleteConfirmation = () => {
    if (deleteInFlight.current) return;
    setDeleteTarget(null);
    setDeleteError(null);
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
        onClick={() => openDeleteConfirmation(vehicle)}
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
      actionBusy={saving || deleting}
    >
      {receipt && (
        <AdminMutationReceipt
          resource="Vehicle"
          target={receipt.target}
          action={receipt.action}
          onDismiss={() => setReceipt(null)}
        />
      )}

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
        key={isModalOpen ? editingVehicle?.id ?? "new-vehicle" : "closed-vehicle"}
        isOpen={isModalOpen}
        onClose={closeEditor}
        onSubmit={handleSave}
        initialData={editingVehicle}
        routes={routes}
        submitting={saving}
        submitError={saveError}
      />
      <AdminDeleteConfirmation
        active={Boolean(deleteTarget)}
        titleId="vehicle-delete-dialog-title"
        resource="Vehicle"
        target={deleteTarget?.name ?? ""}
        targetId={deleteTarget?.id ?? ""}
        busy={deleting}
        error={deleteError}
        onCancel={closeDeleteConfirmation}
        onConfirm={() => void handleDelete()}
      />
    </AdminResourcePage>
  );
}
