"use client";
import { memo } from "react";
import { ChevronDown } from "lucide-react";
import { normalizeHexColor } from "@/utils/colorContrast";

interface RouteData {
  id: string;
  name: string;
  color: string;
  status: string;
}

interface RouteSelectorProps {
  routes: RouteData[];
  selectedRoute: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (routeId: string) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

function RouteSelector({
  routes,
  selectedRoute,
  isOpen,
  onToggle,
  onSelect,
  menuRef,
}: RouteSelectorProps) {
  const currentRoute = routes.find((r) => r.id === selectedRoute);

  return (
    <div className="flex gap-3 w-full relative" ref={menuRef}>
      <div className="route-selector-menu w-full relative">
        <button
          className="w-full glass-panel backdrop-blur-sm rounded-full py-2 px-4 md:py-2.5 font-headline-md text-[14px] md:text-[15px] transition-all duration-300 cursor-pointer flex items-center justify-between text-on-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] hover:bg-white/40!"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)]"
              style={{
                backgroundColor: normalizeHexColor(currentRoute?.color),
              }}
            />
            <span className="truncate max-w-25 md:max-w-30">
              {currentRoute?.name || selectedRoute}
            </span>
          </div>
          <ChevronDown
            size={18}
            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel backdrop-blur-sm rounded-2xl py-2 flex flex-col gap-1 shadow-lg border border-outline-variant/30 overflow-hidden z-50">
            {routes.map((route) => (
              <button
                key={route.id}
                className={`w-full px-4 py-2 text-left text-[14px] transition-all duration-200 flex items-center gap-2 ${
                  selectedRoute === route.id
                    ? "bg-black/5! font-medium"
                    : "hover:bg-white/40!"
                }`}
                onClick={() => {
                  onSelect(route.id);
                  onToggle();
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: normalizeHexColor(route.color) }}
                />
                <span className="truncate">{route.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(RouteSelector);
