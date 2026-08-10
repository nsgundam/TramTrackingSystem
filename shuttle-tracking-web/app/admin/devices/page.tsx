"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Radio, RefreshCw, ShieldCheck } from "lucide-react";
import api from "@/services/api";
import {
  AdminNotice,
  AdminResourcePage,
  AdminResourcePanel,
  AdminResourceState,
  AdminStatusBadge,
} from "@/components/admin/AdminResourcePage";

interface DeviceHealth {
  sourceType: string;
  vehicle: { id: string; name: string } | null;
  freshness: "online" | "stale" | "never_seen" | "disabled";
  lastSeenAt: string | null;
  status: string;
  errorCategory: "none" | "never_seen" | "stale" | "disabled";
}

const freshnessTone: Record<
  DeviceHealth["freshness"],
  "positive" | "warning" | "neutral" | "danger"
> = {
  online: "positive",
  stale: "warning",
  never_seen: "neutral",
  disabled: "danger",
};

const formatState = (value: string) => value.replaceAll("_", " ");

export default function DeviceHealthPage() {
  const [devices, setDevices] = useState<DeviceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<DeviceHealth[]>("admin/devices/health");
      setDevices(response.data);
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
    <AdminResourcePage
      resource="source-health"
      eyebrow="Operational visibility"
      title="Source Health"
      description="Verify when each registered source was last observed without exposing sensitive telemetry."
      actionLabel={loading ? "Refreshing…" : "Refresh"}
      actionIcon={<RefreshCw size={18} aria-hidden="true" />}
      actionTone="secondary"
      actionBusy={loading}
      onAction={() => void load()}
    >
      <AdminNotice
        kind="read-only"
        title="Read-only boundary"
        icon={<ShieldCheck size={19} />}
      >
        Credentials, payloads, locations, and IP data are never shown here. Shared-phone recovery,
        credential rotation, assignment, and source changes remain outside this view.
      </AdminNotice>

      <AdminResourcePanel>
        {loading ? (
          <AdminResourceState state="loading" message="Loading source health…" />
        ) : error ? (
          <AdminResourceState
            state="error"
            title="Source health is unverified"
            message={error}
            retryLabel="Retry loading source health"
            onRetry={() => void load()}
          />
        ) : devices.length === 0 ? (
          <AdminResourceState state="empty" message="No sources are registered." />
        ) : (
          <div
            className="admin-operations-ledger admin-source-ledger"
            data-admin-operations-ledger="source-health"
          >
            {devices.map((device, index) => (
              <article
                key={`${device.sourceType}-${device.vehicle?.id ?? "unassigned"}-${index}`}
                className="admin-operation-record"
                data-admin-signal={device.freshness}
              >
                <header className="admin-operation-record__header">
                  <div className="admin-operation-record__identity">
                    <span className="admin-operation-record__icon" aria-hidden="true">
                      <Radio size={18} />
                    </span>
                    <div>
                      <p className="admin-operation-record__eyebrow">Tracking source</p>
                      <h2 className="admin-operation-record__title">{device.sourceType}</h2>
                    </div>
                  </div>
                  <AdminStatusBadge
                    label={formatState(device.freshness)}
                    tone={freshnessTone[device.freshness]}
                  />
                </header>

                <dl className="admin-operation-facts">
                  <div>
                    <dt>Assigned vehicle</dt>
                    <dd>{device.vehicle ? `${device.vehicle.name} (${device.vehicle.id})` : "Unassigned"}</dd>
                  </div>
                  <div>
                    <dt>Last seen</dt>
                    <dd>{device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : "Never"}</dd>
                  </div>
                  <div>
                    <dt><AlertTriangle size={15} aria-hidden="true" /> Error category</dt>
                    <dd>{formatState(device.errorCategory)}</dd>
                  </div>
                  <div>
                    <dt><Activity size={15} aria-hidden="true" /> Source status</dt>
                    <dd>{formatState(device.status)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </AdminResourcePanel>
    </AdminResourcePage>
  );
}
