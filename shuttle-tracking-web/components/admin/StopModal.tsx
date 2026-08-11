"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import AdminFormModal from "@/components/admin/AdminFormModal";
import { AdminMutationFeedback } from "@/components/admin/AdminMutationFeedback";
import { Stop } from "@/types/stop";

interface StopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Stop>) => void;
  initialData?: Stop | null;
  submitting: boolean;
  submitError: string | null;
}

const stopFormData = (initialData?: Stop | null) => initialData
  ? {
    id: initialData.id,
    nameTh: initialData.nameTh,
    nameEn: initialData.nameEn || "",
    lat: initialData.lat.toString(),
    lng: initialData.lng.toString(),
    imageUrl: initialData.imageUrl || "",
  }
  : { id: "", nameTh: "", nameEn: "", lat: "", lng: "", imageUrl: "" };

export default function StopModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  submitting,
  submitError,
}: StopModalProps) {
  const [formData, setFormData] = useState(() => stopFormData(initialData));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    onSubmit({
      ...formData,
      lat: Number.parseFloat(formData.lat),
      lng: Number.parseFloat(formData.lng),
    });
  };

  return (
    <AdminFormModal
      active={isOpen}
      kind="form"
      titleId="stop-dialog-title"
      title={initialData ? "Edit Stop" : "Add New Stop"}
      description="Bilingual stop identity and map coordinates."
      closeLabel="Close stop dialog"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form__grid admin-form__grid--two-column">
          <div className="admin-field">
            <label htmlFor="stop-id">Stop ID</label>
            <input
              id="stop-id"
              required
              disabled={Boolean(initialData) || submitting}
              type="text"
              value={formData.id}
              onChange={(event) => setFormData({ ...formData, id: event.target.value })}
              className="admin-form-control"
              data-admin-control
              placeholder="e.g. ST001"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="stop-name-th">Name (TH)</label>
            <input
              id="stop-name-th"
              required
              disabled={submitting}
              type="text"
              value={formData.nameTh}
              onChange={(event) => setFormData({ ...formData, nameTh: event.target.value })}
              className="admin-form-control"
              data-admin-control
              placeholder="e.g. ป้ายหน้ามอ"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="stop-name-en">Name (EN)</label>
            <input
              id="stop-name-en"
              disabled={submitting}
              type="text"
              value={formData.nameEn}
              onChange={(event) => setFormData({ ...formData, nameEn: event.target.value })}
              className="admin-form-control"
              data-admin-control
              placeholder="e.g. Main Gate"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="stop-latitude">Latitude</label>
            <input
              id="stop-latitude"
              required
              disabled={submitting}
              type="number"
              step="any"
              value={formData.lat}
              onChange={(event) => setFormData({ ...formData, lat: event.target.value })}
              className="admin-form-control"
              data-admin-control
              placeholder="13.7365"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="stop-longitude">Longitude</label>
            <input
              id="stop-longitude"
              required
              disabled={submitting}
              type="number"
              step="any"
              value={formData.lng}
              onChange={(event) => setFormData({ ...formData, lng: event.target.value })}
              className="admin-form-control"
              data-admin-control
              placeholder="100.5332"
            />
          </div>
        </div>

        {submitError && (
          <AdminMutationFeedback
            tone="error"
            title="Unable to save stop"
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
            ) : initialData ? "Save Changes" : "Create Stop"}
          </button>
        </footer>
      </form>
    </AdminFormModal>
  );
}
