"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import {
  Calendar,
  Filter,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { formatAdminTimestamp } from "@/utils/admin-timestamp";
import {
  toStartOfDayIso,
  toEndOfDayIso,
  validateDateRange,
} from "@/utils/history-filters";
import type {
  AdminAuditEvent,
  AdminHistoryFilterValues,
  AdminHistoryListResponse,
} from "@/types/history";
import { AdminPagination } from "@/components/admin/AdminPagination";
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

const emptyFilters: AdminHistoryFilterValues = {
  action: "",
  targetType: "",
  outcome: "",
  actor: "",
  from: "",
  to: "",
};

const outcomeTone = (
  outcome: string,
): "positive" | "warning" | "danger" | "neutral" => {
  if (outcome === "success") return "positive";
  if (outcome === "denied") return "warning";
  if (outcome === "failure") return "danger";
  return "neutral";
};

const formatOutcome = (outcome: string): string => {
  if (outcome === "success") return "Success";
  if (outcome === "denied") return "Denied";
  if (outcome === "failure") return "Failure";
  return outcome.replaceAll("_", " ");
};

const KNOWN_ACTIONS = [
  { value: "vehicle.create", label: "Vehicle: Create" },
  { value: "vehicle.update", label: "Vehicle: Update" },
  { value: "vehicle.delete", label: "Vehicle: Delete" },
  { value: "route.create", label: "Route: Create" },
  { value: "route.update", label: "Route: Update" },
  { value: "route.delete", label: "Route: Delete" },
  { value: "stop.create", label: "Stop: Create" },
  { value: "stop.update", label: "Stop: Update" },
  { value: "stop.delete", label: "Stop: Delete" },
  { value: "route_stop.create", label: "Route Stop: Create" },
  { value: "route_stop.replace", label: "Route Stop: Replace" },
  { value: "route_stop.delete", label: "Route Stop: Delete" },
  { value: "device.create", label: "Device: Create" },
  { value: "device.update", label: "Device: Update" },
  { value: "device.delete", label: "Device: Delete" },
  { value: "device.assign", label: "Device: Assign" },
  { value: "device.unassign", label: "Device: Unassign" },
  { value: "feedback.update", label: "Feedback: Update" },
  { value: "feedback.delete", label: "Feedback: Delete" },
  { value: "feedback.restore", label: "Feedback: Restore" },
] as const;

const TARGET_TYPES = [
  { value: "vehicle", label: "Vehicle" },
  { value: "route", label: "Route" },
  { value: "stop", label: "Stop" },
  { value: "route_stop", label: "Route Stop" },
  { value: "tracking_source", label: "Tracking Source" },
  { value: "feedback", label: "Feedback" },
] as const;

export default function AdminHistoryPage() {
  const { user, isLoading } = useAuth();
  const [events, setEvents] = useState<AdminAuditEvent[]>([]);
  const [filters, setFilters] = useState<AdminHistoryFilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<AdminHistoryFilterValues>(emptyFilters);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const canAccessLedger = user?.role === "SUPER_ADMIN" || user?.role === "DEV";

  const fetchEvents = useCallback(async (
    targetPage: number,
    activeFilters: AdminHistoryFilterValues,
  ) => {
    if (!canAccessLedger) return;
    setLoading(true);
    setLoadError(null);
    try {
      const params: Record<string, string | number> = {
        page: targetPage,
        pageSize,
      };

      if (activeFilters.action.trim()) {
        params.action = activeFilters.action.trim();
      }
      if (activeFilters.targetType.trim()) {
        params.targetType = activeFilters.targetType.trim();
      }
      if (activeFilters.outcome.trim()) {
        params.outcome = activeFilters.outcome.trim();
      }
      if (activeFilters.actor.trim()) {
        params.actor = activeFilters.actor.trim();
      }

      const fromIso = toStartOfDayIso(activeFilters.from);
      if (fromIso) {
        params.from = fromIso;
      }

      const toIso = toEndOfDayIso(activeFilters.to);
      if (toIso) {
        params.to = toIso;
      }

      const response = await api.get<AdminHistoryListResponse>("admin/admin-history", { params });
      setEvents(response.data.data);
      setPage(response.data.pagination.page);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      setLoadError(
        adminMutationErrorMessage(
          error,
          "Unable to load admin mutation events. Check your connection and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [canAccessLedger, pageSize]);

  useEffect(() => {
    if (isLoading || !canAccessLedger) return;
    const timer = window.setTimeout(() => {
      void fetchEvents(1, emptyFilters);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isLoading, canAccessLedger, fetchEvents]);

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateDateRange(filters.from, filters.to);
    if (validationError) {
      setDateError(validationError);
      return;
    }
    setDateError(null);
    setAppliedFilters(filters);
    setPage(1);
    void fetchEvents(1, filters);
  };

  const handleResetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setDateError(null);
    setPage(1);
    void fetchEvents(1, emptyFilters);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    void fetchEvents(newPage, appliedFilters);
  };

  if (isLoading || !user) {
    return (
      <AdminResourcePanel>
        <AdminResourceState state="loading" message="Verifying admin history access…" />
      </AdminResourcePanel>
    );
  }

  if (!canAccessLedger) {
    return (
      <div className="admin-access-denied" role="alert">
        <ShieldAlert size={20} aria-hidden="true" />
        <span>Admin mutation history is restricted to Super Admin and Dev roles.</span>
      </div>
    );
  }

  return (
    <AdminResourcePage
      resource="admin-history"
      eyebrow="Audit ledger"
      title="Admin History"
      description="Read-only ledger of administrative mutations and security-relevant actions."
      actionLabel={loading ? "Refreshing…" : "Refresh"}
      actionIcon={<RefreshCw size={18} aria-hidden="true" />}
      actionTone="secondary"
      actionBusy={loading}
      onAction={() => void fetchEvents(page, appliedFilters)}
    >
      <AdminNotice kind="read-only" title="Audit ledger policy" icon={<ShieldCheck size={19} />}>
        This read-only ledger records important administrative mutations for security and
        accountability. Request payloads, secrets, coordinates, and sensitive operational data are
        deliberately excluded from audit persistence. Export is disabled by design.
      </AdminNotice>

      {dateError && (
        <AdminMutationFeedback
          tone="error"
          title="Invalid date filter"
          message={dateError}
          onDismiss={() => setDateError(null)}
          dismissLabel="Dismiss date filter error"
        />
      )}

      <AdminResourcePanel>
        <div className="admin-history-filters-container">
          <form className="admin-history-filters-form" onSubmit={handleApplyFilters}>
            <div className="admin-history-filters-grid">
              <div className="admin-field">
                <label htmlFor="filter-action">Action</label>
                <select
                  id="filter-action"
                  className="admin-form-control"
                  value={filters.action}
                  onChange={(event) =>
                    setFilters({ ...filters, action: event.target.value })
                  }
                >
                  <option value="">All actions</option>
                  {KNOWN_ACTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="filter-target-type">Target type</label>
                <select
                  id="filter-target-type"
                  className="admin-form-control"
                  value={filters.targetType}
                  onChange={(event) =>
                    setFilters({ ...filters, targetType: event.target.value })
                  }
                >
                  <option value="">All target types</option>
                  {TARGET_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="filter-outcome">Outcome</label>
                <select
                  id="filter-outcome"
                  className="admin-form-control"
                  value={filters.outcome}
                  onChange={(event) =>
                    setFilters({ ...filters, outcome: event.target.value })
                  }
                >
                  <option value="">All outcomes</option>
                  <option value="success">Success</option>
                  <option value="denied">Denied</option>
                  <option value="failure">Failure</option>
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="filter-actor">
                  <span className="admin-field__label-with-icon">
                    <User size={14} aria-hidden="true" />
                    Actor
                  </span>
                </label>
                <input
                  id="filter-actor"
                  type="text"
                  className="admin-form-control"
                  placeholder="Username or ID"
                  value={filters.actor}
                  onChange={(event) =>
                    setFilters({ ...filters, actor: event.target.value })
                  }
                />
              </div>

              <div className="admin-field">
                <label htmlFor="filter-admin-from">
                  <span className="admin-field__label-with-icon">
                    <Calendar size={14} aria-hidden="true" />
                    From date
                  </span>
                </label>
                <input
                  id="filter-admin-from"
                  type="date"
                  className="admin-form-control"
                  value={filters.from}
                  onChange={(event) =>
                    setFilters({ ...filters, from: event.target.value })
                  }
                />
              </div>

              <div className="admin-field">
                <label htmlFor="filter-admin-to">
                  <span className="admin-field__label-with-icon">
                    <Calendar size={14} aria-hidden="true" />
                    To date
                  </span>
                </label>
                <input
                  id="filter-admin-to"
                  type="date"
                  className="admin-form-control"
                  value={filters.to}
                  onChange={(event) =>
                    setFilters({ ...filters, to: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="admin-history-filters-actions">
              <AdminButton
                type="submit"
                tone="primary"
                icon={<Filter size={16} aria-hidden="true" />}
                disabled={loading}
              >
                Apply filters
              </AdminButton>
              <AdminButton
                type="button"
                tone="secondary"
                icon={<RotateCcw size={16} aria-hidden="true" />}
                onClick={handleResetFilters}
                disabled={loading}
              >
                Reset
              </AdminButton>
            </div>
          </form>
        </div>
      </AdminResourcePanel>

      <AdminResourcePanel>
        {loading ? (
          <AdminResourceState state="loading" message="Loading admin mutation events…" />
        ) : loadError ? (
          <AdminResourceState
            state="error"
            title="Admin history unavailable"
            message={loadError}
            retryLabel="Retry loading admin history"
            onRetry={() => void fetchEvents(page, appliedFilters)}
          />
        ) : events.length === 0 ? (
          <AdminResourceState
            state="empty"
            message="No audit events match the selected criteria."
          />
        ) : (
          <>
            <div className="admin-resource-card-view" data-admin-view="cards">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="admin-operation-record admin-audit-record-card"
                  data-admin-signal={event.outcome === "success" ? "resolved" : "disabled"}
                >
                  <header className="admin-operation-record__header">
                    <div className="admin-operation-record__identity">
                      <span className="admin-operation-record__icon" aria-hidden="true">
                        <ShieldCheck size={18} />
                      </span>
                      <div>
                        <p className="admin-operation-record__eyebrow">{event.targetType}</p>
                        <h2 className="admin-operation-record__title">{event.action}</h2>
                        <span className="admin-resource-id">{event.id}</span>
                      </div>
                    </div>
                    <AdminStatusBadge
                      label={formatOutcome(event.outcome)}
                      tone={outcomeTone(event.outcome)}
                    />
                  </header>

                  <dl className="admin-operation-facts">
                    <div>
                      <dt>Occurred at</dt>
                      <dd>{formatAdminTimestamp(event.occurredAt) ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Actor</dt>
                      <dd>
                        {event.actorUsername ? (
                          <span>
                            {event.actorUsername}{" "}
                            {event.actorRole ? `(${event.actorRole})` : ""}
                          </span>
                        ) : (
                          "System"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Target ID</dt>
                      <dd className="admin-resource-table__mono">{event.targetId}</dd>
                    </div>
                    <div>
                      <dt>Response status</dt>
                      <dd>{event.responseStatus ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Request ID</dt>
                      <dd className="admin-resource-table__mono">{event.requestId ?? "—"}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="admin-resource-table-view" data-admin-view="table">
              <table className="admin-resource-table">
                <thead>
                  <tr>
                    <th scope="col">Time</th>
                    <th scope="col">Actor</th>
                    <th scope="col">Action</th>
                    <th scope="col">Target Type</th>
                    <th scope="col">Target ID</th>
                    <th scope="col">Outcome</th>
                    <th scope="col">Status</th>
                    <th scope="col">Request ID</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>{formatAdminTimestamp(event.occurredAt) ?? "—"}</td>
                      <td className="admin-resource-table__name">
                        {event.actorUsername ?? "System"}
                        {event.actorRole ? (
                          <span className="admin-resource-table__muted"> ({event.actorRole})</span>
                        ) : null}
                      </td>
                      <td>
                        <strong>{event.action}</strong>
                      </td>
                      <td className="admin-resource-table__muted">{event.targetType}</td>
                      <td>
                        <span className="admin-resource-id">{event.targetId}</span>
                      </td>
                      <td>
                        <AdminStatusBadge
                          label={formatOutcome(event.outcome)}
                          tone={outcomeTone(event.outcome)}
                        />
                      </td>
                      <td>{event.responseStatus ?? "—"}</td>
                      <td>
                        <span className="admin-resource-id">{event.requestId ?? "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={loading}
              itemLabel="events"
            />
          </>
        )}
      </AdminResourcePanel>
    </AdminResourcePage>
  );
}
