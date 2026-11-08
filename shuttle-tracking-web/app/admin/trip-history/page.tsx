"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import {
  Calendar,
  Filter,
  History,
  Info,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { isAdminRole, useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { formatAdminTimestamp } from "@/utils/admin-timestamp";
import {
  toStartOfDayIso,
  toEndOfDayIso,
  validateDateRange,
} from "@/utils/history-filters";
import {
  TRIP_SOURCE_FILTER_OPTIONS,
  formatTripSourceType,
  tripSourceTone,
} from "@/utils/trip-source";
import type {
  TripHistoryFilterValues,
  TripHistoryListResponse,
  TripHistoryRoute,
  TripHistorySummary,
  TripHistoryVehicle,
} from "@/types/history";
import RouteColorBadge from "@/components/shared/RouteColorBadge";
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

const emptyFilters: TripHistoryFilterValues = {
  vehicleId: "",
  routeId: "",
  status: "",
  sourceType: "",
  from: "",
  to: "",
};

const tripStatusTone = (
  status: string,
): "positive" | "warning" | "neutral" | "info" | "danger" => {
  if (status === "completed") return "positive";
  if (status === "in_progress") return "info";
  if (status === "aborted") return "danger";
  return "neutral";
};

function TripSourceBreakdown({ trip }: { trip: TripHistorySummary }) {
  const breakdown = trip.sourceBreakdown ?? [];
  if (breakdown.length === 0) {
    return <span className="admin-resource-table__muted">No tracks</span>;
  }
  return (
    <ul
      className="admin-trip-sources"
      role="list"
      aria-label="Sampled points by source type"
    >
      {breakdown.map((entry) => (
        <li key={entry.sourceType}>
          <AdminStatusBadge
            label={`${formatTripSourceType(entry.sourceType)} · ${entry.trackCount}`}
            tone={tripSourceTone(entry.sourceType)}
          />
        </li>
      ))}
    </ul>
  );
}

const formatTripStatus = (status: string): string => {
  if (status === "in_progress") return "In Progress";
  if (status === "completed") return "Completed";
  if (status === "aborted") return "Aborted";
  return status.replaceAll("_", " ");
};

export default function TripHistoryPage() {
  const { user, isLoading } = useAuth();
  const [trips, setTrips] = useState<TripHistorySummary[]>([]);
  const [vehicles, setVehicles] = useState<TripHistoryVehicle[]>([]);
  const [routes, setRoutes] = useState<TripHistoryRoute[]>([]);
  const [filters, setFilters] = useState<TripHistoryFilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<TripHistoryFilterValues>(emptyFilters);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const canViewDetail = user?.role === "SUPER_ADMIN" || user?.role === "DEV";
  const canAccessHistory = user && isAdminRole(user.role);

  const loadFilterOptions = useCallback(async () => {
    try {
      const [vehiclesRes, routesRes] = await Promise.all([
        api.get<TripHistoryVehicle[]>("admin/vehicles"),
        api.get<TripHistoryRoute[]>("admin/routes"),
      ]);
      setVehicles(vehiclesRes.data);
      setRoutes(routesRes.data);
    } catch {
      // Non-blocking: filters can still be used without options dropdown
    }
  }, []);

  const fetchTrips = useCallback(async (
    targetPage: number,
    activeFilters: TripHistoryFilterValues,
  ) => {
    setLoading(true);
    setLoadError(null);
    try {
      const params: Record<string, string | number> = {
        page: targetPage,
        pageSize,
      };

      if (activeFilters.vehicleId.trim()) {
        params.vehicleId = activeFilters.vehicleId.trim();
      }
      if (activeFilters.routeId.trim()) {
        params.routeId = activeFilters.routeId.trim();
      }
      if (activeFilters.status.trim()) {
        params.status = activeFilters.status.trim();
      }
      if (activeFilters.sourceType.trim()) {
        params.sourceType = activeFilters.sourceType.trim();
      }

      const fromIso = toStartOfDayIso(activeFilters.from);
      if (fromIso) {
        params.from = fromIso;
      }

      const toIso = toEndOfDayIso(activeFilters.to);
      if (toIso) {
        params.to = toIso;
      }

      const response = await api.get<TripHistoryListResponse>("admin/trip-history", { params });
      setTrips(response.data.data);
      setPage(response.data.pagination.page);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      setLoadError(
        adminMutationErrorMessage(
          error,
          "Unable to load trip history. Check your connection and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    if (isLoading || !canAccessHistory) return;
    const timer = window.setTimeout(() => {
      void loadFilterOptions();
      void fetchTrips(1, emptyFilters);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isLoading, canAccessHistory, loadFilterOptions, fetchTrips]);

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
    void fetchTrips(1, filters);
  };

  const handleResetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setDateError(null);
    setPage(1);
    void fetchTrips(1, emptyFilters);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    void fetchTrips(newPage, appliedFilters);
  };

  if (isLoading || !user) {
    return (
      <AdminResourcePanel>
        <AdminResourceState state="loading" message="Verifying trip history access…" />
      </AdminResourcePanel>
    );
  }

  if (!canAccessHistory) {
    return (
      <div className="admin-access-denied" role="alert">
        <ShieldAlert size={20} aria-hidden="true" />
        <span>Trip history is restricted to Admin, Super Admin, and Dev roles.</span>
      </div>
    );
  }

  return (
    <AdminResourcePage
      resource="trip-history"
      eyebrow="Chronological operations"
      title="Trip History"
      description="Inspect historical and active trips across the fleet with bounded operational summaries."
      actionLabel={loading ? "Refreshing…" : "Refresh"}
      actionIcon={<RefreshCw size={18} aria-hidden="true" />}
      actionTone="secondary"
      actionBusy={loading}
      onAction={() => void fetchTrips(page, appliedFilters)}
    >
      <AdminNotice kind="info" title="Sampled canonical evidence" icon={<Info size={19} />}>
        Track counts reflect sampled canonical telemetry selected during service. They represent
        verified operational history, not a complete GPS path or ground truth.
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
                <label htmlFor="filter-vehicle">Vehicle</label>
                <select
                  id="filter-vehicle"
                  className="admin-form-control"
                  value={filters.vehicleId}
                  onChange={(event) =>
                    setFilters({ ...filters, vehicleId: event.target.value })
                  }
                >
                  <option value="">All vehicles</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="filter-route">Route</label>
                <select
                  id="filter-route"
                  className="admin-form-control"
                  value={filters.routeId}
                  onChange={(event) =>
                    setFilters({ ...filters, routeId: event.target.value })
                  }
                >
                  <option value="">All routes</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="filter-status">Status</label>
                <select
                  id="filter-status"
                  className="admin-form-control"
                  value={filters.status}
                  onChange={(event) =>
                    setFilters({ ...filters, status: event.target.value })
                  }
                >
                  <option value="">All statuses</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="aborted">Aborted</option>
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="filter-source-type">Source type</label>
                <select
                  id="filter-source-type"
                  className="admin-form-control"
                  value={filters.sourceType}
                  onChange={(event) =>
                    setFilters({ ...filters, sourceType: event.target.value })
                  }
                >
                  <option value="">All source types</option>
                  {TRIP_SOURCE_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="filter-from">
                  <span className="admin-field__label-with-icon">
                    <Calendar size={14} aria-hidden="true" />
                    From date
                  </span>
                </label>
                <input
                  id="filter-from"
                  type="date"
                  className="admin-form-control"
                  value={filters.from}
                  onChange={(event) =>
                    setFilters({ ...filters, from: event.target.value })
                  }
                />
              </div>

              <div className="admin-field">
                <label htmlFor="filter-to">
                  <span className="admin-field__label-with-icon">
                    <Calendar size={14} aria-hidden="true" />
                    To date
                  </span>
                </label>
                <input
                  id="filter-to"
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
          <AdminResourceState state="loading" message="Loading trip history…" />
        ) : loadError ? (
          <AdminResourceState
            state="error"
            title="Trip history unavailable"
            message={loadError}
            retryLabel="Retry loading trip history"
            onRetry={() => void fetchTrips(page, appliedFilters)}
          />
        ) : trips.length === 0 ? (
          <AdminResourceState
            state="empty"
            message="No trip records found for the selected criteria."
          />
        ) : (
          <>
            <div className="admin-resource-card-view" data-admin-view="cards">
              {trips.map((trip) => (
                <article
                  key={trip.id}
                  className="admin-resource-card admin-trip-record-card"
                >
                  <div className="admin-resource-card__header">
                    <div className="admin-operation-record__identity">
                      <span
                        className="admin-operation-record__icon"
                        aria-hidden="true"
                      >
                        <History size={18} />
                      </span>
                      <div>
                        <span className="admin-resource-id">{trip.id}</span>
                        <h2 className="admin-resource-name">
                          {trip.vehicle
                            ? `${trip.vehicle.name} (${trip.vehicle.id})`
                            : `Vehicle ${trip.vehicleId}`}
                        </h2>
                      </div>
                    </div>
                    <AdminStatusBadge
                      label={formatTripStatus(trip.status)}
                      tone={tripStatusTone(trip.status)}
                    />
                  </div>

                  <dl className="admin-operation-facts">
                    <div>
                      <dt>Route</dt>
                      <dd>
                        {trip.route ? (
                          <RouteColorBadge
                            className="rounded px-2 py-0.5 text-xs font-semibold"
                            routeColor={trip.route.color}
                          >
                            {trip.route.name}
                          </RouteColorBadge>
                        ) : (
                          <span className="admin-resource-table__muted">
                            {trip.routeId}
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Start time</dt>
                      <dd>{formatAdminTimestamp(trip.startTime) ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>End / Activity time</dt>
                      <dd>
                        {formatAdminTimestamp(
                          trip.endTime ?? trip.closedAt ?? trip.lastTripActivityAt,
                        ) ?? "In progress"}
                      </dd>
                    </div>
                    <div>
                      <dt>End reason</dt>
                      <dd>
                        {trip.endReason
                          ? trip.endReason.replaceAll("_", " ")
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Sampled points</dt>
                      <dd>
                        <strong>{trip.trackCount}</strong> points
                      </dd>
                    </div>
                    <div>
                      <dt>Sources</dt>
                      <dd>
                        <TripSourceBreakdown trip={trip} />
                      </dd>
                    </div>
                  </dl>

                  {canViewDetail && (
                    <div className="admin-resource-card__footer admin-trip-record-card__footer">
                      <Link
                        href={`/admin/trip-history/${trip.id}`}
                        className="admin-button"
                        data-tone="secondary"
                        data-admin-control
                      >
                        View detail
                      </Link>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="admin-resource-table-view" data-admin-view="table">
              <table className="admin-resource-table">
                <thead>
                  <tr>
                    <th scope="col">Trip ID</th>
                    <th scope="col">Vehicle</th>
                    <th scope="col">Route</th>
                    <th scope="col">Status</th>
                    <th scope="col">Start Time</th>
                    <th scope="col">End / Activity Time</th>
                    <th scope="col">End Reason</th>
                    <th scope="col">Sampled Points</th>
                    <th scope="col">Sources</th>
                    {canViewDetail && (
                      <th scope="col" className="admin-resource-table__actions">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip.id}>
                      <td>
                        <span className="admin-resource-id">{trip.id}</span>
                      </td>
                      <td className="admin-resource-table__name">
                        {trip.vehicle
                          ? `${trip.vehicle.name} (${trip.vehicle.id})`
                          : trip.vehicleId}
                      </td>
                      <td>
                        {trip.route ? (
                          <RouteColorBadge
                            className="rounded px-2 py-0.5 text-xs font-semibold"
                            routeColor={trip.route.color}
                          >
                            {trip.route.name}
                          </RouteColorBadge>
                        ) : (
                          <span className="admin-resource-table__muted">
                            {trip.routeId}
                          </span>
                        )}
                      </td>
                      <td>
                        <AdminStatusBadge
                          label={formatTripStatus(trip.status)}
                          tone={tripStatusTone(trip.status)}
                        />
                      </td>
                      <td>{formatAdminTimestamp(trip.startTime) ?? "—"}</td>
                      <td>
                        {formatAdminTimestamp(
                          trip.endTime ?? trip.closedAt ?? trip.lastTripActivityAt,
                        ) ?? "In progress"}
                      </td>
                      <td className="admin-resource-table__muted">
                        {trip.endReason
                          ? trip.endReason.replaceAll("_", " ")
                          : "—"}
                      </td>
                      <td>
                        <strong>{trip.trackCount}</strong> pts
                      </td>
                      <td>
                        <TripSourceBreakdown trip={trip} />
                      </td>
                      {canViewDetail && (
                        <td className="admin-resource-table__actions">
                          <Link
                            href={`/admin/trip-history/${trip.id}`}
                            className="admin-button"
                            data-tone="secondary"
                            data-admin-control
                          >
                            View detail
                          </Link>
                        </td>
                      )}
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
              itemLabel="trips"
            />
          </>
        )}
      </AdminResourcePanel>
    </AdminResourcePage>
  );
}
