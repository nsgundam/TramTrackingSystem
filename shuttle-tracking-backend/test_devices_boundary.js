import assert from 'node:assert/strict';

const { toDeviceMutationResponse, toDeviceResponse } = await import(
  './dist/types/device.js'
);

const secret = 'device-secret-must-not-leak';
const device = {
  id: 'TS_TEST_01',
  name: 'Test sender',
  type: 'mobile',
  vehicleId: 'VH001',
  priority: 1,
  status: 'active',
  secretHash: '$2b$12$hash-must-not-leak',
  credentialVersion: 4,
  credentialIssuedAt: new Date('2026-07-20T00:00:00.000Z'),
  credentialRotatedAt: new Date('2026-07-20T01:00:00.000Z'),
  lastSeenAt: new Date('2026-07-20T02:00:00.000Z'),
  createdAt: new Date('2026-07-19T00:00:00.000Z'),
  vehicle: {
    id: 'VH001',
    name: 'Vehicle 1',
    type: 'tram',
    assignedRouteId: 'RT001',
    status: 'active',
    createdAt: new Date('2026-07-18T00:00:00.000Z'),
  },
};

const serialized = JSON.stringify(toDeviceResponse(device));
assert.equal(Object.hasOwn(toDeviceResponse(device), 'secretHash'), false);
assert.equal(serialized.includes('secretHash'), false);
assert.equal(serialized.includes(device.secretHash), false);
assert.equal(serialized.includes(secret), false);

const mutationResponse = toDeviceMutationResponse(device, 'rotated');
assert.deepEqual(mutationResponse.credentialAction, {
  action: 'rotated',
  version: 4,
});
assert.equal(JSON.stringify(mutationResponse).includes('secretHash'), false);
assert.equal(JSON.stringify(mutationResponse).includes(device.secretHash), false);

console.log('Device response boundary tests passed.');
