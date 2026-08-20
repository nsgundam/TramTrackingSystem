"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity,
  ChevronUp,
  History,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Unplug,
  X,
} from "lucide-react";
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

type FilterStatus = "all" | "online" | "stale" | "offline" | "unassigned";

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
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
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
      setIsFormExpanded(false);
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

  const healthById = useMemo(
    () => new Map(health.map((item) => [item.sourceId, item])),
    [health],
  );

  const onlineCount = useMemo(
    () => health.filter((item) => item.freshness === "online").length,
    [health],
  );

  const staleCount = useMemo(
    () => health.filter((item) => item.freshness === "stale").length,
    [health],
  );

  const offlineCount = useMemo(
    () => health.filter((item) => item.freshness === "offline" || item.freshness === "disabled").length,
    [health],
  );

  const unassignedCount = useMemo(
    () => sources.filter((item) => !item.activeAssignment && !item.vehicleId).length,
    [sources],
  );

  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      const sourceHealth = healthById.get(source.id);
      const freshness = sourceHealth?.freshness ?? "offline";
      const isAssigned = Boolean(source.activeAssignment || source.vehicleId);

      if (filterStatus === "online" && freshness !== "online") return false;
      if (filterStatus === "stale" && freshness !== "stale") return false;
      if (filterStatus === "offline" && freshness !== "offline" && freshness !== "disabled") return false;
      if (filterStatus === "unassigned" && isAssigned) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchId = source.id.toLowerCase().includes(query);
        const matchName = source.name.toLowerCase().includes(query);
        const matchType = source.type.toLowerCase().includes(query);
        const matchVehicle = source.activeAssignment?.vehicle.name.toLowerCase().includes(query) || false;
        if (!matchId && !matchName && !matchType && !matchVehicle) return false;
      }

      return true;
    });
  }, [sources, healthById, filterStatus, searchQuery]);

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
      {notice && (
        <AdminMutationFeedback
          tone="success"
          title="Source registry updated"
          message={notice}
          onDismiss={() => setNotice(null)}
        />
      )}

      <div className="admin-source-metrics-bar">
        <div className="admin-source-metric-card">
          <span className="admin-source-metric-card__label">Total Sources</span>
          <span className="admin-source-metric-card__value">{sources.length}</span>
        </div>
        <div className="admin-source-metric-card" data-tone="positive">
          <span className="admin-source-metric-card__label">Online Telemetry</span>
          <span className="admin-source-metric-card__value">{onlineCount}</span>
        </div>
        <div className="admin-source-metric-card" data-tone="warning">
          <span className="admin-source-metric-card__label">Stale Telemetry</span>
          <span className="admin-source-metric-card__value">{staleCount}</span>
        </div>
        <div className="admin-source-metric-card" data-tone={offlineCount > 0 ? "danger" : undefined}>
          <span className="admin-source-metric-card__label">Offline / Inactive</span>
          <span className="admin-source-metric-card__value">{offlineCount}</span>
        </div>
      </div>

      <AdminResourcePanel>
        <div className="admin-source-form-header">
          <div>
            <p className="admin-panel__eyebrow">Register a source</p>
            <h2 className="admin-resource-name">Add a tracking identity</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsFormExpanded(!isFormExpanded)}
            className="admin-source-form-toggle-btn"
            aria-expanded={isFormExpanded}
            data-admin-control
          >
            {isFormExpanded ? (
              <>
                <ChevronUp size={16} aria-hidden="true" />
                <span>Hide form</span>
              </>
            ) : (
              <>
                <Plus size={16} aria-hidden="true" />
                <span>New source</span>
              </>
            )}
          </button>
        </div>

        {isFormExpanded && (
          <form className="admin-form admin-source-form-expanded" onSubmit={createSource}>
            <div className="admin-form__grid admin-form__grid--two-column">
              <div className="admin-field">
                <label htmlFor="source-id">Source ID</label>
                <input
                  id="source-id"
                  className="admin-form-control"
                  value={form.id}
                  onChange={(event) => setForm({ ...form, id: event.target.value })}
                  required
                  maxLength={50}
                  placeholder="e.g. TS_ESP32_01"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="source-name">Name</label>
                <input
                  id="source-name"
                  className="admin-form-control"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                  maxLength={255}
                  placeholder="e.g. Tram 01 ESP32 Module"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="source-type">Type</label>
                <select
                  id="source-type"
                  className="admin-form-control"
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value as SourceForm["type"] })}
                >
                  <option value="mobile">Mobile</option>
                  <option value="esp32">ESP32</option>
                  <option value="lorawan">LoRaWAN</option>
                  <option value="simulator">Simulator</option>
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="source-status">Registry status</label>
                <select
                  id="source-status"
                  className="admin-form-control"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as SourceForm["status"] })}
                >
                  <option value="provisioning">Provisioning</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="source-priority">Selection priority</label>
                <input
                  id="source-priority"
                  className="admin-form-control"
                  type="number"
                  min="1"
                  max="100"
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value })}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="source-vehicle">Initial assignment</label>
                <select
                  id="source-vehicle"
                  className="admin-form-control"
                  value={form.vehicleId}
                  onChange={(event) => setForm({ ...form, vehicleId: event.target.value })}
                >
                  <option value="">Unassigned</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {form.type !== "lorawan" && (
              <div className="admin-field">
                <label htmlFor="source-secret">Credential</label>
                <input
                  id="source-secret"
                  className="admin-form-control"
                  type="password"
                  value={form.secret}
                  onChange={(event) => setForm({ ...form, secret: event.target.value })}
                  autoComplete="new-password"
                  placeholder="Provision a sender credential"
                />
              </div>
            )}
            <div>
              <AdminButton tone="primary" type="submit" disabled={saving} icon={<Plus size={17} aria-hidden="true" />}>
                {saving ? "Creating…" : "Create source"}
              </AdminButton>
            </div>
          </form>
        )}
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
          <>
            <div className="admin-source-toolbar">
              <div className="admin-source-filter-pills" role="tablist" aria-label="Filter sources by status">
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterStatus === "all"}
                  className="admin-source-filter-pill"
                  data-active={filterStatus === "all"}
                  onClick={() => setFilterStatus("all")}
                >
                  <span>All</span>
                  <span className="admin-source-filter-pill__count">{sources.length}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterStatus === "online"}
                  className="admin-source-filter-pill"
                  data-active={filterStatus === "online"}
                  onClick={() => setFilterStatus("online")}
                >
                  <span>Online</span>
                  <span className="admin-source-filter-pill__count">{onlineCount}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterStatus === "stale"}
                  className="admin-source-filter-pill"
                  data-active={filterStatus === "stale"}
                  onClick={() => setFilterStatus("stale")}
                >
                  <span>Stale</span>
                  <span className="admin-source-filter-pill__count">{staleCount}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterStatus === "offline"}
                  className="admin-source-filter-pill"
                  data-active={filterStatus === "offline"}
                  onClick={() => setFilterStatus("offline")}
                >
                  <span>Offline</span>
                  <span className="admin-source-filter-pill__count">{offlineCount}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterStatus === "unassigned"}
                  className="admin-source-filter-pill"
                  data-active={filterStatus === "unassigned"}
                  onClick={() => setFilterStatus("unassigned")}
                >
                  <span>Unassigned</span>
                  <span className="admin-source-filter-pill__count">{unassignedCount}</span>
                </button>
              </div>

              <div className="admin-source-search">
                <Search size={16} className="admin-source-search__icon" aria-hidden="true" />
                <input
                  type="search"
                  className="admin-source-search__input"
                  placeholder="Search sources or vehicles…"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  aria-label="Search tracking sources"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="admin-source-search__clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {filteredSources.length === 0 ? (
              <div className="admin-resource-state admin-resource-state--empty">
                <p>No tracking sources match the current filter.</p>
                {(searchQuery || filterStatus !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                    }}
                    className="admin-source-record__history-toggle"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              <div className="admin-source-registry">
                {filteredSources.map((source) => {
                  const sourceHealth = healthById.get(source.id);
                  const selectedVehicleId = pendingAssignments[source.id] ?? source.activeAssignment?.vehicleId ?? "";
                  return (
                    <article
                      key={source.id}
                      className="admin-source-record"
                      data-freshness={sourceHealth?.freshness ?? "offline"}
                    >
                      <header className="admin-source-record__header">
                        <div className="admin-operation-record__identity">
                          <span className="admin-operation-record__icon" aria-hidden="true">
                            <Radio size={18} />
                          </span>
                          <div>
                            <p className="admin-operation-record__eyebrow">{source.type}</p>
                            <h2 className="admin-operation-record__title">{source.name}</h2>
                            <span className="admin-resource-id">{source.id}</span>
                          </div>
                        </div>
                        <AdminStatusBadge
                          label={formatState(sourceHealth?.freshness ?? "offline")}
                          tone={freshnessTone[sourceHealth?.freshness ?? "offline"]}
                        />
                      </header>

                      <dl className="admin-operation-facts">
                        <div>
                          <dt>
                            <Activity size={15} aria-hidden="true" /> Last telemetry
                          </dt>
                          <dd>{formatAdminTimestamp(sourceHealth?.lastTelemetryAt ?? source.lastTelemetryAt) ?? "Never"}</dd>
                        </div>
                        <div>
                          <dt>Registry status</dt>
                          <dd>{formatState(source.status)}</dd>
                        </div>
                        <div>
                          <dt>Current vehicle</dt>
                          <dd>
                            {source.activeAssignment
                              ? `${source.activeAssignment.vehicle.name} (${source.activeAssignment.vehicleId})`
                              : "Unassigned"}
                          </dd>
                        </div>
                        <div>
                          <dt>Priority</dt>
                          <dd>{source.priority}</dd>
                        </div>
                      </dl>

                      <div className="admin-source-record__controls">
                        <div className="admin-field">
                          <label htmlFor={`assignment-${source.id}`}>Assign source to vehicle</label>
                          <select
                            id={`assignment-${source.id}`}
                            className="admin-form-control"
                            value={selectedVehicleId}
                            onChange={(event) =>
                              setPendingAssignments({
                                ...pendingAssignments,
                                [source.id]: event.target.value,
                              })
                            }
                            disabled={assigning === source.id}
                          >
                            <option value="">Unassigned</option>
                            {vehicles.map((vehicle) => (
                              <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.name} ({vehicle.id})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-source-record__actions">
                          <AdminButton
                            tone="primary"
                            onClick={() => void saveAssignment(source)}
                            disabled={assigning === source.id}
                          >
                            {assigning === source.id ? "Saving…" : "Save assignment"}
                          </AdminButton>
                          {source.activeAssignment && (
                            <AdminButton
                              tone="danger"
                              onClick={() => {
                                setPendingAssignments({ ...pendingAssignments, [source.id]: "" });
                                void saveAssignment(source, "");
                              }}
                              disabled={assigning === source.id}
                              icon={<Unplug size={16} aria-hidden="true" />}
                            >
                              Unassign
                            </AdminButton>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="admin-source-record__history-toggle"
                        onClick={() => void loadHistory(source.id)}
                        aria-expanded={expandedHistory === source.id}
                      >
                        <History size={16} aria-hidden="true" />{" "}
                        {expandedHistory === source.id ? "Hide assignment history" : "View assignment history"}
                      </button>
                      {expandedHistory === source.id && (
                        <div
                          className="admin-source-record__history"
                          role="region"
                          aria-label={`${source.name} assignment history`}
                        >
                          {(history[source.id] ?? []).length === 0 ? (
                            <p>No assignment history.</p>
                          ) : (
                            (history[source.id] ?? []).map((assignment) => (
                              <div key={assignment.id} className="admin-source-history-row">
                                <span>
                                  {assignment.vehicle.name} ({assignment.vehicleId})
                                </span>
                                <span>
                                  {formatAdminTimestamp(assignment.assignedAt) ?? "Unknown"} →{" "}
                                  {formatAdminTimestamp(assignment.unassignedAt) ?? "Active"}
                                </span>
                                <span>
                                  {formatState(assignment.method)}
                                  {assignment.assignedBy ? ` · assigned by ${assignment.assignedBy.username}` : ""}
                                  {assignment.unassignedBy ? ` · unassigned by ${assignment.unassignedBy.username}` : ""}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </AdminResourcePanel>
    </AdminResourcePage>
  );
}
