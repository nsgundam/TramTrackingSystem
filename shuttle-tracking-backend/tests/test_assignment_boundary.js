import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'assignment-boundary-secret';

const { createVehicleQrToken, resolveVehicleIdFromQrToken, vehicleQrUri } = await import(
  '../dist/services/vehicle-qr.service.js'
);

const token = createVehicleQrToken('VH001');
assert.equal(resolveVehicleIdFromQrToken(token), 'VH001');
assert.equal(vehicleQrUri(token), `tramtracking://vehicle/${token}`);
assert.equal(resolveVehicleIdFromQrToken(`${token.slice(0, -1)}x`), null);
assert.equal(resolveVehicleIdFromQrToken('v1.invalid.invalid'), null);

console.log('Tracking assignment QR contract boundary tests passed.');
