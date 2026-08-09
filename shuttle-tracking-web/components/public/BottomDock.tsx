"use client";
import { memo } from "react";
import { Stop } from "@/types";
import StopInfoCard from "@/components/public/StopInfoCard";
import VehicleInfoCard from "@/components/public/VehicleInfoCard";
import type { PublicAvailabilityReason } from "@/utils/truthful-ui-state";

interface ActiveVehicleInfo {
  prev: string;
  next: string;
  eta: number | null;
  nextStopId: string | number | null;
}

interface BottomDockProps {
  selectedVehicleId: string | null;
  activeVehicleInfo: ActiveVehicleInfo | null;
  vehicleName: string | undefined;
  stopsByRoute: Stop[];
  selectedRoute: string;
  isTracking: boolean;
  targetStop: Stop | null;
  realEta: number | null;
  availabilityReason: PublicAvailabilityReason;
  onRecenter: () => void;
  onFeedbackClick: (vehicleId?: string | null) => void;
}

function BottomDock({
  selectedVehicleId,
  activeVehicleInfo,
  vehicleName,
  stopsByRoute,
  isTracking,
  targetStop,
  realEta,
  availabilityReason,
  onRecenter,
  onFeedbackClick,
}: BottomDockProps) {
  return (
    <div
      className="absolute bottom-4 left-4 md:bottom-10 md:left-10 z-10 w-70 max-w-[calc(100%-80px)] sm:w-[320px] sm:max-w-[calc(100%-32px)] flex flex-col gap-1 md:gap-2"
      data-testid="bottom-dock"
    >
      {/* Show Stop Info Card when no vehicle is selected */}
      {!selectedVehicleId && (
        <StopInfoCard
          targetStop={targetStop}
          eta={realEta}
          availabilityReason={availabilityReason}
        />
      )}

      {/* Show Vehicle Info Card when a vehicle is selected */}
      {selectedVehicleId && activeVehicleInfo && (
        <VehicleInfoCard
          vehicleId={selectedVehicleId}
          vehicleName={vehicleName}
          nextStop={activeVehicleInfo.next}
          stops={stopsByRoute}
          nextStopId={activeVehicleInfo.nextStopId}
          isTracking={isTracking}
          onRecenter={onRecenter}
          onFeedbackClick={onFeedbackClick}
        />
      )}
    </div>
  );
}

export default memo(BottomDock);
