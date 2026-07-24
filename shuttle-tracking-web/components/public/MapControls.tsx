"use client";

import { Plus, Minus, Locate } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
}

export default function MapControls({ onZoomIn, onZoomOut, onLocate }: MapControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 z-10 flex flex-col gap-1 md:gap-2">
      <button
        className="glass-panel backdrop-blur-sm rounded-lg w-9 h-9 flex items-center justify-center text-on-surface hover:bg-white/40! transition-colors cursor-pointer"
        title="Zoom In"
        onClick={onZoomIn}
      >
        <Plus size={20} className="text-on-surface" />
      </button>
      <button
        className="glass-panel backdrop-blur-sm rounded-lg w-9 h-9 flex items-center justify-center text-on-surface hover:bg-white/40! transition-colors cursor-pointer"
        title="Zoom Out"
        onClick={onZoomOut}
      >
        <Minus size={20} className="text-on-surface" />
      </button>
      <button
        className="glass-panel backdrop-blur-sm rounded-lg w-9 h-9 flex items-center justify-center text-on-surface hover:bg-white/40! transition-colors mt-2 cursor-pointer"
        title="Current Location"
        onClick={onLocate}
      >
        <Locate size={20} className="text-on-surface" />
      </button>
    </div>
  );
}