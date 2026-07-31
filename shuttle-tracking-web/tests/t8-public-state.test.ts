import assert from "node:assert/strict";
import test from "node:test";
import type { CanonicalVehicleStateV1 } from "../types/canonical-state.ts";
import {
  canDisplayCanonicalVehicleMarker,
  projectCanonicalVehicleStateCounts,
} from "../utils/canonical-public-state.ts";

const canonicalState = (
  vehicleId: string,
  overrides: Partial<CanonicalVehicleStateV1> = {},
): CanonicalVehicleStateV1 => ({
  schemaVersion: 1,
  eventType: "canonical_vehicle_state",
  stateEpoch: "epoch-1",
  stateVersion: 1,
  vehicleId,
  tripId: "trip-1",
  routeId: "R01",
  routeAuthority: "active_trip",
  serviceState: "live",
  reasonCode: "CANONICAL_SELECTED",
  liveLocation: { lat: 13.0, lng: 100.0, speed: 10, heading: 0, accuracy: 5, station: null },
  lastKnownLocation: null,
  timing: {
    observedAt: "2026-07-31T09:00:00.000Z",
    receivedAt: "2026-07-31T09:00:00.000Z",
    selectedAt: "2026-07-31T09:00:00.000Z",
    freshnessClock: "server_receive",
  },
  freshness: { ageMs: 0, thresholdMs: 30_000, bucket: "fresh" },
  sourceType: "mobile",
  ...overrides,
});

test("T8 projects locally expired live state out of Active Trams", () => {
  const live = canonicalState("vehicle-live");
  const newerLive = canonicalState("vehicle-newer-live", { stateVersion: 2 });
  const stale = canonicalState("vehicle-stale", {
    serviceState: "stale",
    liveLocation: null,
    lastKnownLocation: { lat: 13.0, lng: 100.0, speed: null, heading: null, accuracy: 5, station: null },
    freshness: { ageMs: 30_001, thresholdMs: 30_000, bucket: "stale" },
  });

  assert.deepEqual(
    projectCanonicalVehicleStateCounts(
      { [live.vehicleId]: live, [newerLive.vehicleId]: newerLive, [stale.vehicleId]: stale },
      { [live.vehicleId]: true },
    ),
    { live: 1, stale: 2, no_service: 0, unknown: 0 },
  );
});

test("T8 route switching displays a Marker only for a current, unexpired, authoritative live state", () => {
  const live = canonicalState("vehicle-live");
  const stale = canonicalState("vehicle-stale", { serviceState: "stale", liveLocation: null });
  const noService = canonicalState("vehicle-no-service", { serviceState: "no_service", liveLocation: null });
  const unknown = canonicalState("vehicle-unknown", { serviceState: "unknown", liveLocation: null });
  const unknownRoute = canonicalState("vehicle-unknown-route", { routeAuthority: "unknown", routeId: null });

  assert.equal(canDisplayCanonicalVehicleMarker(live, "R01", false), true);
  assert.equal(canDisplayCanonicalVehicleMarker(live, "R01", true), false);
  assert.equal(canDisplayCanonicalVehicleMarker(live, "R02", false), false);
  assert.equal(canDisplayCanonicalVehicleMarker(stale, "R01", false), false);
  assert.equal(canDisplayCanonicalVehicleMarker(noService, "R01", false), false);
  assert.equal(canDisplayCanonicalVehicleMarker(unknown, "R01", false), false);
  assert.equal(canDisplayCanonicalVehicleMarker(unknownRoute, "R01", false), false);
  assert.equal(canDisplayCanonicalVehicleMarker(undefined, "R01", false), false);
});
