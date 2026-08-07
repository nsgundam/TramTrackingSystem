import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import type { CanonicalVehicleStateV1 } from "../types/canonical-state";
import {
  getCanonicalDisplayState,
  getCanonicalExpiryDelayMs,
  getPublicAvailabilityPresentation,
  reconcileCanonicalVehicleSnapshot,
  resolveVerifiedFeedbackVehicleId,
} from "../utils/truthful-ui-state";

const canonicalState = (
  vehicleId: string,
  stateVersion: number,
  overrides: Partial<CanonicalVehicleStateV1> = {},
): CanonicalVehicleStateV1 => ({
  schemaVersion: 1,
  eventType: "canonical_vehicle_state",
  stateEpoch: "t14-epoch",
  stateVersion,
  vehicleId,
  tripId: "trip-1",
  routeId: "R01",
  routeAuthority: "active_trip",
  serviceState: "live",
  reasonCode: "CANONICAL_SELECTED",
  liveLocation: { lat: 13.98, lng: 100.58, speed: 10, heading: 0, accuracy: 5, station: null },
  lastKnownLocation: { lat: 13.98, lng: 100.58, speed: 10, heading: 0, accuracy: 5, station: null },
  timing: {
    observedAt: null,
    receivedAt: "2026-08-08T00:00:00.000Z",
    selectedAt: "2026-08-08T00:00:00.000Z",
    freshnessClock: "server_receive",
  },
  freshness: { ageMs: 500, thresholdMs: 30_000, bucket: "fresh" },
  sourceType: "mobile",
  ...overrides,
});

test("T14 accepts only an initial Feedback vehicle returned by the server", () => {
  const vehicles = [{ id: "verified-1" }, { id: "verified-2" }];
  assert.equal(resolveVerifiedFeedbackVehicleId("verified-2", vehicles), "verified-2");
  assert.equal(resolveVerifiedFeedbackVehicleId("fabricated", vehicles), "");
  assert.equal(resolveVerifiedFeedbackVehicleId(null, vehicles), "");
});

test("T14 presents Public connection and canonical service state without a false live claim", () => {
  const zeroCounts = { live: 0, stale: 0, no_service: 0, unknown: 0 };
  assert.deepEqual(
    getPublicAvailabilityPresentation({
      counts: zeroCounts,
      connectionState: "disconnected",
      hasAuthoritativeState: true,
    }),
    { label: "ข้อมูลสดไม่พร้อม", value: "—", tone: "unavailable", isLive: false },
  );
  assert.deepEqual(
    getPublicAvailabilityPresentation({
      counts: { ...zeroCounts, stale: 2 },
      connectionState: "connected",
      hasAuthoritativeState: true,
    }),
    { label: "ข้อมูลตำแหน่งล่าช้า", value: "2 คัน", tone: "warning", isLive: false },
  );
  assert.equal(
    getPublicAvailabilityPresentation({
      counts: { ...zeroCounts, live: 1 },
      connectionState: "connected",
      hasAuthoritativeState: true,
    }).isLive,
    true,
  );
});

test("T14 projects local expiry to stale last-known state", () => {
  const live = canonicalState("vehicle-1", 1);
  assert.equal(getCanonicalExpiryDelayMs(live), 29_500);
  assert.deepEqual(getCanonicalDisplayState(live, true), {
    serviceState: "stale",
    location: live.lastKnownLocation,
    isLocallyExpired: true,
  });
});

test("T14 snapshot reconciliation drops absent state and replays only newer queued state", () => {
  const snapshot = canonicalState("kept", 2);
  const olderQueued = canonicalState("kept", 1);
  const newerQueued = canonicalState("queued", 4);
  const result = reconcileCanonicalVehicleSnapshot([snapshot], [olderQueued, newerQueued]);

  assert.deepEqual(Object.keys(result).sort(), ["kept", "queued"]);
  assert.equal(result.kept.stateVersion, 2);
  assert.equal(result.queued.stateVersion, 4);
  assert.equal(result.absent, undefined);
});

test("T14 source removes fabricated claims and bypasses realtime transport in the Service Worker", async () => {
  const [feedbackSource, dashboardSource, serviceWorkerSource] = await Promise.all([
    readFile(resolve(process.cwd(), "components/public/FeedbackModal.tsx"), "utf8"),
    readFile(resolve(process.cwd(), "app/admin/dashboard/page.tsx"), "utf8"),
    readFile(resolve(process.cwd(), "public/sw.js"), "utf8"),
  ]);

  assert.doesNotMatch(feedbackSource, /VH001|VH002|fallbackList/);
  assert.doesNotMatch(dashboardSource, /Live System Active|active & tracking/i);
  assert.match(serviceWorkerSource, /pathname\.startsWith\('\/socket\.io\/'\)/);
});
