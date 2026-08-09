"use client";

import { useEffect, useState } from "react";
import AdminFormModal from "@/components/admin/AdminFormModal";
import { Route } from "@/types/route";

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Route>) => void;
  initialData?: Route | null;
}

interface RouteFormData {
  id: string;
  name: string;
  color: string;
  status: Route["status"];
}

export default function RouteModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: RouteModalProps) {
  const [formData, setFormData] = useState<RouteFormData>({
    id: "",
    name: "",
    color: "#3B82F6",
    status: "active",
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        id: initialData.id,
        name: initialData.name,
        color: initialData.color,
        status: initialData.status,
      });
    } else {
      setFormData({ id: "", name: "", color: "#3B82F6", status: "active" });
    }
  }, [initialData, isOpen]);

  return (
    <AdminFormModal
      active={isOpen}
      kind="form"
      titleId="route-dialog-title"
      title={initialData ? "Edit Route" : "Add New Route"}
      description="Route identity, display color, and service availability."
      closeLabel="Close route dialog"
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
          <label htmlFor="route-id">Route ID</label>
          <input
            id="route-id"
            required
            disabled={Boolean(initialData)}
            type="text"
            value={formData.id}
            onChange={(event) => setFormData({ ...formData, id: event.target.value })}
            className="admin-form-control"
            data-admin-control
            placeholder="e.g. R01"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="route-name">Route Name</label>
          <input
            id="route-name"
            required
            type="text"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            className="admin-form-control"
            data-admin-control
            placeholder="e.g. วนภายในมหาวิทยาลัย"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="route-color">Route Color</label>
          <div className="admin-color-field">
            <input
              id="route-color"
              required
              type="color"
              value={formData.color}
              onChange={(event) => setFormData({ ...formData, color: event.target.value })}
              className="admin-form-control admin-form-control--color"
              data-admin-control
            />
            <span className="admin-color-field__value">{formData.color}</span>
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="route-status">Status</label>
          <select
            id="route-status"
            value={formData.status}
            onChange={(event) => {
              const status = event.target.value;
              if (status === "active" || status === "inactive") {
                setFormData({ ...formData, status });
              }
            }}
            className="admin-form-control"
            data-admin-control
          >
            <option value="active">Active (เปิดให้บริการ)</option>
            <option value="inactive">Inactive (ปิดปรับปรุง)</option>
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
            {initialData ? "Save Changes" : "Create Route"}
          </button>
        </footer>
      </form>
    </AdminFormModal>
  );
}
