import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import type { CanonicalVehicleStateV1 } from "../types/canonical-state";
import {
  formatPublicLastUpdate,
  getCanonicalDisplayState,
  getCanonicalExpiryDelayMs,
  getPublicAvailabilityPresentation,
  getPublicEtaPresentation,
  reconcileCanonicalVehicleSnapshot,
  resolveVerifiedFeedbackVehicleId,
  selectLatestCanonicalUpdateAt,
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
      snapshotState: "ready",
      lastCanonicalUpdateAt: "2026-08-08T00:00:00.000Z",
      nowMs: Date.parse("2026-08-08T00:02:00.000Z"),
    }),
    {
      reason: "disconnected",
      label: "ข้อมูลสดไม่พร้อม",
      value: "—",
      tone: "unavailable",
      isLive: false,
      detail: "ระบบจะลองเชื่อมต่อข้อมูลสดอีกครั้งอัตโนมัติ",
      lastUpdateText: "อัปเดตล่าสุด 2 นาทีที่แล้ว",
      canRetry: true,
    },
  );
  assert.deepEqual(
    getPublicAvailabilityPresentation({
      counts: { ...zeroCounts, stale: 2 },
      connectionState: "connected",
      hasAuthoritativeState: true,
      snapshotState: "ready",
      lastCanonicalUpdateAt: null,
    }),
    {
      reason: "stale",
      label: "ข้อมูลตำแหน่งล่าช้า",
      value: "2 คัน",
      tone: "warning",
      isLive: false,
      detail: "แสดงสถานะล่าสุดที่ระบบยืนยันได้",
      lastUpdateText: null,
      canRetry: false,
    },
  );
  assert.deepEqual(
    getPublicAvailabilityPresentation({
      counts: { ...zeroCounts, live: 1 },
      connectionState: "connected",
      hasAuthoritativeState: true,
      snapshotState: "ready",
      lastCanonicalUpdateAt: "2026-08-08T00:00:40.000Z",
      nowMs: Date.parse("2026-08-08T00:01:00.000Z"),
    }),
    {
      reason: "live",
      label: "Active Trams",
      value: "1 คัน",
      tone: "live",
      isLive: true,
      detail: null,
      lastUpdateText: "อัปเดตล่าสุดไม่ถึง 1 นาที",
      canRetry: false,
    },
  );
});

test("T14 exposes snapshot failure and retry without inventing a dependency cause", () => {
  const presentation = getPublicAvailabilityPresentation({
    counts: { live: 0, stale: 0, no_service: 0, unknown: 0 },
    connectionState: "connected",
    hasAuthoritativeState: false,
    snapshotState: "error",
    lastCanonicalUpdateAt: null,
  });

  assert.deepEqual(presentation, {
    reason: "snapshot_error",
    label: "โหลดสถานะล่าสุดไม่สำเร็จ",
    value: "—",
    tone: "unavailable",
    isLive: false,
    detail: "ยังไม่มีสถานะรถที่ยืนยันได้",
    lastUpdateText: null,
    canRetry: true,
  });
  assert.doesNotMatch(`${presentation.label} ${presentation.detail}`, /ฐานข้อมูล|เซิร์ฟเวอร์|อุปกรณ์|สัญญาณอินเทอร์เน็ต/);
});

test("T14 derives last-update age only from valid canonical selection time", () => {
  const nowMs = Date.parse("2026-08-08T12:00:00.000Z");
  assert.equal(formatPublicLastUpdate("2026-08-08T11:59:40.000Z", nowMs), "อัปเดตล่าสุดไม่ถึง 1 นาที");
  assert.equal(formatPublicLastUpdate("2026-08-08T11:55:00.000Z", nowMs), "อัปเดตล่าสุด 5 นาทีที่แล้ว");
  assert.equal(formatPublicLastUpdate("invalid", nowMs), null);
  assert.equal(formatPublicLastUpdate(null, nowMs), null);

  assert.equal(
    selectLatestCanonicalUpdateAt("2026-08-08T11:00:00.000Z", "2026-08-08T11:30:00.000Z"),
    "2026-08-08T11:30:00.000Z",
  );
  assert.equal(
    selectLatestCanonicalUpdateAt("2026-08-08T11:30:00.000Z", "invalid"),
    "2026-08-08T11:30:00.000Z",
  );
});

test("T14 ETA projection never turns unavailable or stale data into a current ETA", () => {
  assert.deepEqual(getPublicEtaPresentation(4, "disconnected"), {
    value: null,
    statusText: "ETA รอข้อมูลสด",
    tone: "unavailable",
  });
  assert.deepEqual(getPublicEtaPresentation(4, "stale"), {
    value: null,
    statusText: "ข้อมูลรถล่าช้า",
    tone: "warning",
  });
  assert.deepEqual(getPublicEtaPresentation(null, "live"), {
    value: null,
    statusText: "ยังไม่มี ETA สำหรับป้ายนี้",
    tone: "neutral",
  });
  assert.deepEqual(getPublicEtaPresentation(0, "live"), {
    value: 0,
    statusText: "กำลังมาถึง!",
    tone: "live",
  });
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
  const [feedbackSource, dashboardSource, serviceWorkerSource, stopInfoSource] = await Promise.all([
    readFile(resolve(process.cwd(), "components/public/FeedbackModal.tsx"), "utf8"),
    readFile(resolve(process.cwd(), "app/admin/dashboard/page.tsx"), "utf8"),
    readFile(resolve(process.cwd(), "public/sw.js"), "utf8"),
    readFile(resolve(process.cwd(), "components/public/StopInfoCard.tsx"), "utf8"),
  ]);

  assert.doesNotMatch(feedbackSource, /VH001|VH002|fallbackList/);
  assert.doesNotMatch(dashboardSource, /Live System Active|active & tracking/i);
  assert.match(serviceWorkerSource, /pathname\.startsWith\('\/socket\.io\/'\)/);
  assert.doesNotMatch(stopInfoSource, /ยังไม่มีรถในสายนี้/);
});
