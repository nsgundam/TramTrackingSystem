"use client";

import { useEffect, useState } from "react";
import AdminFormModal from "@/components/admin/AdminFormModal";
import { Vehicle } from "@/types/vehicle";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Vehicle>) => void;
  initialData?: Vehicle | null;
  routes: { id: string; name: string }[];
}

export default function VehicleModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  routes,
}: VehicleModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "Bus",
    status: "active",
    assignedRouteId: "",
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        id: initialData.id,
        name: initialData.name,
        type: initialData.type,
        status: initialData.status,
        assignedRouteId: initialData.assignedRouteId || "",
      });
    } else {
      setFormData({
        id: "",
        name: "",
        type: "Bus",
        status: "active",
        assignedRouteId: "",
      });
    }
  }, [initialData, isOpen]);

  return (
    <AdminFormModal
      active={isOpen}
      kind="form"
      titleId="vehicle-dialog-title"
      title={initialData ? "Edit Vehicle" : "Add New Vehicle"}
      description="Vehicle identity, service status, and route assignment."
      closeLabel="Close vehicle dialog"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(formData);
        }}
        className="admin-form"
      >
        <div className="admin-field">
          <label htmlFor="vehicle-id">Vehicle ID</label>
          <input
            id="vehicle-id"
            required
            disabled={Boolean(initialData)}
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

        <footer className="admin-modal__footer">
          <button
            type="button"
            onClick={onClose}
            className="admin-button"
            data-tone="secondary"
            data-admin-control
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-button"
            data-tone="primary"
            data-admin-control
          >
            {initialData ? "Save Changes" : "Create Vehicle"}
          </button>
        </footer>
      </form>
    </AdminFormModal>
  );
}
