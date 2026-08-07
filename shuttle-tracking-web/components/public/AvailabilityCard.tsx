"use client";
import { memo } from "react";
import type { RealtimeConnectionState } from "@/types";
import type { CanonicalVehicleStateCounts } from "@/utils/canonical-public-state";
import { getPublicAvailabilityPresentation } from "@/utils/truthful-ui-state";

interface Props {
  counts: CanonicalVehicleStateCounts;
  connectionState: RealtimeConnectionState;
  hasAuthoritativeState: boolean;
}

const dotClasses = {
  live: "bg-emerald-600",
  warning: "bg-amber-500",
  unavailable: "bg-slate-500",
  neutral: "bg-blue-500",
} as const;

function AvailabilityCard({ counts, connectionState, hasAuthoritativeState }: Props) {
  const presentation = getPublicAvailabilityPresentation({
    counts,
    connectionState,
    hasAuthoritativeState,
  });

  return (
    <div
      className="glass-panel backdrop-blur-sm rounded-2xl px-5 py-2.5 md:px-6 md:py-3 flex items-center justify-start gap-3 w-full select-none"
      data-testid="availability-card"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" aria-hidden="true">
        {presentation.isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-60" />
        )}
        <span
          className={`relative inline-flex rounded-full h-3.5 w-3.5 md:h-4 md:w-4 ${dotClasses[presentation.tone]}`}
        />
      </span>
      <div className="flex flex-col select-none">
        <span className="font-body-sm text-[12px] md:text-[13px] text-on-surface-variant leading-none mb-0.5">
          {presentation.label}
        </span>
        <span className="font-headline-md text-[16px] md:text-[18px] text-on-surface leading-none">
          {presentation.value}
        </span>
      </div>
    </div>
  );
}

export default memo(AvailabilityCard);
