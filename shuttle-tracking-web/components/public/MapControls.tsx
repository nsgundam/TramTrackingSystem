"use client";
import { memo } from "react";
import { Plus, Minus, Locate } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
}

function MapControls({ onZoomIn, onZoomOut, onLocate }: MapControlsProps) {
  return (
    <div
      className="absolute bottom-4 right-4 md:bottom-10 md:right-10 z-10 flex flex-col gap-1 md:gap-2"
      data-testid="map-controls"
    >
      <button
        type="button"
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        title="Zoom In"
        onClick={onZoomIn}
      >
        <span className="glass-panel flex h-9 w-9 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-white/40!">
          <Plus size={20} className="text-on-surface" />
        </span>
      </button>
      <button
        type="button"
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        title="Zoom Out"
        onClick={onZoomOut}
      >
        <span className="glass-panel flex h-9 w-9 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-white/40!">
          <Minus size={20} className="text-on-surface" />
        </span>
      </button>
      <button
        type="button"
        className="mt-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        title="Current Location"
        onClick={onLocate}
      >
        <span className="glass-panel flex h-9 w-9 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-white/40!">
          <Locate size={20} className="text-on-surface" />
        </span>
      </button>
    </div>
  );
}

export default memo(MapControls);
