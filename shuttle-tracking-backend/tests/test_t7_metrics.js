import assert from 'node:assert/strict';
import {
  cadenceAndJitter,
  pairObservations,
  summarizeObservations,
  DEFAULT_PAIRING_WINDOW_MS,
} from '../dist/services/research-metrics.service.js';

const observation = (sourceId, sourceType, receivedAt, latitude, longitude, disposition = 'selected') => ({
  sourceId,
  sourceType,
  vehicleId: 'VH001',
  backendReceiveTime: new Date(receivedAt),
  producerEventTime: null,
  producerClockStatus: null,
  validationOutcome: 'accepted',
  canonicalDisposition: disposition,
  latitude,
  longitude,
  reportedAccuracyValue: 5,
  routeConformanceDistanceM: 10,
});

const mobile = [
  observation('mobile', 'mobile', '2026-07-29T03:00:00.000Z', 13.95, 100.58),
  observation('mobile', 'mobile', '2026-07-29T03:00:01.000Z', 13.9501, 100.5801),
  observation('mobile', 'mobile', '2026-07-29T03:00:02.000Z', 13.9502, 100.5802),
];
const lorawan = [
  observation('lorawan', 'lorawan', '2026-07-29T03:00:00.200Z', 13.95005, 100.58005, 'eligible_not_selected'),
];

const cadence = cadenceAndJitter(mobile);
assert.equal(cadence.cadenceMeanMs, 1000);
assert.equal(cadence.cadenceJitterMs, 0);
const pairs = pairObservations(mobile, lorawan);
assert.equal(DEFAULT_PAIRING_WINDOW_MS, 5000);
assert.equal(pairs.length, 1);
assert.equal(pairs[0].differenceMs, 200);
assert.ok(pairs[0].distanceM > 0);

const summary = summarizeObservations([...mobile, lorawan[0], {
  ...observation('mobile', 'mobile', '2026-07-29T03:00:03.000Z', null, null),
  validationOutcome: 'invalid',
  canonicalDisposition: 'rejected',
}], 2);
assert.equal(summary.validity, 'sufficient_evidence');
assert.equal(summary.missingCount, 1);
assert.equal(summary.groundTruthErrorM, null);
assert.equal(summary.winner, null);
assert.equal(summary.canonicalSelectionShare, 0.75);

console.log('T7 metric formulas, no-snap pair matching, and no-winner checks passed.');
