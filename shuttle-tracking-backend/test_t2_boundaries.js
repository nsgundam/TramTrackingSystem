import assert from 'node:assert/strict';

const {
  parseAdminLogin,
  parseDeviceCreate,
  parseFeedback,
  parseObservation,
  parseRouteStopCreate,
  parseSenderLogin,
  parseTtnPayload,
  parseTtnSourceId,
  parseTripId,
  parseTripStart,
} = await import('./dist/middleware/validation.js');
const { BoundaryError, mapBoundaryError } = await import('./dist/middleware/boundary-errors.js');

assert.deepEqual(parseAdminLogin({ username: 'admin', password: ' secret ' }), {
  username: 'admin',
  password: ' secret ',
});

assert.deepEqual(parseSenderLogin({ sourceId: 'TS_MOB_01', secret: ' device-secret ', vehicleId: 'VH001' }), {
  sourceId: 'TS_MOB_01',
  secret: ' device-secret ',
  vehicleId: 'VH001',
});

assert.deepEqual(parseObservation({
  sourceId: 'TS_MOB_01',
  lat: '13.964139',
  lng: 100.58752,
  speed: '4.5',
  heading: 90,
}), {
  sourceId: 'TS_MOB_01',
  lat: 13.964139,
  lng: 100.58752,
  speed: 4.5,
  bearing: 90,
});

for (const payload of [
  {},
  { sourceId: 'TS_MOB_01', lat: '13.9oops', lng: 100.5 },
  { sourceId: 'TS_MOB_01', lat: Number.NaN, lng: 100.5 },
  { sourceId: 'TS_MOB_01', lat: 91, lng: 100.5 },
  { sourceId: 'TS_MOB_01', lat: 13.9, lng: 100.5, tripId: 'not-a-uuid' },
]) {
  assert.throws(() => parseObservation(payload), BoundaryError);
}

assert.deepEqual(parseFeedback({ type: 'late', vehicleId: 'VH001', message: 'The shuttle is late.' }), {
  type: 'late',
  vehicleId: 'VH001',
  message: 'The shuttle is late.',
});
assert.throws(() => parseFeedback({ type: 'late', vehicleId: 'VH001', message: 'x'.repeat(2001) }), /invalid/);

assert.deepEqual(parseDeviceCreate({ id: 'TS_ESP_01', name: 'ESP32', type: 'esp32' }), {
  id: 'TS_ESP_01',
  name: 'ESP32',
  type: 'esp32',
  vehicleId: undefined,
  priority: 1,
  status: 'active',
});
assert.throws(() => parseDeviceCreate({ id: 'TS_01', name: 'Bad', type: 'unknown' }), /invalid/);
assert.throws(() => parseDeviceCreate({ id: 'TS_01', name: 'Bad', type: 'mobile', priority: 1.5 }), /integer/);

assert.deepEqual(parseRouteStopCreate({ routeId: 'R01', stopId: 'S01', stopOrder: '2' }), {
  routeId: 'R01',
  stopId: 'S01',
  stopOrder: 2,
});
assert.throws(() => parseRouteStopCreate({ routeId: 'R01', stopId: 'S01', stopOrder: 0 }), /invalid/);
assert.deepEqual(parseTripStart({ vehicleId: 'VH001' }), { vehicleId: 'VH001' });
assert.throws(() => parseTripStart({ vehicleId: '' }), /invalid/);
assert.equal(parseTripId('550e8400-e29b-41d4-a716-446655440000'), '550e8400-e29b-41d4-a716-446655440000');
assert.throws(() => parseTripId('trip-1'), /invalid/);

const ttnStatus = parseTtnPayload({
  end_device_ids: { device_id: 'TTN_DEVICE_01' },
  uplink_message: { decoded_payload: { battery: 95 } },
});
assert.equal(parseTtnSourceId(ttnStatus), 'TTN_DEVICE_01');
assert.throws(() => parseTtnPayload([]), /JSON object/);

const safe = mapBoundaryError(new Error('password=must-not-escape'));
assert.deepEqual({ status: safe.status, code: safe.code, message: safe.message }, {
  status: 500,
  code: 'INTERNAL_ERROR',
  message: 'Internal server error',
});

const limited = new BoundaryError(429, 'RATE_LIMITED', 'Too many requests', 12);
assert.equal(limited.retryAfterSeconds, 12);

console.log('T2 validation and safe-error boundary tests passed.');
