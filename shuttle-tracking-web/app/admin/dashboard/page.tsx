"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Bus, Clock3, Map, MapPin, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import api from "@/services/api";

const LiveMap = dynamic(() => import("@/components/admin/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-muted-on-light">
      Loading Map...
    </div>
  ),
});

interface DashboardStats {
  activeVehicles: number;
  totalRoutes: number;
  totalStops: number;
}

type DashboardLoadState = "loading" | "ready" | "error";

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
  spinnerClass,
  testId,
}: {
  loadState: DashboardLoadState;
  value: number | undefined;
  spinnerClass: string;
  testId: string;
}) {
  if (loadState === "loading") {
    return <Loader2 className={`w-8 h-8 animate-spin mt-2 ${spinnerClass}`} aria-label="Loading" />;
  }

  return (
    <h3 className="text-3xl font-extrabold text-slate-900 mt-2 font-display" data-testid={testId}>
      {loadState === "ready" ? value ?? "—" : "—"}
    </h3>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Live Dashboard
          </h1>
          <p className="text-slate-500 font-medium">Monitor shuttle buses in real-time</p>
        </div>
        <div
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold border shadow-xs ${
            loadState === "error"
              ? "bg-red-50 text-red-700 border-red-200/60"
              : "bg-slate-50 text-slate-700 border-slate-200/60"
          }`}
          data-testid="admin-dashboard-status"
          role="status"
          aria-live="polite"
        >
          {loadState === "loading" ? (
            <Loader2 size={16} className="animate-spin text-slate-500" />
          ) : loadState === "error" ? (
            <TriangleAlert size={16} className="text-red-600" />
          ) : (
            <Clock3 size={16} className="text-blue-600" />
          )}
          {loadState === "loading" && "Loading dashboard data"}
          {loadState === "error" && "Dashboard data unavailable"}
          {loadState === "ready" && `Updated ${updatedAtLabel ?? "—"} น.`}
        </div>
      </div>

      {loadState === "error" && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <div className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 shrink-0" size={18} />
            <p>Dashboard counts could not be verified. Unavailable values are shown instead of zeros.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadStats()}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 font-semibold text-red-800 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            data-testid="admin-dashboard-retry"
          >
            <RefreshCw size={16} />
            Retry dashboard data
          </button>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Vehicles Card */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Vehicles enabled</p>
              <DashboardStatValue
                loadState={loadState}
                value={stats?.activeVehicles}
                spinnerClass="text-blue-600"
                testId="admin-stat-vehicles"
              />
            </div>
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl shadow-xs">
              <Bus size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-medium">Operational status; live telemetry is shown below</p>
        </div>

        {/* Total Routes Card */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Routes</p>
              <DashboardStatValue
                loadState={loadState}
                value={stats?.totalRoutes}
                spinnerClass="text-indigo-600"
                testId="admin-stat-routes"
              />
            </div>
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-xs">
              <Map size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-medium">Configured shuttle lines</p>
        </div>

        {/* Total Stops Card */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Transit Stops</p>
              <DashboardStatValue
                loadState={loadState}
                value={stats?.totalStops}
                spinnerClass="text-emerald-600"
                testId="admin-stat-stops"
              />
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-xs">
              <MapPin size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-medium">Designated picking spots</p>
        </div>
      </div>

      {/* Live Map Component */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-1 shadow-xs overflow-hidden">
        <LiveMap />
      </div>
    </div>
  );
}
