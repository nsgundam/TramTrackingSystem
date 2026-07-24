import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  createSocketCanonicalPublisher,
  toPublicCanonicalState,
} from '../dist/services/canonical-state.service.js';

const emitted = [];
const publisher = createSocketCanonicalPublisher({
  emit(event, state) {
    emitted.push({ event, state });
  },
});

await publisher({
  schemaVersion: 1,
  eventType: 'canonical_vehicle_state',
  stateEpoch: 'epoch-a',
  stateVersion: 7,
  vehicleId: 'VH001',
  tripId: null,
  routeId: 'R01',
  routeAuthority: 'active_trip',
  serviceState: 'stale',
  reasonCode: 'ALL_SOURCES_STALE',
  liveLocation: null,
  lastKnownLocation: {
    lat: 13.9,
    lng: 100.5,
    speed: 0,
    heading: null,
    accuracy: null,
    station: 'Building 2',
  },
  timing: {
    observedAt: null,
    receivedAt: new Date().toISOString(),
    selectedAt: new Date().toISOString(),
    freshnessClock: 'server_receive',
  },
  freshness: { ageMs: 31000, thresholdMs: 30000, bucket: 'stale' },
  sourceType: 'mobile',
  sourceId: 'TS_MOB_01',
});

assert.equal(emitted.length, 1);
assert.equal(emitted[0].event, 'location-update');
assert.equal(emitted[0].state.serviceState, 'stale');
assert.equal(emitted[0].state.lastKnownLocation.lat, 13.9);
assert.equal(emitted[0].state.sourceId, undefined);
assert.equal(emitted[0].state.liveLocation, null);
assert.deepEqual(emitted[0].state, toPublicCanonicalState({
  schemaVersion: 1,
  eventType: 'canonical_vehicle_state',
  stateEpoch: 'epoch-a',
  stateVersion: 7,
  vehicleId: 'VH001',
  tripId: null,
  routeId: 'R01',
  routeAuthority: 'active_trip',
  serviceState: 'stale',
  reasonCode: 'ALL_SOURCES_STALE',
  liveLocation: null,
  lastKnownLocation: {
    lat: 13.9,
    lng: 100.5,
    speed: 0,
    heading: null,
    accuracy: null,
    station: 'Building 2',
  },
  timing: emitted[0].state.timing,
  freshness: emitted[0].state.freshness,
  sourceType: 'mobile',
  sourceId: 'TS_MOB_01',
}));

const serverSource = await (await import('node:fs/promises')).readFile('src/server.ts', 'utf8');
const ingestSource = await (await import('node:fs/promises')).readFile('src/routes/ingest.route.ts', 'utf8');
const publicTrackerSource = await readFile('../shuttle-tracking-web/components/public/ShuttleTracker.tsx', 'utf8');
const liveMapSource = await readFile('../shuttle-tracking-web/components/admin/LiveMap.tsx', 'utf8');
assert.match(serverSource, /canonicalState/);
assert.match(ingestSource, /canonicalState/);
assert.doesNotMatch(serverSource, /canonicalLocation\.lat/);
assert.doesNotMatch(ingestSource, /canonicalLocation\.lat/);
assert.match(publicTrackerSource, /serviceState !== "live"/);
assert.match(publicTrackerSource, /<AvailabilityCard count=\{vehicleStateCounts\.live\} \/>/);
assert.doesNotMatch(publicTrackerSource, /เชื่อมต่อข้อมูลสด|กำลังเชื่อมต่อใหม่|ข้อมูลล่าสุดเก่า|ไม่มีบริการ|ข้อมูลขัดข้อง/);
assert.match(publicTrackerSource, /hydrateActiveVehicles/);
assert.match(liveMapSource, /Vehicle service state summary/);
assert.match(liveMapSource, /Unavailable: \{stateCounts\.unknown\}/);

console.log('T6 REST/Socket canonical projection and stale transition checks passed.');
