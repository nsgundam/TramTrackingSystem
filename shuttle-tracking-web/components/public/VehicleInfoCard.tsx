import { useEffect, useRef } from "react";
import { Stop } from "@/types";

interface VehicleInfoCardProps {
  routeId: string;
  vehicleId: string;
  prevStop: string;
  nextStop: string;
  eta: number | null;
  stops: Stop[];
  nextStopId: string | number | null;
}

export default function VehicleInfoCard({
  routeId,
  vehicleId,
  prevStop,
  nextStop,
  eta,
  stops,
  nextStopId,
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
    <div className="glass-panel rounded-xl p-md flex flex-col gap-sm w-full select-none">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="font-headline-md text-headline-md text-on-surface">
            <strong>Tram {routeId} ({vehicleId})</strong>
          </div>
          <div className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
            Next Station: {nextStop}
          </div>
        </div>
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
              className={`shrink-0 text-center whitespace-nowrap px-4 transition-colors py-xs ${
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
