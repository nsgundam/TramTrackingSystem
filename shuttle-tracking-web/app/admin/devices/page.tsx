"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Radio, RefreshCw } from "lucide-react";
import api from "@/services/api";

interface DeviceHealth {
  sourceType: string;
  vehicle: { id: string; name: string } | null;
  freshness: "online" | "stale" | "never_seen" | "disabled";
  lastSeenAt: string | null;
  status: string;
  errorCategory: "none" | "never_seen" | "stale" | "disabled";
}

const freshnessStyle: Record<DeviceHealth["freshness"], string> = {
  online: "bg-emerald-50 text-emerald-700 border-emerald-200",
  stale: "bg-amber-50 text-amber-700 border-amber-200",
  never_seen: "bg-slate-100 text-slate-700 border-slate-200",
  disabled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function DeviceHealthPage() {
  const [devices, setDevices] = useState<DeviceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("admin/devices/health");
      setDevices(response.data as DeviceHealth[]);
    } catch {
      setError("Unable to load the safe source-health view.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Source Health</h1>
          <p className="text-sm text-slate-500">Read-only operational freshness. Credentials, payloads, locations, and IP data are never shown here.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        This is a safe read-only view. Shared-phone recovery, credential rotation, assignment, and source changes are not available here.
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-12 text-slate-500"><RefreshCw className="animate-spin" size={18} /> Loading source health…</div>
      ) : devices.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">No sources are registered.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {devices.map((device, index) => (
            <article key={`${device.sourceType}-${device.vehicle?.id ?? "unassigned"}-${index}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Radio size={17} /> {device.sourceType}</h2>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${freshnessStyle[device.freshness]}`}>{device.freshness.replace("_", " ")}</span>
              </div>
              <dl className="mt-5 grid gap-3 text-sm">
                <div><dt className="text-muted-on-light">Assigned vehicle</dt><dd className="font-medium text-slate-800">{device.vehicle ? `${device.vehicle.name} (${device.vehicle.id})` : "Unassigned"}</dd></div>
                <div><dt className="text-muted-on-light">Last seen</dt><dd className="font-medium text-slate-800">{device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : "Never"}</dd></div>
                <div className="flex items-center gap-2"><AlertTriangle size={15} className="text-muted-on-light" /><span className="text-slate-500">Error category:</span><span className="font-medium text-slate-800">{device.errorCategory}</span></div>
                <div className="flex items-center gap-2"><Activity size={15} className="text-muted-on-light" /><span className="text-slate-500">Source status:</span><span className="font-medium text-slate-800">{device.status}</span></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
