import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  compareCanonicalStateVersion,
  toPublicCanonicalState,
} from '../dist/services/canonical-state.service.js';

const sample = {
  schemaVersion: 1,
  eventType: 'canonical_vehicle_state',
  stateEpoch: 'epoch-a',
  stateVersion: 4,
  vehicleId: 'VH001',
  tripId: null,
  routeId: 'R01',
  routeAuthority: 'vehicle_assignment',
  serviceState: 'live',
  reasonCode: 'CANONICAL_SELECTED',
  liveLocation: { lat: 13.9, lng: 100.5, speed: 12, heading: 90, accuracy: null, station: null },
  lastKnownLocation: { lat: 13.9, lng: 100.5, speed: 12, heading: 90, accuracy: null, station: null },
  timing: {
    observedAt: null,
    receivedAt: new Date().toISOString(),
    selectedAt: new Date().toISOString(),
    freshnessClock: 'server_receive',
  },
  freshness: { ageMs: 0, thresholdMs: 30000, bucket: 'fresh' },
  sourceType: 'mobile',
  sourceId: 'TS_MOB_01',
};

assert.equal(compareCanonicalStateVersion(sample, { stateEpoch: 'epoch-a', stateVersion: 3 }), 1);
assert.equal(compareCanonicalStateVersion(sample, { stateEpoch: 'epoch-a', stateVersion: 4 }), 0);
assert.equal(compareCanonicalStateVersion(sample, { stateEpoch: 'epoch-a', stateVersion: 5 }), -1);
assert.equal(compareCanonicalStateVersion(sample, { stateEpoch: 'epoch-b', stateVersion: 1 }), 1);

const publicState = toPublicCanonicalState(sample);
assert.equal(publicState.sourceId, undefined);
assert.equal(publicState.liveLocation?.lat, sample.liveLocation.lat);
assert.equal(publicState.routeAuthority, 'vehicle_assignment');
assert.equal(publicState.serviceState, 'live');

const [serviceSource, trackingSource, serverSource, ingestSource] = await Promise.all([
  readFile('src/services/canonical-state.service.ts', 'utf8'),
  readFile('src/services/tracking.service.ts', 'utf8'),
  readFile('src/server.ts', 'utf8'),
  readFile('src/routes/ingest.route.ts', 'utf8'),
]);

assert.match(serviceSource, /INCR/);
assert.match(serviceSource, /stateEpoch/);
assert.match(serviceSource, /stateVersion/);
assert.match(serviceSource, /sourceId: _sourceId/);
assert.match(trackingSource, /publishCanonicalState/);
assert.doesNotMatch(serverSource, /io\.emit\(["']location-update/);
assert.doesNotMatch(ingestSource, /io\.emit\(["']location-update/);

console.log('T6 canonical state contract and publication boundary checks passed.');
