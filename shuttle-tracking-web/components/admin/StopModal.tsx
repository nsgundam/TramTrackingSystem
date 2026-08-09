"use client";

import { useEffect, useState } from "react";
import AdminFormModal from "@/components/admin/AdminFormModal";
import { Stop } from "@/types/stop";

interface StopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Stop>) => void;
  initialData?: Stop | null;
}

export default function StopModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: StopModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    nameTh: "",
    nameEn: "",
    lat: "",
    lng: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        id: initialData.id,
        nameTh: initialData.nameTh,
        nameEn: initialData.nameEn || "",
        lat: initialData.lat.toString(),
        lng: initialData.lng.toString(),
        imageUrl: initialData.imageUrl || "",
      });
    } else {
      setFormData({ id: "", nameTh: "", nameEn: "", lat: "", lng: "", imageUrl: "" });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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
    >
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form__grid admin-form__grid--two-column">
          <div className="admin-field">
            <label htmlFor="stop-id">Stop ID</label>
            <input
              id="stop-id"
              required
              disabled={Boolean(initialData)}
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
            {initialData ? "Save Changes" : "Create Stop"}
          </button>
        </footer>
      </form>
    </AdminFormModal>
  );
}
