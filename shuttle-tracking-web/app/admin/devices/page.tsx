"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Activity, History, Plus, Radio, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import api from "@/services/api";
import { formatAdminTimestamp } from "@/utils/admin-timestamp";
import {
  AdminButton,
  AdminNotice,
  AdminResourcePage,
  AdminResourcePanel,
  AdminResourceState,
  AdminStatusBadge,
} from "@/components/admin/AdminResourcePage";
import {
  AdminMutationFeedback,
  adminMutationErrorMessage,
} from "@/components/admin/AdminMutationFeedback";

interface DeviceHealth {
  sourceId: string;
  sourceType: string;
  vehicle: { id: string; name: string } | null;
  freshness: "online" | "stale" | "offline" | "disabled";
  lastTelemetryAt: string | null;
  status: string;
  errorCategory: "none" | "stale" | "offline" | "disabled";
}

interface DeviceAssignment {
  id: string;
  vehicleId: string;
  assignedAt: string;
  unassignedAt: string | null;
  method: string;
  assignedBy?: { id: string; username: string } | null;
  unassignedBy?: { id: string; username: string } | null;
  vehicle: { id: string; name: string };
}

interface TrackingSource {
  id: string;
  name: string;
  type: string;
  vehicleId: string | null;
  priority: number;
  status: string;
  lastTelemetryAt: string | null;
  activeAssignment: DeviceAssignment | null;
}

interface VehicleOption {
  id: string;
  name: string;
}

interface SourceForm {
  id: string;
  name: string;
  type: "mobile" | "esp32" | "lorawan" | "simulator";
  priority: string;
  status: "provisioning" | "active" | "inactive" | "retired";
  secret: string;
  vehicleId: string;
}

type AssignmentHistory = DeviceAssignment;

const emptyForm: SourceForm = {
  id: "",
  name: "",
  type: "mobile",
  priority: "1",
  status: "provisioning",
  secret: "",
  vehicleId: "",
};

const freshnessTone: Record<
  DeviceHealth["freshness"],
  "positive" | "warning" | "neutral" | "danger"
> = {
  online: "positive",
  stale: "warning",
  offline: "danger",
  disabled: "neutral",
};

const formatState = (value: string) => value.replaceAll("_", " ");

export default function DeviceHealthPage() {
  const [sources, setSources] = useState<TrackingSource[]>([]);
  const [health, setHealth] = useState<DeviceHealth[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [form, setForm] = useState<SourceForm>(emptyForm);
  const [pendingAssignments, setPendingAssignments] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Record<string, AssignmentHistory[]>>({});
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [sourceResponse, healthResponse, vehicleResponse] = await Promise.all([
        api.get<TrackingSource[]>("admin/devices"),
        api.get<DeviceHealth[]>("admin/devices/health"),
        api.get<VehicleOption[]>("admin/vehicles"),
      ]);
      setSources(sourceResponse.data);
      setHealth(healthResponse.data);
      setVehicles(vehicleResponse.data);
      setPendingAssignments({});
    } catch {
      setLoadError("Unable to load source registry and health state.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // This page synchronizes its initial view with three backend resources.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const createSource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await api.post("admin/devices", {
        id: form.id.trim(),
        name: form.name.trim(),
        type: form.type,
        priority: Number(form.priority),
        status: form.status,
        secret: form.secret || undefined,
        vehicleId: form.vehicleId || null,
      });
      setForm(emptyForm);
      setNotice("Tracking source created.");
      await load();
    } catch (requestError) {
      setError(adminMutationErrorMessage(requestError, "Tracking source could not be created."));
    } finally {
      setSaving(false);
    }
  };

  const saveAssignment = async (source: TrackingSource, requestedVehicleId?: string) => {
    const vehicleId = requestedVehicleId ?? pendingAssignments[source.id] ?? source.activeAssignment?.vehicleId ?? "";
    setAssigning(source.id);
    setError(null);
    setNotice(null);
    try {
      if (vehicleId) {
        await api.put(`admin/devices/${source.id}/assignment`, { vehicleId });
        setNotice(`${source.name} assigned to ${vehicleId}.`);
      } else {
        await api.delete(`admin/devices/${source.id}/assignment`);
        setNotice(`${source.name} is now unassigned.`);
      }
      setHistory((current) => {
        const next = { ...current };
        delete next[source.id];
        return next;
      });
      await load();
    } catch (requestError) {
      setError(adminMutationErrorMessage(requestError, "Source assignment could not be changed."));
    } finally {
      setAssigning(null);
    }
  };

  const loadHistory = async (sourceId: string) => {
    if (expandedHistory === sourceId) {
      setExpandedHistory(null);
      return;
    }
    setExpandedHistory(sourceId);
    if (history[sourceId]) return;
    try {
      const response = await api.get<AssignmentHistory[]>(`admin/devices/${sourceId}/assignments`);
      setHistory((current) => ({ ...current, [sourceId]: response.data }));
    } catch (requestError) {
      setError(adminMutationErrorMessage(requestError, "Assignment history could not be loaded."));
    }
  };

  const healthById = new Map(health.map((item) => [item.sourceId, item]));

  return (
    <AdminResourcePage
      resource="source-health"
      eyebrow="Operational registry"
      title="Tracking Sources"
      description="Manage source identity and assignments while keeping telemetry health separate from service lifecycle."
      actionLabel={loading ? "Refreshing…" : "Refresh"}
      actionIcon={<RefreshCw size={18} aria-hidden="true" />}
      actionTone="secondary"
      actionBusy={loading || saving || Boolean(assigning)}
      onAction={() => void load()}
    >
      <AdminNotice kind="info" title="Lifecycle boundary" icon={<ShieldCheck size={19} />}>
        Telemetry health never starts or ends service. Only an explicit Active Trip makes a vehicle live;
        assignment changes do not close a vehicle&apos;s Trip.
      </AdminNotice>

      {error && <AdminMutationFeedback tone="error" title="Source operation failed" message={error} />}
      {notice && <AdminMutationFeedback tone="success" title="Source registry updated" message={notice} onDismiss={() => setNotice(null)} />}

      <AdminResourcePanel>
        <form className="admin-form" onSubmit={createSource}>
          <div>
            <p className="admin-panel__eyebrow">Register a source</p>
            <h2 className="admin-resource-name">Add a tracking identity</h2>
          </div>
          <div className="admin-form__grid admin-form__grid--two-column">
            <div className="admin-field">
              <label htmlFor="source-id">Source ID</label>
              <input id="source-id" className="admin-form-control" value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} required maxLength={50} />
            </div>
            <div className="admin-field">
              <label htmlFor="source-name">Name</label>
              <input id="source-name" className="admin-form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={255} />
            </div>
            <div className="admin-field">
              <label htmlFor="source-type">Type</label>
              <select id="source-type" className="admin-form-control" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as SourceForm["type"] })}>
                <option value="mobile">Mobile</option>
                <option value="esp32">ESP32</option>
                <option value="lorawan">LoRaWAN</option>
                <option value="simulator">Simulator</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="source-status">Registry status</label>
              <select id="source-status" className="admin-form-control" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as SourceForm["status"] })}>
                <option value="provisioning">Provisioning</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="source-priority">Selection priority</label>
              <input id="source-priority" className="admin-form-control" type="number" min="1" max="100" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} required />
            </div>
            <div className="admin-field">
              <label htmlFor="source-vehicle">Initial assignment</label>
              <select id="source-vehicle" className="admin-form-control" value={form.vehicleId} onChange={(event) => setForm({ ...form, vehicleId: event.target.value })}>
                <option value="">Unassigned</option>
                {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name} ({vehicle.id})</option>)}
              </select>
            </div>
          </div>
          {form.type !== "lorawan" && (
            <div className="admin-field">
              <label htmlFor="source-secret">Credential</label>
              <input id="source-secret" className="admin-form-control" type="password" value={form.secret} onChange={(event) => setForm({ ...form, secret: event.target.value })} autoComplete="new-password" placeholder="Provision a sender credential" />
            </div>
          )}
          <div>
            <AdminButton tone="primary" type="submit" disabled={saving} icon={<Plus size={17} aria-hidden="true" />}>
              {saving ? "Creating…" : "Create source"}
            </AdminButton>
          </div>
        </form>
      </AdminResourcePanel>

      <AdminResourcePanel>
        {loading ? (
          <AdminResourceState state="loading" message="Loading source registry…" />
        ) : loadError ? (
          <AdminResourceState
            state="error"
            title="Source registry unavailable"
            message={loadError}
            retryLabel="Retry loading source registry"
            onRetry={() => void load()}
          />
        ) : sources.length === 0 ? (
          <AdminResourceState state="empty" message="No sources are registered." />
        ) : (
          <div className="admin-source-registry">
            {sources.map((source) => {
              const sourceHealth = healthById.get(source.id);
              const selectedVehicleId = pendingAssignments[source.id] ?? source.activeAssignment?.vehicleId ?? "";
              return (
                <article key={source.id} className="admin-source-record">
                  <header className="admin-source-record__header">
                    <div className="admin-operation-record__identity">
                      <span className="admin-operation-record__icon" aria-hidden="true"><Radio size={18} /></span>
                      <div>
                        <p className="admin-operation-record__eyebrow">{source.type}</p>
                        <h2 className="admin-operation-record__title">{source.name}</h2>
                        <span className="admin-resource-id">{source.id}</span>
                      </div>
                    </div>
                    <AdminStatusBadge label={formatState(sourceHealth?.freshness ?? "offline")} tone={freshnessTone[sourceHealth?.freshness ?? "offline"]} />
                  </header>

                  <dl className="admin-operation-facts">
                    <div><dt><Activity size={15} aria-hidden="true" /> Last telemetry</dt><dd>{formatAdminTimestamp(sourceHealth?.lastTelemetryAt ?? source.lastTelemetryAt) ?? "Never"}</dd></div>
                    <div><dt>Registry status</dt><dd>{formatState(source.status)}</dd></div>
                    <div><dt>Current vehicle</dt><dd>{source.activeAssignment ? `${source.activeAssignment.vehicle.name} (${source.activeAssignment.vehicleId})` : "Unassigned"}</dd></div>
                    <div><dt>Priority</dt><dd>{source.priority}</dd></div>
                  </dl>

                  <div className="admin-source-record__controls">
                    <div className="admin-field">
                      <label htmlFor={`assignment-${source.id}`}>Assign source to vehicle</label>
                      <select id={`assignment-${source.id}`} className="admin-form-control" value={selectedVehicleId} onChange={(event) => setPendingAssignments({ ...pendingAssignments, [source.id]: event.target.value })} disabled={assigning === source.id}>
                        <option value="">Unassigned</option>
                        {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name} ({vehicle.id})</option>)}
                      </select>
                    </div>
                    <div className="admin-source-record__actions">
                      <AdminButton tone="primary" onClick={() => void saveAssignment(source)} disabled={assigning === source.id}>
                        {assigning === source.id ? "Saving…" : "Save assignment"}
                      </AdminButton>
                      {source.activeAssignment && (
                        <AdminButton tone="danger" onClick={() => { setPendingAssignments({ ...pendingAssignments, [source.id]: "" }); void saveAssignment(source, ""); }} disabled={assigning === source.id} icon={<Unplug size={16} aria-hidden="true" />}>
                          Unassign
                        </AdminButton>
                      )}
                    </div>
                  </div>

                  <button type="button" className="admin-source-record__history-toggle" onClick={() => void loadHistory(source.id)} aria-expanded={expandedHistory === source.id}>
                    <History size={16} aria-hidden="true" /> {expandedHistory === source.id ? "Hide assignment history" : "View assignment history"}
                  </button>
                  {expandedHistory === source.id && (
                    <div className="admin-source-record__history" role="region" aria-label={`${source.name} assignment history`}>
                      {(history[source.id] ?? []).length === 0 ? <p>No assignment history.</p> : (history[source.id] ?? []).map((assignment) => (
                        <div key={assignment.id} className="admin-source-history-row">
                          <span>{assignment.vehicle.name} ({assignment.vehicleId})</span>
                          <span>{formatAdminTimestamp(assignment.assignedAt) ?? "Unknown"} → {formatAdminTimestamp(assignment.unassignedAt) ?? "Active"}</span>
                        <span>{formatState(assignment.method)}{assignment.assignedBy ? ` · assigned by ${assignment.assignedBy.username}` : ""}{assignment.unassignedBy ? ` · unassigned by ${assignment.unassignedBy.username}` : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </AdminResourcePanel>
    </AdminResourcePage>
  );
}
