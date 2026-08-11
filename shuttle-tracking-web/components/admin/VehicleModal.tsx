"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import AdminFormModal from "@/components/admin/AdminFormModal";
import { AdminMutationFeedback } from "@/components/admin/AdminMutationFeedback";
import { Vehicle } from "@/types/vehicle";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Vehicle>) => void;
  initialData?: Vehicle | null;
  routes: { id: string; name: string }[];
  submitting: boolean;
  submitError: string | null;
}

const vehicleFormData = (initialData?: Vehicle | null) => initialData
  ? {
    id: initialData.id,
    name: initialData.name,
    type: initialData.type,
    status: initialData.status,
    assignedRouteId: initialData.assignedRouteId || "",
  }
  : {
    id: "",
    name: "",
    type: "Bus",
    status: "active",
    assignedRouteId: "",
  };

export default function VehicleModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  routes,
  submitting,
  submitError,
}: VehicleModalProps) {
  const [formData, setFormData] = useState(() => vehicleFormData(initialData));

  return (
    <AdminFormModal
      active={isOpen}
      kind="form"
      titleId="vehicle-dialog-title"
      title={initialData ? "Edit Vehicle" : "Add New Vehicle"}
      description="Vehicle identity, service status, and route assignment."
      closeLabel="Close vehicle dialog"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (submitting) return;
          onSubmit(formData);
        }}
        className="admin-form"
      >
        <div className="admin-field">
          <label htmlFor="vehicle-id">Vehicle ID</label>
          <input
            id="vehicle-id"
            required
            disabled={Boolean(initialData) || submitting}
            type="text"
            value={formData.id}
            onChange={(event) => setFormData({ ...formData, id: event.target.value })}
            className="admin-form-control"
            data-admin-control
            placeholder="e.g. VH001"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="vehicle-name">Vehicle Name</label>
          <input
            id="vehicle-name"
            required
            disabled={submitting}
            type="text"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            className="admin-form-control"
            data-admin-control
            placeholder="e.g. Red Bus 01"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="vehicle-type">Type</label>
          <input
            id="vehicle-type"
            required
            disabled={submitting}
            type="text"
            value={formData.type}
            onChange={(event) => setFormData({ ...formData, type: event.target.value })}
            className="admin-form-control"
            data-admin-control
            placeholder="e.g. รถราง (Tram), รถตู้ (Van)"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="vehicle-status">Status</label>
          <select
            id="vehicle-status"
            disabled={submitting}
            value={formData.status}
            onChange={(event) => setFormData({ ...formData, status: event.target.value })}
            className="admin-form-control"
            data-admin-control
          >
            <option value="active">Active (ใช้งานปกติ)</option>
            <option value="inactive">Inactive (หยุดวิ่ง)</option>
            <option value="maintenance">Maintenance (ซ่อมบำรุง)</option>
          </select>
        </div>

        <div className="admin-field">
          <label htmlFor="vehicle-route">Assign Route</label>
          <select
            id="vehicle-route"
            disabled={submitting}
            value={formData.assignedRouteId}
            onChange={(event) => setFormData({ ...formData, assignedRouteId: event.target.value })}
            className="admin-form-control"
            data-admin-control
          >
            <option value="">-- No Route Assigned --</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>{route.name}</option>
            ))}
          </select>
        </div>

        {submitError && (
          <AdminMutationFeedback
            tone="error"
            title="Unable to save vehicle"
            message={submitError}
          />
        )}

        <footer className="admin-modal__footer">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="admin-button"
            data-tone="secondary"
            data-admin-control
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="admin-button"
            data-tone="primary"
            data-admin-control
          >
            {submitting ? (
              <>
                <Loader2 className="admin-resource-state__spinner" size={17} aria-hidden="true" />
                Saving…
              </>
            ) : initialData ? "Save Changes" : "Create Vehicle"}
          </button>
        </footer>
      </form>
    </AdminFormModal>
  );
}
