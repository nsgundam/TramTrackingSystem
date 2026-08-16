"use client";
import { memo, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RealtimeConnectionState } from "@/types";
import type { CanonicalVehicleStateCounts } from "@/utils/canonical-public-state";
import {
  getPublicAvailabilityPresentation,
  type PublicVehicleSnapshotState,
} from "@/utils/truthful-ui-state";

interface Props {
  counts: CanonicalVehicleStateCounts;
  connectionState: RealtimeConnectionState;
  hasAuthoritativeState: boolean;
  snapshotState: PublicVehicleSnapshotState;
  lastCanonicalUpdateAt: string | null;
  isRetrying: boolean;
  onRetry: () => void;
}

const dotClasses = {
  live: "bg-emerald-600",
  warning: "bg-amber-500",
  unavailable: "bg-slate-500",
  neutral: "bg-blue-500",
} as const;

function AvailabilityCard({
  counts,
  connectionState,
  hasAuthoritativeState,
  snapshotState,
  lastCanonicalUpdateAt,
  isRetrying,
  onRetry,
}: Props) {
  const { t } = useLanguage();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const presentation = getPublicAvailabilityPresentation({
    counts,
    connectionState,
    hasAuthoritativeState,
    snapshotState,
    lastCanonicalUpdateAt,
    nowMs,
  });

  const availabilityText = (() => {
    switch (presentation.reason) {
      case "reconnecting":
        return {
          label: t("reconnecting"),
          value: "—",
          detail: snapshotState === "error" && !hasAuthoritativeState
            ? t("reconnectingNoStateDetail")
            : t("reconnectingDetail"),
        };
      case "disconnected":
        return { label: t("liveDataUnavailable"), value: "—", detail: t("liveDataUnavailableDetail") };
      case "snapshot_error":
        return { label: t("latestStatusLoadFailed"), value: "—", detail: t("noVerifiedVehicleStatus") };
      case "waiting":
        return { label: t("waitingVehicleData"), value: "—", detail: t("loadingLatestStatus") };
      case "live":
        return { label: t("activeTrams"), value: t("tramCount", { count: counts.live }), detail: null };
      case "stale":
        return { label: t("vehicleLocationDelayed"), value: t("tramCount", { count: counts.stale }), detail: t("showingVerifiedStatus") };
      case "no_service":
        return { label: t("noVehicleLocation"), value: t("tramCount", { count: counts.no_service }), detail: t("noVehicleLocationDetail") };
      case "unknown":
        return { label: t("statusCannotVerify"), value: t("tramCount", { count: counts.unknown }), detail: t("statusCannotVerifyDetail") };
      case "empty":
        return { label: t("noActiveTrams"), value: t("tramCount", { count: 0 }), detail: t("noActiveTramsDetail") };
    }
  })();

  const lastUpdateText = (() => {
    if (!presentation.lastUpdateText || !lastCanonicalUpdateAt || !Number.isFinite(nowMs)) return null;
    const lastUpdateMs = Date.parse(lastCanonicalUpdateAt);
    if (!Number.isFinite(lastUpdateMs)) return null;

    const ageMinutes = Math.floor(Math.max(0, nowMs - lastUpdateMs) / 60_000);
    if (ageMinutes < 1) return t("lastUpdatedJustNow");
    if (ageMinutes < 60) return t("lastUpdatedMinutesAgo", { count: ageMinutes });

    const ageHours = Math.floor(ageMinutes / 60);
    if (ageHours < 24) return t("lastUpdatedHoursAgo", { count: ageHours });
    return t("lastUpdatedDaysAgo", { count: Math.floor(ageHours / 24) });
  })();

  return (
    <div
      className="glass-panel backdrop-blur-sm rounded-2xl px-4 py-2.5 md:px-5 md:py-3 flex flex-col items-stretch gap-2 w-full select-none"
      data-testid="availability-card"
    >
      <div
        className="flex flex-col gap-2"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-busy={snapshotState === "loading" && !hasAuthoritativeState}
      >
        <div className="flex items-center justify-start gap-3">
          <span className="relative flex h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" aria-hidden="true">
            {presentation.isLive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-60" />
            )}
            <span
              className={`relative inline-flex rounded-full h-3.5 w-3.5 md:h-4 md:w-4 ${dotClasses[presentation.tone]}`}
            />
          </span>
          <div className="flex min-w-0 flex-col select-none">
            <span className="font-body-sm text-[12px] md:text-[13px] text-on-surface-variant leading-tight">
              {availabilityText.label}
            </span>
            <span className="font-headline-md text-[16px] md:text-[18px] text-on-surface leading-tight">
              {availabilityText.value}
            </span>
          </div>
        </div>

        {(availabilityText.detail || lastUpdateText) && (
          <div className="flex flex-col gap-0.5 border-t border-outline-variant/30 pt-1.5">
            {availabilityText.detail && (
              <span className="font-body-sm text-[10px] md:text-[11px] leading-snug text-on-surface-variant">
                {availabilityText.detail}
              </span>
            )}
            {lastUpdateText && (
              <span className="font-body-sm text-[10px] md:text-[11px] leading-snug text-on-surface-variant">
                {lastUpdateText}
              </span>
            )}
          </div>
        )}
      </div>

      {(presentation.canRetry || isRetrying) && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-primary/25 bg-primary/10 px-2 py-2 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70"
        >
          <RefreshCw size={14} className={isRetrying ? "animate-spin" : ""} aria-hidden="true" />
          <span>{isRetrying ? t("retryLoading") : t("retryLoad")}</span>
        </button>
      )}
    </div>
  );
}

export default memo(AvailabilityCard);
