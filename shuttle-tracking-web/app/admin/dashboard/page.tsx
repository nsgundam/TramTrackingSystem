"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Bus,
  Clock3,
  Map,
  MapPin,
  Loader2,
  Radio,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import api from "@/services/api";

const LiveMap = dynamic(() => import("@/components/admin/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="admin-live-map admin-live-map--loading animate-pulse" role="status">
      Loading map…
    </div>
  ),
});

interface DashboardStats {
  activeVehicles: number;
  totalRoutes: number;
  totalStops: number;
}

type DashboardLoadState = "loading" | "ready" | "error";

interface DashboardMetricDefinition {
  key: keyof DashboardStats;
  label: string;
  description: string;
  icon: LucideIcon;
  testId: string;
  tone: "blue" | "indigo" | "green";
}

const dashboardMetrics: readonly DashboardMetricDefinition[] = [
  {
    key: "activeVehicles",
    label: "Vehicles enabled",
    description: "Enabled in master data",
    icon: Bus,
    testId: "admin-stat-vehicles",
    tone: "blue",
  },
  {
    key: "totalRoutes",
    label: "Total routes",
    description: "Configured shuttle lines",
    icon: Map,
    testId: "admin-stat-routes",
    tone: "indigo",
  },
  {
    key: "totalStops",
    label: "Transit stops",
    description: "Configured pickup points",
    icon: MapPin,
    testId: "admin-stat-stops",
    tone: "green",
  },
] as const;

const requireList = (value: unknown, label: string): readonly unknown[] => {
  if (!Array.isArray(value)) throw new Error(`INVALID_${label}_RESPONSE`);
  return value;
};

const countEnabledVehicles = (value: readonly unknown[]): number => {
  return value.filter((candidate) => {
    if (typeof candidate !== "object" || candidate === null) return false;
    return "status" in candidate && candidate.status === "active";
  }).length;
};

function DashboardStatValue({
  loadState,
  value,
  testId,
}: {
  loadState: DashboardLoadState;
  value: number | undefined;
  testId: string;
}) {
  if (loadState === "loading") {
    return (
      <dd className="admin-metric__value">
        <Loader2 className="admin-metric__spinner animate-spin" aria-label="Loading" />
      </dd>
    );
  }

  return (
    <dd className="admin-metric__value" data-testid={testId}>
      {loadState === "ready" ? value ?? "—" : "—"}
    </dd>
  );
}

function DashboardMetric({
  definition,
  loadState,
  stats,
}: {
  definition: DashboardMetricDefinition;
  loadState: DashboardLoadState;
  stats: DashboardStats | null;
}) {
  const Icon = definition.icon;

  return (
    <div className="admin-metric" data-tone={definition.tone}>
      <div className="admin-metric__icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <dt className="admin-metric__label">{definition.label}</dt>
        <dd className="admin-metric__description">{definition.description}</dd>
      </div>
      <DashboardStatValue
        loadState={loadState}
        value={stats?.[definition.key]}
        testId={definition.testId}
      />
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadState, setLoadState] = useState<DashboardLoadState>("loading");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadStats = useCallback(async (signal?: AbortSignal) => {
    setLoadState("loading");
    setStats(null);

    try {
      const [vehiclesRes, routesRes, stopsRes] = await Promise.all([
        api.get("admin/vehicles", { signal }),
        api.get("admin/routes", { signal }),
        api.get("admin/stops", { signal }),
      ]);
      if (signal?.aborted) return;

      const vehicles = requireList(vehiclesRes.data as unknown, "VEHICLES");
      const routes = requireList(routesRes.data as unknown, "ROUTES");
      const stops = requireList(stopsRes.data as unknown, "STOPS");

      setStats({
        activeVehicles: countEnabledVehicles(vehicles),
        totalRoutes: routes.length,
        totalStops: stops.length,
      });
      setUpdatedAt(new Date());
      setLoadState("ready");
    } catch {
      if (signal?.aborted) return;
      console.error("Failed to fetch dashboard stats");
      setStats(null);
      setUpdatedAt(null);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) void loadStats(controller.signal);
    });
    return () => controller.abort();
  }, [loadStats]);

  const updatedAtLabel = updatedAt?.toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="admin-dashboard" data-testid="admin-dashboard-content">
      <header className="admin-dashboard__header">
        <div>
          <p className="admin-dashboard__eyebrow">RSU transport operations</p>
          <h1 className="admin-dashboard__title">Live operations</h1>
          <p className="admin-dashboard__description">
            Verify configured service data and monitor canonical vehicle state from one workspace.
          </p>
        </div>
        <div
          className="admin-dashboard__status"
          data-state={loadState}
          data-testid="admin-dashboard-status"
          role="status"
          aria-live="polite"
        >
          {loadState === "loading" ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : loadState === "error" ? (
            <TriangleAlert size={16} aria-hidden="true" />
          ) : (
            <Clock3 size={16} aria-hidden="true" />
          )}
          {loadState === "loading" && "Loading dashboard data"}
          {loadState === "error" && "Dashboard data unavailable"}
          {loadState === "ready" && `Updated ${updatedAtLabel ?? "—"} น.`}
        </div>
      </header>

      {loadState === "error" && (
        <div className="admin-dashboard__alert" role="alert">
          <div className="admin-dashboard__alert-copy">
            <TriangleAlert className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
            <p>Dashboard counts could not be verified. Unavailable values are shown instead of zeros.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadStats()}
            className="admin-dashboard__retry"
            data-testid="admin-dashboard-retry"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Retry dashboard data
          </button>
        </div>
      )}

      <div className="admin-dashboard__grid">
        <section
          className="admin-panel"
          aria-labelledby="admin-service-map-title"
          data-testid="admin-map-workspace"
        >
          <div className="admin-panel__header">
            <div>
              <p className="admin-panel__eyebrow">Canonical service state</p>
              <h2 className="admin-panel__title" id="admin-service-map-title">Service map</h2>
              <p className="admin-panel__description">
                Snapshot, realtime connection, and last-known state remain visible together.
              </p>
            </div>
            <span className="admin-panel__tag">Primary workspace</span>
          </div>
          <div className="admin-map-frame">
            <LiveMap />
          </div>
        </section>

        <aside className="admin-dashboard__rail" data-testid="admin-configured-inventory">
          <section className="admin-panel admin-inventory" aria-labelledby="admin-inventory-title">
            <div className="admin-inventory__header">
              <p className="admin-panel__eyebrow">Supporting metrics</p>
              <h2 className="admin-panel__title" id="admin-inventory-title">
                Configured service inventory
              </h2>
              <p className="admin-panel__description">
                Master-data totals only. Live telemetry state appears on the map.
              </p>
            </div>

            <dl className="admin-metric-list">
              {dashboardMetrics.map((definition) => (
                <DashboardMetric
                  key={definition.key}
                  definition={definition}
                  loadState={loadState}
                  stats={stats}
                />
              ))}
            </dl>
          </section>

          <section className="admin-panel admin-shortcuts" aria-labelledby="admin-shortcuts-title">
            <p className="admin-panel__eyebrow">Existing destinations</p>
            <h2 className="admin-panel__title" id="admin-shortcuts-title">Workspace shortcuts</h2>
            <div className="admin-shortcuts__list">
              <Link href="/admin/devices" className="admin-shortcut">
                <span className="flex items-center gap-2">
                  <Radio size={17} aria-hidden="true" />
                  Open source health
                </span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/admin/vehicles" className="admin-shortcut">
                <span className="flex items-center gap-2">
                  <Bus size={17} aria-hidden="true" />
                  Manage vehicles
                </span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>

          <div className="admin-scope-note">
            <p className="admin-scope-note__title">Data scope</p>
            <p className="admin-scope-note__text">
              Counts come from verified configuration endpoints. Canonical service state is shown
              only on the map.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
