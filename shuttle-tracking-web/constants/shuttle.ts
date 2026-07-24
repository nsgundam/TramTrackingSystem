import L from "leaflet";

// === Constants ===
export const AVERAGE_BUS_SPEED_KMH = 15;
export const METERS_PER_MIN = AVERAGE_BUS_SPEED_KMH * (1000 / 60);
export const ROUTE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// === Icons ===
export const DEFAULT_STOP_ICON = L.icon({
  iconUrl: "/icons/stop.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  className: "stop-marker-tour",
});

export const ACTIVE_STOP_ICON = L.icon({
  iconUrl: "/icons/stop.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
  className: "stop-marker-tour",
});