import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Prisma } from '@prisma/client';

const {
  parseBoundedId,
  parseRouteCreate,
  parseRouteUpdate,
  parseStopCreate,
  parseStopUpdate,
  parseVehicleCreate,
  parseVehicleUpdate,
} = await import('../dist/middleware/validation.js');
const { BoundaryError, mapBoundaryError } = await import('../dist/middleware/boundary-errors.js');
const { mapStopRawCreateError } = await import('../dist/controllers/stops.controller.js');

const invalid = (callback) => assert.throws(callback, (error) =>
  error instanceof BoundaryError
    && error.status === 400
    && error.code === 'INVALID_REQUEST');

assert.equal(parseBoundedId(' VEHICLE-1 '), 'VEHICLE-1');
invalid(() => parseBoundedId('x'.repeat(51)));

assert.deepEqual(parseVehicleCreate({
  id: 'VH01', name: 'Tram 1', type: 'tram', assignedRouteId: '  ',
}), {
  id: 'VH01', name: 'Tram 1', type: 'tram', status: 'inactive', assignedRouteId: null,
});
assert.deepEqual(parseVehicleUpdate({ name: 'Updated', assignedRouteId: '' }), {
  name: 'Updated', assignedRouteId: null,
});
for (const payload of [
  { id: '', name: 'Vehicle', type: 'tram' },
  { id: 'VH01', name: 'x'.repeat(256), type: 'tram' },
  { id: 'VH01', name: 'Vehicle', type: '' },
  { id: 'VH01', name: 'Vehicle', type: 'tram', status: 'unknown' },
]) invalid(() => parseVehicleCreate(payload));
invalid(() => parseVehicleUpdate({}));
invalid(() => parseVehicleUpdate({ id: 'immutable' }));
invalid(() => parseVehicleUpdate({ assignedRouteId: undefined }));

assert.deepEqual(parseRouteCreate({ id: 'R01', name: 'Route 1', color: '#12aBcD' }), {
  id: 'R01', name: 'Route 1', color: '#12aBcD', status: 'inactive',
});
assert.deepEqual(parseRouteUpdate({ color: '#FFFFFF', status: 'active' }), {
  color: '#FFFFFF', status: 'active',
});
for (const color of ['fff', '#FFFFF', '#GGGGGG', '#1234567']) {
  invalid(() => parseRouteCreate({ id: 'R01', name: 'Route', color }));
}
invalid(() => parseRouteCreate({ id: 'R01', name: 'Route', color: '#123456', status: 'maintenance' }));
invalid(() => parseRouteUpdate({}));

assert.deepEqual(parseStopCreate({
  id: 'S01', nameTh: 'ป้าย', nameEn: ' ', lat: '0', lng: 0, imageUrl: '',
}), {
  id: 'S01', nameTh: 'ป้าย', nameEn: null, lat: 0, lng: 0, imageUrl: null,
});
assert.deepEqual(parseStopUpdate({ nameTh: 'ป้าย', lat: -90, lng: 180 }), {
  nameTh: 'ป้าย', lat: -90, lng: 180,
});
for (const payload of [
  { id: 'S01', nameTh: 'Stop', lat: Number.NaN, lng: 0 },
  { id: 'S01', nameTh: 'Stop', lat: 91, lng: 0 },
  { id: 'S01', nameTh: 'Stop', lat: 0, lng: -181 },
  { id: 'S01', nameTh: 'Stop', lat: '1oops', lng: 0 },
]) invalid(() => parseStopCreate(payload));
for (const payload of [
  {},
  { nameTh: 'Stop', lat: 1 },
  { nameTh: 'Stop', lng: 1 },
]) invalid(() => parseStopUpdate(payload));

const prismaCases = [
  ['P2002', 409, 'CONFLICT'],
  ['P2025', 404, 'NOT_FOUND'],
  ['P2003', 422, 'UNPROCESSABLE_REQUEST'],
];
for (const [code, status, expectedCode] of prismaCases) {
  const error = new Prisma.PrismaClientKnownRequestError('value=must-not-leak', {
    code,
    clientVersion: 'test',
  });
  const mapped = mapBoundaryError(error);
  assert.deepEqual({ status: mapped.status, code: mapped.code }, { status, code: expectedCode });
  assert.equal(mapped.message.includes('must-not-leak'), false);
}

const duplicateStopError = new Prisma.PrismaClientKnownRequestError('duplicate value must not leak', {
  code: 'P2010',
  clientVersion: 'test',
  meta: {
    driverAdapterError: {
      name: 'DriverAdapterError',
      cause: { kind: 'postgres', originalCode: '23505', originalMessage: 'duplicate value must not leak' },
    },
  },
});
const duplicateStopBoundary = mapBoundaryError(mapStopRawCreateError(duplicateStopError));
assert.deepEqual({ status: duplicateStopBoundary.status, code: duplicateStopBoundary.code }, {
  status: 409,
  code: 'CONFLICT',
});
assert.equal(duplicateStopBoundary.message.includes('duplicate value'), false);

for (const originalCode of ['23503', '22001']) {
  const otherRawError = new Prisma.PrismaClientKnownRequestError('other raw failure', {
    code: 'P2010',
    clientVersion: 'test',
    meta: {
      driverAdapterError: {
        name: 'DriverAdapterError',
        cause: { kind: 'postgres', originalCode, originalMessage: 'other raw failure' },
      },
    },
  });
  assert.equal(mapStopRawCreateError(otherRawError), otherRawError);
}

const routeContracts = [
  ['vehicles.route.ts', 'admin:vehicle-write', 'parseVehicleCreate', 'parseVehicleUpdate'],
  ['route.route.ts', 'admin:route-write', 'parseRouteCreate', 'parseRouteUpdate'],
  ['stops.route.ts', 'admin:stop-write', 'parseStopCreate', 'parseStopUpdate'],
];
for (const [file, scope, createParser, updateParser] of routeContracts) {
  const source = await readFile(new URL(`../src/routes/${file}`, import.meta.url), 'utf8');
  assert.match(source, new RegExp(`rateLimit\\(\\{ scope: '${scope}'.*RATE_LIMITS\\.admin.*clientAddress`));
  assert.match(source, new RegExp(`router\\.post\\('\\/', adminWriteLimit, validateBody\\(${createParser}\\),`));
  assert.match(source, new RegExp(`router\\.put\\('\\/:id', adminWriteLimit, validateParam\\('id'.*validateBody\\(${updateParser}\\),`));
  assert.match(source, /router\.delete\('\/:id', adminWriteLimit, validateParam\('id'/);
  assert.match(source, /router\.get\('\/:id', validateParam\('id'/);
}
const vehicleRoutes = await readFile(new URL('../src/routes/vehicles.route.ts', import.meta.url), 'utf8');
assert.match(vehicleRoutes, /router\.get\('\/:id\/assignment-qr', validateParam\('id'/);
const routeRoutes = await readFile(new URL('../src/routes/route.route.ts', import.meta.url), 'utf8');
assert.match(routeRoutes, /router\.get\('\/:id\/vehicles', validateParam\('id'/);

for (const file of ['vehicles.controller.ts', 'route.controller.ts', 'stops.controller.ts']) {
  const source = await readFile(new URL(`../src/controllers/${file}`, import.meta.url), 'utf8');
  assert.equal(source.includes('res.status(500)'), false);
  assert.equal(source.includes(': any'), false);
  assert.match(source, /sendBoundaryError/);
}
const stopController = await readFile(new URL('../src/controllers/stops.controller.ts', import.meta.url), 'utf8');
assert.equal(stopController.includes('parseFloat'), false);
assert.equal(stopController.includes('if (lat && lng)'), false);

console.log('Master-data boundary validation, wiring, and safe-error tests passed.');
