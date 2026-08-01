import assert from 'node:assert/strict';

const { BoundaryError } = await import('../dist/middleware/boundary-errors.js');
const { parseRouteStopReplace } = await import('../dist/middleware/validation.js');
const {
  assertActiveRouteStopMembership,
  buildOrderedRouteStops,
} = await import('../dist/services/route-stop-order.service.js');

assert.deepEqual(parseRouteStopReplace({ stopIds: ['S03', 'S01', 'S02'] }), {
  stopIds: ['S03', 'S01', 'S02'],
});

for (const payload of [
  {},
  { stopIds: 'S01' },
  { stopIds: ['S01', 'S01'] },
  { stopIds: ['', 'S02'] },
  { stopIds: Array.from({ length: 1001 }, (_, index) => `S${index}`) },
]) {
  assert.throws(() => parseRouteStopReplace(payload), BoundaryError);
}

assert.deepEqual(
  buildOrderedRouteStops('R01', ['S03', 'S01', 'S02']),
  [
    { routeId: 'R01', stopId: 'S03', stopOrder: 1 },
    { routeId: 'R01', stopId: 'S01', stopOrder: 2 },
    { routeId: 'R01', stopId: 'S02', stopOrder: 3 },
  ],
);

assert.deepEqual(buildOrderedRouteStops('R01', []), []);
assert.throws(
  () => buildOrderedRouteStops('R01', ['S01', 'S01']),
  BoundaryError,
);

assert.doesNotThrow(() => assertActiveRouteStopMembership(['S03', 'S01'], ['S01', 'S03', 'S04']));
assert.throws(
  () => assertActiveRouteStopMembership(['S03', 'S02'], ['S03']),
  BoundaryError,
);

console.log('T10 route-stop replacement validation and ordering checks passed.');
