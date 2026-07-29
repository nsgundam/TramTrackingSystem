import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import fixture from './fixtures/t7-mobile-lorawan.json' with { type: 'json' };
import {
  extractResearchMetadata,
  normalizeResearchObservation,
  RESEARCH_METRIC_DEFINITION_VERSION,
} from '../dist/services/research-diagnostics.service.js';

const sessionId = '11111111-1111-4111-8111-111111111111';
const mobile = fixture.observations[0];
const normalized = normalizeResearchObservation({
  sessionId,
  runId: 'run-1',
  sourceId: 'mobile-source-internal',
  sourceType: 'mobile',
  vehicleId: 'VH001',
  transport: 'socketio',
  latitude: mobile.latitude,
  longitude: mobile.longitude,
  speedMps: 4,
  headingDeg: 90,
  accuracy: mobile.reportedAccuracyValue,
  accuracyUnit: mobile.reportedAccuracyUnit,
  accuracyKind: mobile.reportedAccuracyKind,
  metadata: {
    producerEventTime: new Date(mobile.producerEventTime),
    producerEventTimeKind: mobile.producerEventTimeKind,
    producerMonotonicTime: mobile.producerMonotonicTime,
    producerClockStatus: mobile.producerClockStatus,
  },
});

assert.equal(normalized.metricDefinitionVersion, RESEARCH_METRIC_DEFINITION_VERSION);
assert.equal(normalized.producerEventTimeKind, 'android_epoch');
assert.equal(normalized.clockBasis, 'unverified');
assert.equal(normalized.observedTimestampDifferenceMs, null);
assert.equal(normalized.latencyClaim, 'timestamp_difference_only');
assert.equal(normalized.validationOutcome, 'accepted');
assert.match(normalized.sourceUnitKey, /^unit-[a-f0-9]{24}$/);

const ttn = extractResearchMetadata({
  uplink_message: {
    received_at: '2026-07-29T03:00:00.100Z',
    f_cnt: 42,
    f_port: 1,
    rx_metadata: [{ rssi: -92, snr: 7.5 }, { rssi: -96, snr: 4.2 }],
  },
  raw_payload: 'must-not-be-captured',
}, 'ttn_webhook');
assert.equal(ttn.sourceSequence, '42');
assert.equal(ttn.sourceSequenceKind, 'ttn_f_cnt');
assert.equal(ttn.gatewayCount, 2);
assert.equal(ttn.lorawanSnr, 7.5);
assert.equal(ttn.rawPayload, undefined);

const [service, route, migration, schema] = await Promise.all([
  readFile('src/services/research-diagnostics.service.ts', 'utf8'),
  readFile('src/routes/research.route.ts', 'utf8'),
  readFile('prisma/migrations/20260729170000_add_t7_research_diagnostics/migration.sql', 'utf8'),
  readFile('prisma/schema.prisma', 'utf8'),
]);
assert.doesNotMatch(service, /raw_payload|authorization|bearer|secretHash/i);
assert.match(route, /requireResearchAccess/);
assert.match(migration, /CREATE TABLE "research_raw_observations"/);
assert.match(migration, /WHERE "dedupe_key" IS NOT NULL/);
assert.match(schema, /role\s+String\s+@default\("OPERATOR"\)/);
assert.match(schema, /Unsupported\("geography"\)/);

console.log('T7 research envelope, source metadata, and additive schema checks passed.');
