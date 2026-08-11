"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import api from "@/services/api";
import { Stop } from "@/types/stop";
import StopModal from "@/components/admin/StopModal";
import {
  AdminIconButton,
  AdminResourcePage,
  AdminResourcePanel,
  AdminResourceState,
} from "@/components/admin/AdminResourcePage";
import {
  AdminDeleteConfirmation,
  AdminMutationReceipt,
  adminMutationErrorMessage,
  type AdminMutationAction,
} from "@/components/admin/AdminMutationFeedback";

interface MutationReceipt {
  action: AdminMutationAction;
  target: string;
}

export default function StopsPage() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Stop | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<MutationReceipt | null>(null);
  const saveInFlight = useRef(false);
  const deleteInFlight = useRef(false);

  const fetchStops = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.get<Stop[]>("admin/stops");
      setStops(response.data);
    } catch {
      setLoadError("Unable to load stops. Check the connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchStops();
  }, []);

  const handleSave = async (data: Partial<Stop>) => {
    if (saveInFlight.current) return;
    saveInFlight.current = true;
    setSaving(true);
    setSaveError(null);
    setReceipt(null);
    const isUpdate = Boolean(editingStop);
    const target = data.nameEn?.trim()
      || data.nameTh?.trim()
      || editingStop?.nameEn
      || editingStop?.nameTh
      || data.id?.trim()
      || "Stop";

    try {
      if (editingStop) {
        await api.put(`admin/stops/${editingStop.id}`, {
          ...data,
          id: editingStop.id,
        });
      } else {
        await api.post("admin/stops", data);
      }
      setIsModalOpen(false);
      setEditingStop(null);
      setReceipt({ action: isUpdate ? "updated" : "created", target });
      await fetchStops();
    } catch (error) {
      setSaveError(adminMutationErrorMessage(
        error,
        "Stop could not be saved. Try again.",
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
      await api.delete(`admin/stops/${target.id}`);
      setDeleteTarget(null);
      setReceipt({ action: "deleted", target: target.nameEn || target.nameTh });
      await fetchStops();
    } catch (error) {
      setDeleteError(adminMutationErrorMessage(
        error,
        "Stop could not be deleted. Try again.",
      ));
    } finally {
      deleteInFlight.current = false;
      setDeleting(false);
    }
  };

  const openAddModal = () => {
    setEditingStop(null);
    setSaveError(null);
    setReceipt(null);
    setIsModalOpen(true);
  };

  const openEditModal = (stop: Stop) => {
    setEditingStop(stop);
    setSaveError(null);
    setReceipt(null);
    setIsModalOpen(true);
  };

  const closeEditor = () => {
    if (saveInFlight.current) return;
    setIsModalOpen(false);
    setEditingStop(null);
    setSaveError(null);
  };

  const openDeleteConfirmation = (stop: Stop) => {
    setDeleteTarget(stop);
    setDeleteError(null);
    setReceipt(null);
  };

  const closeDeleteConfirmation = () => {
    if (deleteInFlight.current) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const labelFor = (stop: Stop) => stop.nameEn || stop.nameTh;

  const actionsFor = (stop: Stop) => (
    <div className="admin-resource-actions">
      <AdminIconButton
        label={`Edit ${labelFor(stop)}`}
        tone="primary"
        onClick={() => openEditModal(stop)}
      >
        <Pencil size={17} aria-hidden="true" />
      </AdminIconButton>
      <AdminIconButton
        label={`Delete ${labelFor(stop)}`}
        tone="danger"
        onClick={() => openDeleteConfirmation(stop)}
      >
        <Trash2 size={17} aria-hidden="true" />
      </AdminIconButton>
    </div>
  );

  const coordinatesFor = (stop: Stop, precision: number) => (
    <span className="admin-coordinate">
      <MapPin size={14} aria-hidden="true" />
      {stop.lat.toFixed(precision)}, {stop.lng.toFixed(precision)}
    </span>
  );

  return (
    <AdminResourcePage
      resource="stops"
      eyebrow="Passenger network"
      title="Stops Management"
      description="Maintain bilingual stop names and the coordinates used by published routes."
      actionLabel="Add Stop"
      actionIcon={<Plus size={18} aria-hidden="true" />}
      onAction={openAddModal}
      actionBusy={saving || deleting}
    >
      {receipt && (
        <AdminMutationReceipt
          resource="Stop"
          target={receipt.target}
          action={receipt.action}
          onDismiss={() => setReceipt(null)}
        />
      )}

      <AdminResourcePanel>
        {loading ? (
          <AdminResourceState state="loading" message="Loading stops…" />
        ) : loadError ? (
          <AdminResourceState
            state="error"
            message={loadError}
            retryLabel="Retry loading stops"
            onRetry={() => void fetchStops()}
          />
        ) : stops.length === 0 ? (
          <AdminResourceState
            state="empty"
            message={'No stops found. Click "Add Stop" to start.'}
          />
        ) : (
          <>
            <div className="admin-resource-card-view" data-admin-view="cards">
              {stops.map((stop) => (
                <article key={stop.id} className="admin-resource-card">
                  <div className="admin-resource-card__header">
                    <div>
                      <span className="admin-resource-id">{stop.id}</span>
                      <h2 className="admin-resource-name">{stop.nameTh}</h2>
                      {stop.nameEn && <p className="admin-resource-detail">{stop.nameEn}</p>}
                    </div>
                    {coordinatesFor(stop, 4)}
                  </div>
                  <div className="admin-resource-card__footer">
                    <p className="admin-resource-label">Location record</p>
                    {actionsFor(stop)}
                  </div>
                </article>
              ))}
            </div>

            <div className="admin-resource-table-view" data-admin-view="table">
              <table className="admin-resource-table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name (TH / EN)</th>
                    <th scope="col">Coordinates</th>
                    <th scope="col" className="admin-resource-table__actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stops.map((stop) => (
                    <tr key={stop.id}>
                      <td><span className="admin-resource-id">{stop.id}</span></td>
                      <td>
                        <p className="admin-resource-table__name">{stop.nameTh}</p>
                        {stop.nameEn && (
                          <p className="admin-resource-table__muted">{stop.nameEn}</p>
                        )}
                      </td>
                      <td>{coordinatesFor(stop, 5)}</td>
                      <td className="admin-resource-table__actions">{actionsFor(stop)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminResourcePanel>

      <StopModal
        key={isModalOpen ? editingStop?.id ?? "new-stop" : "closed-stop"}
        isOpen={isModalOpen}
        onClose={closeEditor}
        onSubmit={handleSave}
        initialData={editingStop}
        submitting={saving}
        submitError={saveError}
      />
      <AdminDeleteConfirmation
        active={Boolean(deleteTarget)}
        titleId="stop-delete-dialog-title"
        resource="Stop"
        target={deleteTarget ? labelFor(deleteTarget) : ""}
        busy={deleting}
        error={deleteError}
        onCancel={closeDeleteConfirmation}
        onConfirm={() => void handleDelete()}
      />
    </AdminResourcePage>
  );
}
