"use client";
import { memo } from "react";
import { Stop } from "@/types";
import StopInfoCard from "@/components/public/StopInfoCard";
import VehicleInfoCard from "@/components/public/VehicleInfoCard";

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
  onRecenter,
  onFeedbackClick,
}: BottomDockProps) {
  return (
    <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 z-10 w-70 sm:w-[320px] max-w-[calc(100%-32px)] flex flex-col gap-1 md:gap-2">
      {/* Show Stop Info Card when no vehicle is selected */}
      {!selectedVehicleId && <StopInfoCard targetStop={targetStop} eta={realEta} />}

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