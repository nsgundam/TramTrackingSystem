import assert from 'node:assert/strict';

const {
  TRIP_ACTIVITY_MIN_DISPLACEMENT_METERS,
  TRIP_ACTIVITY_MIN_SPEED_MPS,
  TRIP_INACTIVITY_TIMEOUT_MS,
  displacementMeters,
  isMeaningfulMovement,
  isTripInactive,
} = await import('../dist/services/trip-activity.service.js');

const base = { lat: 13.964139, lng: 100.58752, speed: 0, timestamp: 0 };
const jitter = {
  ...base,
  lat: base.lat + 0.00002,
  timestamp: 1_000,
};
const meaningfulDisplacement = {
  ...base,
  lat: base.lat + 0.0003,
  timestamp: 2_000,
};

assert.ok(displacementMeters(base, meaningfulDisplacement) >= TRIP_ACTIVITY_MIN_DISPLACEMENT_METERS);
assert.equal(isMeaningfulMovement(null, base), false, 'a first stationary packet is telemetry only');
assert.equal(isMeaningfulMovement(base, jitter), false, 'small GPS jitter is not trip activity');
assert.equal(isMeaningfulMovement(base, meaningfulDisplacement), true, 'real displacement is trip activity');
assert.equal(
  isMeaningfulMovement(base, { ...base, speed: TRIP_ACTIVITY_MIN_SPEED_MPS }),
  true,
  'configured speed threshold is trip activity',
);

const activityAt = new Date('2026-08-18T00:00:00.000Z');
const beforeTimeout = new Date(activityAt.getTime() + TRIP_INACTIVITY_TIMEOUT_MS - 1);
const atTimeout = new Date(activityAt.getTime() + TRIP_INACTIVITY_TIMEOUT_MS);
assert.equal(isTripInactive(activityAt, beforeTimeout), false, '14:59 is not inactive');
assert.equal(isTripInactive(activityAt, atTimeout), true, '15:00 closes inactivity window');
assert.equal(
  isTripInactive(atTimeout, new Date(atTimeout.getTime() + 1)),
  false,
  'new activity resets the inactivity timer',
);

console.log('Trip activity and inactivity policy tests passed.');
