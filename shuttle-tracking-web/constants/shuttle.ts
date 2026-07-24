import L from "leaflet";

// === Constants ===
export const AVERAGE_BUS_SPEED_KMH = 15;
export const METERS_PER_MIN = AVERAGE_BUS_SPEED_KMH * (1000 / 60);
export const ROUTE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// === Icons ===
export const DEFAULT_STOP_ICON = L.icon({
  iconUrl: "/icons/stop.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: "stop-marker-tour",
});

export const ACTIVE_STOP_ICON = L.icon({
  iconUrl: "/icons/stop.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
  className: "stop-marker-tour",
});