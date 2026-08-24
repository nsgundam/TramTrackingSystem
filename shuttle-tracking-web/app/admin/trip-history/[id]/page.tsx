"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Download,
  Gauge,
  Info,
  MapPin,
  Radio,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { formatAdminTimestamp } from "@/utils/admin-timestamp";
import type {
  SampledCanonicalPoint,
  TripHistoryDetailResponse,
  TripHistorySummary,
} from "@/types/history";
import RouteColorBadge from "@/components/shared/RouteColorBadge";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
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

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

const tripStatusTone = (
  status: string,
): "positive" | "warning" | "neutral" | "info" | "danger" => {
  if (status === "completed") return "positive";
  if (status === "in_progress") return "info";
  if (status === "aborted") return "danger";
  return "neutral";
};

const formatTripStatus = (status: string): string => {
  if (status === "in_progress") return "In Progress";
  if (status === "completed") return "Completed";
  if (status === "aborted") return "Aborted";
  return status.replaceAll("_", " ");
};

const formatCoordinate = (
  value: number | string | null | undefined,
  precision = 6,
): string => {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num.toFixed(precision) : "—";
};

const formatSpeed = (
  value: number | string | null | undefined,
): string => {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? `${num.toFixed(1)} km/h` : "—";
};

const formatHeading = (
  value: number | string | null | undefined,
): string => {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? `${num.toFixed(0)}°` : "—";
};

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;

  const { user, isLoading } = useAuth();
  const [trip, setTrip] = useState<TripHistorySummary | null>(null);
  const [points, setPoints] = useState<SampledCanonicalPoint[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const canAccessDetail = user?.role === "SUPER_ADMIN" || user?.role === "DEV";

  const fetchTripDetail = useCallback(async (targetPage: number) => {
    if (!tripId || !canAccessDetail) return;
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.get<TripHistoryDetailResponse>(
        `admin/trip-history/${encodeURIComponent(tripId)}`,
        {
          params: { page: targetPage, pageSize },
        },
      );
      setTrip(response.data.trip);
      setPoints(response.data.points);
      setPage(response.data.pagination.page);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      setLoadError(
        adminMutationErrorMessage(
          error,
          "Unable to load trip detail and points. Check your connection and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [tripId, canAccessDetail, pageSize]);

  useEffect(() => {
    if (isLoading || !canAccessDetail || !tripId) return;
    const timer = window.setTimeout(() => {
      void fetchTripDetail(1);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isLoading, canAccessDetail, tripId, fetchTripDetail]);

  const handleExportCsv = async () => {
    if (!tripId || exporting) return;
    setExporting(true);
    setExportError(null);
    setExportNotice(null);
    try {
      const response = await api.get<Blob>(
        `admin/trip-history/${encodeURIComponent(tripId)}/export`,
        { responseType: "blob" },
      );

      let filename = `trip-${tripId}-history.csv`;
      const disposition = response.headers?.["content-disposition"] as string | undefined;
      if (disposition) {
        const match = /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i.exec(disposition);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1].trim());
        }
      }

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const tempAnchor = document.createElement("a");
      tempAnchor.href = downloadUrl;
      tempAnchor.download = filename;
      document.body.appendChild(tempAnchor);
      tempAnchor.click();
      document.body.removeChild(tempAnchor);
      window.URL.revokeObjectURL(downloadUrl);

      setExportNotice(`Exported ${filename} successfully.`);
    } catch (error) {
      setExportError(
        adminMutationErrorMessage(
          error,
          "Failed to download trip CSV export. Check permissions and try again.",
        ),
      );
    } finally {
      setExporting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    void fetchTripDetail(newPage);
  };

  if (isLoading || !user) {
    return (
      <AdminResourcePanel>
        <AdminResourceState state="loading" message="Verifying trip detail access…" />
      </AdminResourcePanel>
    );
  }

  if (!canAccessDetail) {
    return (
      <div className="admin-access-denied" role="alert">
        <ShieldAlert size={20} aria-hidden="true" />
        <span>
          Trip detail, sampled point evidence, and CSV export are restricted to Super Admin and Dev
          roles.
        </span>
      </div>
    );
  }

  return (
    <AdminResourcePage
      resource="trip-detail"
      eyebrow="Sampled track evidence"
      title={`Trip ${trip?.id ?? tripId}`}
      description="Inspect trip lifecycle metadata and sampled canonical location points."
      actionLabel={exporting ? "Exporting CSV…" : "Export CSV"}
      actionIcon={<Download size={18} aria-hidden="true" />}
      actionTone="primary"
      actionBusy={exporting}
      onAction={() => void handleExportCsv()}
    >
      <div className="admin-back-nav">
        <Link
          href="/admin/trip-history"
          className="admin-back-link"
          data-admin-control
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Trip History</span>
        </Link>
      </div>

      <AdminNotice kind="info" title="Sampled canonical points" icon={<Info size={19} />}>
        Points displayed below are sampled canonical telemetry records stored during this trip.
        They represent verified discrete observations and are not a complete continuous route or
        ground truth.
      </AdminNotice>

      {exportError && (
        <AdminMutationFeedback
          tone="error"
          title="Export failed"
          message={exportError}
          onDismiss={() => setExportError(null)}
          dismissLabel="Dismiss export error"
        />
      )}

      {exportNotice && (
        <AdminMutationFeedback
          tone="success"
          title="CSV Export ready"
          message={exportNotice}
          onDismiss={() => setExportNotice(null)}
          dismissLabel="Dismiss export notice"
        />
      )}

      <AdminResourcePanel>
        {loading && !trip ? (
          <AdminResourceState state="loading" message="Loading trip details…" />
        ) : loadError && !trip ? (
          <AdminResourceState
            state="error"
            title="Trip detail unavailable"
            message={loadError}
            retryLabel="Retry loading trip"
            onRetry={() => void fetchTripDetail(page)}
          />
        ) : trip ? (
          <section className="admin-trip-overview" aria-labelledby="trip-overview-title">
            <header className="admin-panel__header">
              <div>
                <p className="admin-panel__eyebrow">Trip metadata</p>
                <h2 id="trip-overview-title" className="admin-panel__title">
                  {trip.vehicle
                    ? `${trip.vehicle.name} (${trip.vehicle.id})`
                    : `Vehicle ${trip.vehicleId}`}
                </h2>
              </div>
              <AdminStatusBadge
                label={formatTripStatus(trip.status)}
                tone={tripStatusTone(trip.status)}
              />
            </header>

            <div className="admin-trip-overview__grid">
              <div className="admin-trip-overview__item">
                <span className="admin-trip-overview__label">Route</span>
                <span className="admin-trip-overview__value">
                  {trip.route ? (
                    <RouteColorBadge
                      className="rounded px-2 py-0.5 text-xs font-semibold"
                      routeColor={trip.route.color}
                    >
                      {trip.route.name}
                    </RouteColorBadge>
                  ) : (
                    trip.routeId
                  )}
                </span>
              </div>

              <div className="admin-trip-overview__item">
                <span className="admin-trip-overview__label">Start Time</span>
                <span className="admin-trip-overview__value">
                  {formatAdminTimestamp(trip.startTime) ?? "—"}
                </span>
              </div>

              <div className="admin-trip-overview__item">
                <span className="admin-trip-overview__label">End Time</span>
                <span className="admin-trip-overview__value">
                  {formatAdminTimestamp(trip.endTime) ?? "In progress"}
                </span>
              </div>

              <div className="admin-trip-overview__item">
                <span className="admin-trip-overview__label">Last Activity</span>
                <span className="admin-trip-overview__value">
                  {formatAdminTimestamp(trip.lastTripActivityAt) ?? "—"}
                </span>
              </div>

              <div className="admin-trip-overview__item">
                <span className="admin-trip-overview__label">Closed At</span>
                <span className="admin-trip-overview__value">
                  {formatAdminTimestamp(trip.closedAt) ?? "—"}
                </span>
              </div>

              <div className="admin-trip-overview__item">
                <span className="admin-trip-overview__label">End Reason</span>
                <span className="admin-trip-overview__value">
                  {trip.endReason ? trip.endReason.replaceAll("_", " ") : "—"}
                </span>
              </div>

              <div className="admin-trip-overview__item">
                <span className="admin-trip-overview__label">Created At</span>
                <span className="admin-trip-overview__value">
                  {formatAdminTimestamp(trip.createdAt) ?? "—"}
                </span>
              </div>

              <div className="admin-trip-overview__item">
                <span className="admin-trip-overview__label">Total Sampled Points</span>
                <span className="admin-trip-overview__value">
                  <strong>{trip.trackCount}</strong> points recorded
                </span>
              </div>
            </div>
          </section>
        ) : null}
      </AdminResourcePanel>

      <AdminResourcePanel>
        <header className="admin-panel__header">
          <div>
            <p className="admin-panel__eyebrow">Canonical track log</p>
            <h2 className="admin-panel__title">Sampled Location Points</h2>
            <p className="admin-panel__description">
              Paginated discrete telemetry points recorded by tracking devices during this trip.
            </p>
          </div>
          <span className="admin-panel__tag">{total} total points</span>
        </header>

        {loading ? (
          <AdminResourceState state="loading" message="Loading sampled points…" />
        ) : loadError ? (
          <AdminResourceState
            state="error"
            title="Points unavailable"
            message={loadError}
            retryLabel="Retry loading points"
            onRetry={() => void fetchTripDetail(page)}
          />
        ) : points.length === 0 ? (
          <AdminResourceState
            state="empty"
            message="No sampled canonical points recorded for this trip."
          />
        ) : (
          <>
            <div className="admin-resource-card-view" data-admin-view="cards">
              {points.map((point) => (
                <article key={point.id} className="admin-resource-card admin-point-card">
                  <header className="admin-resource-card__header">
                    <div>
                      <span className="admin-resource-id">{point.id}</span>
                      <h3 className="admin-resource-name">
                        {formatAdminTimestamp(point.recordedAt) ?? "Timestamp unavailable"}
                      </h3>
                    </div>
                  </header>

                  <dl className="admin-operation-facts">
                    <div>
                      <dt>
                        <MapPin size={14} aria-hidden="true" /> Latitude
                      </dt>
                      <dd className="admin-resource-table__mono">{formatCoordinate(point.lat)}</dd>
                    </div>
                    <div>
                      <dt>
                        <MapPin size={14} aria-hidden="true" /> Longitude
                      </dt>
                      <dd className="admin-resource-table__mono">{formatCoordinate(point.lng)}</dd>
                    </div>
                    <div>
                      <dt>
                        <Gauge size={14} aria-hidden="true" /> Speed
                      </dt>
                      <dd>{formatSpeed(point.speed)}</dd>
                    </div>
                    <div>
                      <dt>
                        <Compass size={14} aria-hidden="true" /> Heading
                      </dt>
                      <dd>{formatHeading(point.heading)}</dd>
                    </div>
                    <div>
                      <dt>Station</dt>
                      <dd>{point.station ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>
                        <Radio size={14} aria-hidden="true" /> Source ID
                      </dt>
                      <dd>{point.sourceId ?? "—"}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="admin-resource-table-view" data-admin-view="table">
              <table className="admin-resource-table">
                <thead>
                  <tr>
                    <th scope="col">Recorded At</th>
                    <th scope="col">Latitude</th>
                    <th scope="col">Longitude</th>
                    <th scope="col">Speed</th>
                    <th scope="col">Heading</th>
                    <th scope="col">Station</th>
                    <th scope="col">Source ID</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((point) => (
                    <tr key={point.id}>
                      <td>{formatAdminTimestamp(point.recordedAt) ?? "—"}</td>
                      <td className="admin-resource-table__mono">{formatCoordinate(point.lat)}</td>
                      <td className="admin-resource-table__mono">{formatCoordinate(point.lng)}</td>
                      <td>{formatSpeed(point.speed)}</td>
                      <td>{formatHeading(point.heading)}</td>
                      <td className="admin-resource-table__muted">{point.station ?? "—"}</td>
                      <td>
                        <span className="admin-resource-id">{point.sourceId ?? "—"}</span>
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
              itemLabel="points"
            />
          </>
        )}
      </AdminResourcePanel>
    </AdminResourcePage>
  );
}
