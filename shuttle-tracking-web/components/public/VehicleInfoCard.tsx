import { useEffect, useRef } from "react";
import { Stop } from "@/types";
import { Locate } from "lucide-react";

interface VehicleInfoCardProps {
  routeId: string;
  vehicleId: string;
  vehicleName?: string;
  prevStop: string;
  nextStop: string;
  eta: number | null;
  stops: Stop[];
  nextStopId: string | number | null;
  isTracking?: boolean;
  onRecenter?: () => void;
  onFeedbackClick?: (vehicleId: string) => void;
}

export default function VehicleInfoCard({
  routeId,
  vehicleId,
  vehicleName,
  prevStop,
  nextStop,
  eta,
  stops,
  nextStopId,
  isTracking,
  onRecenter,
  onFeedbackClick,
}: VehicleInfoCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nextIdx = stops.findIndex((s) => s.id === nextStopId);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current && nextIdx !== -1) {
        const container = containerRef.current;
        const activeEl = container.querySelector('[data-active="true"]') as HTMLElement;
        if (activeEl) {
          const containerWidth = container.clientWidth;
          const activeWidth = activeEl.offsetWidth;
          const activeLeft = activeEl.offsetLeft;
          const targetScroll = activeLeft - containerWidth / 2 + activeWidth / 2;
          container.scrollTo({
            left: targetScroll,
            behavior: "smooth",
          });
        }
      }
    };
    handleScroll();
    const timeout = setTimeout(handleScroll, 50);
    window.addEventListener("resize", handleScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleScroll);
    };
  }, [nextIdx]);

  return (
    <div className="glass-panel backdrop-blur-sm rounded-xl p-3 sm:p-4 flex flex-col gap-2 w-full select-none">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="font-headline-md text-[16px] sm:text-headline-md text-on-surface flex items-center gap-2">
            <strong>{vehicleName || vehicleId}</strong>
            {onRecenter && (
              <button
                onClick={onRecenter}
                className="p-1 hover:bg-white/20 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center"
                title="Track & Center Camera"
              >
                <Locate 
                  size={16} 
                  className={`transition-colors duration-300 ${
                    isTracking 
                      ? "text-primary" 
                      : "text-on-surface-variant/40 hover:text-on-surface-variant/80"
                  }`} 
                />
              </button>
            )}
          </div>
          <div className="font-body-lg text-[14px] sm:text-body-lg text-on-surface-variant mt-1">
            Next Station: {nextStop}
          </div>
        </div>

        {onFeedbackClick && (
          <button
            onClick={() => onFeedbackClick(vehicleId)}
            className="px-2.5 py-1 text-[11px] sm:text-[12px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1 border border-primary/20 shadow-sm"
            title="แจ้งปัญหา/ข้อเสนอแนะเกี่ยวกับรถคันนี้"
          >
            <span>💬 แจ้งปัญหา</span>
          </button>
        )}
      </div>

      {/* Horizontally scrolling list of stations */}
      <div
        ref={containerRef}
        className="flex font-label-caps text-label-caps text-on-surface-variant overflow-x-hidden w-full no-scrollbar scroll-smooth"
      >
        {stops.map((stop) => {
          const isNext = stop.id === nextStopId;
          const stopName = stop.nameTh || stop.name;
          return (
            <span
              key={stop.id}
              data-active={isNext ? "true" : "false"}
              className={`shrink-0 text-center whitespace-nowrap px-4 transition-colors py-1 ${
                isNext
                  ? "font-bold text-primary border-b-2 border-primary pb-0.5"
                  : "text-on-surface-variant/70"
              }`}
            >
              {stopName}
            </span>
          );
        })}
      </div>
    </div>
  );
}
