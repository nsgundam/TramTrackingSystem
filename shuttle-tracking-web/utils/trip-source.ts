import type { TripSourceType } from "../types/history";

export const TRIP_SOURCE_FILTER_OPTIONS: ReadonlyArray<{
  value: Exclude<TripSourceType, "unknown">;
  label: string;
}> = [
  { value: "mobile", label: "Mobile" },
  { value: "lorawan", label: "LoRaWAN" },
  { value: "esp32", label: "ESP32" },
  { value: "simulator", label: "Simulator" },
];

export const formatTripSourceType = (sourceType: TripSourceType | string): string =>
  TRIP_SOURCE_FILTER_OPTIONS.find((option) => option.value === sourceType)?.label ?? "Unknown";

/** Simulator telemetry is never field evidence, so it is set apart from field sources. */
export const tripSourceTone = (
  sourceType: TripSourceType | string,
): "info" | "warning" | "neutral" => {
  if (sourceType === "simulator") return "warning";
  if (TRIP_SOURCE_FILTER_OPTIONS.some((option) => option.value === sourceType)) return "info";
  return "neutral";
};
