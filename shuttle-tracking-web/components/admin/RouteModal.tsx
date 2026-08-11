"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import AdminFormModal from "@/components/admin/AdminFormModal";
import { AdminMutationFeedback } from "@/components/admin/AdminMutationFeedback";
import { Route } from "@/types/route";

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Route>) => void;
  initialData?: Route | null;
  submitting: boolean;
  submitError: string | null;
}

interface RouteFormData {
  id: string;
  name: string;
  color: string;
  status: Route["status"];
}

const routeFormData = (initialData?: Route | null): RouteFormData => initialData
  ? {
    id: initialData.id,
    name: initialData.name,
    color: initialData.color,
    status: initialData.status,
  }
  : { id: "", name: "", color: "#3B82F6", status: "active" };

export default function RouteModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  submitting,
  submitError,
}: RouteModalProps) {
  const [formData, setFormData] = useState<RouteFormData>(() => routeFormData(initialData));

  return (
    <AdminFormModal
      active={isOpen}
      kind="form"
      titleId="route-dialog-title"
      title={initialData ? "Edit Route" : "Add New Route"}
      description="Route identity, display color, and service availability."
      closeLabel="Close route dialog"
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
          <label htmlFor="route-id">Route ID</label>
          <input
            id="route-id"
            required
            disabled={Boolean(initialData) || submitting}
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
            disabled={submitting}
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
              disabled={submitting}
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
            disabled={submitting}
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

        {submitError && (
          <AdminMutationFeedback
            tone="error"
            title="Unable to save route"
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
            ) : initialData ? "Save Changes" : "Create Route"}
          </button>
        </footer>
      </form>
    </AdminFormModal>
  );
}
