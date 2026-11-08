import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFile } from 'node:fs/promises';

const {
  parseTripHistoryList,
  parseTripHistoryPagination,
  parseTripId,
} = await import('../dist/middleware/validation.js');
const { BoundaryError, mapBoundaryError } = await import('../dist/middleware/boundary-errors.js');
const {
  TRIP_HISTORY_CSV_HEADER,
  TRIP_HISTORY_LIST_ISOLATION,
  TRIP_HISTORY_COMPLETENESS,
  TRIP_HISTORY_TRACK_SEMANTICS,
  buildTripHistoryListQuery,
  buildTripSourceBreakdown,
  csvCell,
  streamTripHistoryCsv,
  toTripHistorySummary,
} = await import('../dist/services/trip-history.service.js');
const { writeExportChunk } = await import('../dist/controllers/adminTripHistory.controller.js');
const { rateLimit } = await import('../dist/middleware/rate-limit.js');

const invalid = (callback) => assert.throws(callback, (error) =>
  error instanceof BoundaryError && error.status === 400 && error.code === 'INVALID_REQUEST');

const listInput = parseTripHistoryList({
  page: '2',
  pageSize: '25',
  vehicleId: ' VH01 ',
  routeId: 'R01',
  status: 'completed',
  from: '2026-08-01',
  to: '2026-08-24T12:30:45.123Z',
});
assert.deepEqual({
  ...listInput,
  from: listInput.from?.toISOString(),
  to: listInput.to?.toISOString(),
}, {
  page: 2,
  pageSize: 25,
  vehicleId: 'VH01',
  routeId: 'R01',
  status: 'completed',
  from: '2026-08-01T00:00:00.000Z',
  to: '2026-08-24T12:30:45.123Z',
});
assert.deepEqual(parseTripHistoryPagination({}), { page: 1, pageSize: 20 });
assert.equal(parseTripId('550e8400-e29b-41d4-a716-446655440000'), '550e8400-e29b-41d4-a716-446655440000');
for (const query of [
  { page: 0 },
  { page: 100001 },
  { pageSize: 101 },
  { status: 'deleted' },
  { sourceType: 'gps' },
  { sourceType: 'SIMULATOR' },
  { sourceType: '' },
  { sourceType: ['mobile', 'esp32'] },
  { vehicleId: 'x'.repeat(51) },
  { from: '08/01/2026' },
  { from: '2026-02-30' },
  { from: '2026-08-24', to: '2026-08-01' },
]) invalid(() => parseTripHistoryList(query));
invalid(() => parseTripId('not-a-uuid'));

const query = buildTripHistoryListQuery(listInput);
assert.equal(query.skip, 25);
assert.equal(query.take, 25);
assert.deepEqual(query.orderBy, [{ startTime: 'desc' }, { id: 'desc' }]);
assert.deepEqual(query.where, {
  vehicleId: 'VH01',
  routeId: 'R01',
  status: 'completed',
  startTime: { gte: listInput.from, lte: listInput.to },
});
assert.equal(Object.hasOwn(query.where, 'gpsTracks'), false);

for (const sourceType of ['mobile', 'lorawan', 'esp32', 'simulator']) {
  const sourceInput = parseTripHistoryList({ sourceType: ` ${sourceType} ` });
  assert.deepEqual(sourceInput, { page: 1, pageSize: 20, sourceType });
  assert.deepEqual(buildTripHistoryListQuery(sourceInput).where, {
    gpsTracks: { some: { source: { type: sourceType } } },
  });
}
assert.deepEqual(
  buildTripHistoryListQuery(parseTripHistoryList({ sourceType: 'simulator', status: 'completed' })).where,
  { status: 'completed', gpsTracks: { some: { source: { type: 'simulator' } } } },
);
assert.deepEqual(buildTripHistoryListQuery(parseTripHistoryList({})).where, {});

const breakdown = buildTripSourceBreakdown([
  { tripId: 'trip-a', sourceType: 'mobile', trackCount: 3 },
  { tripId: 'trip-a', sourceType: 'lorawan', trackCount: 7 },
  { tripId: 'trip-a', sourceType: null, trackCount: 2 },
  { tripId: 'trip-a', sourceType: 'legacy-type', trackCount: 1 },
  { tripId: 'trip-b', sourceType: 'simulator', trackCount: 5 },
  { tripId: 'trip-b', sourceType: 'esp32', trackCount: 5 },
]);
assert.deepEqual(breakdown.get('trip-a'), [
  { sourceType: 'lorawan', trackCount: 7 },
  { sourceType: 'mobile', trackCount: 3 },
  { sourceType: 'unknown', trackCount: 3 },
]);
assert.deepEqual(breakdown.get('trip-b'), [
  { sourceType: 'esp32', trackCount: 5 },
  { sourceType: 'simulator', trackCount: 5 },
]);
assert.equal(breakdown.has('trip-c'), false);
assert.equal(buildTripSourceBreakdown([]).size, 0);
assert.equal(TRIP_HISTORY_LIST_ISOLATION, 'RepeatableRead');
const serviceSource = await readFile(new URL('../src/services/trip-history.service.ts', import.meta.url), 'utf8');
const listBody = serviceSource.slice(serviceSource.indexOf('export const listTripHistory'));
assert.match(
  listBody,
  /prisma\.\$transaction\(async \(tx\) => \{[\s\S]*tx\.trip\.count[\s\S]*tx\.trip\.findMany[\s\S]*readTripSourceCounts\(tx,[\s\S]*isolationLevel: TRIP_HISTORY_LIST_ISOLATION/,
);

assert.equal(Object.hasOwn(query.select, 'gpsTracks'), false);
assert.equal(Object.hasOwn(query.select, 'location'), false);
assert.deepEqual(query.select._count, { select: { gpsTracks: true } });

const tripRecord = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  vehicleId: 'VH01',
  routeId: 'R01',
  status: 'completed',
  startTime: new Date('2026-08-01T01:00:00.000Z'),
  endTime: new Date('2026-08-01T02:00:00.000Z'),
  lastTripActivityAt: new Date('2026-08-01T02:00:00.000Z'),
  closedAt: new Date('2026-08-01T02:00:00.000Z'),
  endReason: 'explicit_end',
  createdAt: new Date('2026-08-01T01:00:00.000Z'),
  vehicle: { id: 'VH01', name: '=Formula Vehicle', type: 'tram' },
  route: { id: 'R01', name: 'Route, "One"', color: '#123456' },
  _count: { gpsTracks: 0 },
};
const summary = toTripHistorySummary(tripRecord);
assert.equal(summary.trackCount, 0);
assert.equal(Object.hasOwn(summary, '_count'), false);
assert.equal(JSON.stringify(summary).includes('lat'), false);
assert.equal(JSON.stringify(summary).includes('lng'), false);
assert.equal(JSON.stringify(summary).includes('location'), false);
assert.equal(TRIP_HISTORY_TRACK_SEMANTICS, 'sampled_canonical');
assert.equal(TRIP_HISTORY_COMPLETENESS, 'sampled_not_ground_truth');

assert.equal(csvCell('=1+1'), "'=1+1");
assert.equal(csvCell('  @SUM(A1)'), "'  @SUM(A1)");
assert.equal(csvCell('\n=SUM(A1)'), '"\'\n=SUM(A1)"');
assert.equal(csvCell('-10'), "'-10");
assert.equal(csvCell(-10), '-10');
assert.equal(csvCell('Route, "One"'), '"Route, ""One"""');
assert.equal(csvCell(null), '');
assert.equal(csvCell(new Date('2026-08-01T01:00:00.000Z')), '2026-08-01T01:00:00.000Z');

const zeroTrackChunks = [];
const zeroCount = await streamTripHistoryCsv(summary, (chunk) => zeroTrackChunks.push(chunk), async () => []);
assert.equal(zeroCount, 0);
assert.equal(zeroTrackChunks.length, 2);
assert.equal(zeroTrackChunks[0], `${TRIP_HISTORY_CSV_HEADER.join(',')}\r\n`);
assert.equal(TRIP_HISTORY_CSV_HEADER.includes('completeness'), true);
assert.match(zeroTrackChunks[1], /^trip_metadata,/);
assert.equal(zeroTrackChunks[1].includes(',sampled_canonical,sampled_not_ground_truth,'), true);
assert.equal(zeroTrackChunks.join('').includes("'=Formula Vehicle"), true);
assert.equal(zeroTrackChunks.join('').includes('"Route, ""One"""'), true);

const pagedCalls = [];
const pagedChunks = [];
const points = [
  { id: '1', recordedAt: new Date('2026-08-01T01:01:00.000Z'), lat: 0, lng: 0, speed: null, heading: null, station: '=station', sourceId: '@source' },
  { id: '2', recordedAt: new Date('2026-08-01T01:02:00.000Z'), lat: -1, lng: 2, speed: '3.50', heading: '90.00', station: null, sourceId: null },
];
const exportedCount = await streamTripHistoryCsv(
  { ...summary, trackCount: 2 },
  (chunk) => pagedChunks.push(chunk),
  async (_tripId, afterId, take) => {
    pagedCalls.push({ afterId, take });
    return afterId === null ? points : [];
  },
  2,
);
assert.equal(exportedCount, 2);
assert.deepEqual(pagedCalls, [{ afterId: null, take: 2 }, { afterId: '2', take: 2 }]);
assert.equal(pagedChunks.join('').includes("'=station"), true);
assert.equal(pagedChunks.join('').includes("'@source"), true);
assert.equal(pagedChunks.join('').includes(',sampled_canonical,sampled_not_ground_truth,'), true);

class TestWritable extends EventEmitter {
  destroyed = false;
  writableEnded = false;
  writes = [];
  constructor(accepted) {
    super();
    this.accepted = accepted;
  }
  write(chunk) {
    this.writes.push(chunk);
    return this.accepted;
  }
}

const acceptedOutput = new TestWritable(true);
await writeExportChunk(acceptedOutput, 'accepted');
assert.deepEqual(acceptedOutput.writes, ['accepted']);

const drainingOutput = new TestWritable(false);
const drained = writeExportChunk(drainingOutput, 'wait');
queueMicrotask(() => drainingOutput.emit('drain'));
await drained;

for (const event of ['close', 'error']) {
  const interruptedOutput = new TestWritable(false);
  const pending = writeExportChunk(interruptedOutput, 'wait');
  queueMicrotask(() => event === 'error'
    ? interruptedOutput.emit(event, new Error('raw transport error must not leak'))
    : interruptedOutput.emit(event));
  await assert.rejects(pending, (error) => {
    assert.equal(error.message.includes('raw transport error'), false);
    return true;
  });
}

let limiterFailure;
await rateLimit({ scope: 'test:trip-history-read', max: 1, windowMs: 1000, key: () => 'test-client' })(
  {},
  { locals: {} },
  (error) => { limiterFailure = error; },
);
assert.equal(limiterFailure instanceof BoundaryError, true);
assert.equal(limiterFailure.status, 503);
assert.equal(limiterFailure.code, 'DEPENDENCY_UNAVAILABLE');

const safe = mapBoundaryError(new Error('secret database coordinates'));
assert.deepEqual({ status: safe.status, code: safe.code, message: safe.message }, {
  status: 500,
  code: 'INTERNAL_ERROR',
  message: 'Internal server error',
});

const routeSource = await readFile(new URL('../src/routes/adminTripHistory.route.ts', import.meta.url), 'utf8');
assert.match(routeSource, /router\.get\('\/', tripHistoryReadLimit, validateQuery\(parseTripHistoryList\), listAdminTripHistory\)/);
assert.match(routeSource, /'\/:id\/export',[\s\S]*requireMinimumRole\('SUPER_ADMIN'\)[\s\S]*tripHistoryReadLimit[\s\S]*parseTripId/);
assert.match(routeSource, /'\/:id',[\s\S]*requireMinimumRole\('SUPER_ADMIN'\)[\s\S]*tripHistoryReadLimit[\s\S]*parseTripId[\s\S]*parseTripHistoryPagination/);
assert.match(routeSource, /scope: 'admin:trip-history-read'[\s\S]*RATE_LIMITS\.admin[\s\S]*clientAddress/);

const serverSource = await readFile(new URL('../src/server.ts', import.meta.url), 'utf8');
assert.match(serverSource, /app\.use\('\/api\/admin\/trip-history', authenticateToken, adminTripHistoryRouter\)/);
const controllerSource = await readFile(new URL('../src/controllers/adminTripHistory.controller.ts', import.meta.url), 'utf8');
assert.equal(controllerSource.includes('res.status(500)'), false);
assert.match(controllerSource, /sendBoundaryError/);
assert.match(controllerSource, /text\/csv; charset=utf-8/);

console.log('Trip History validation, redaction, role wiring, and streaming CSV tests passed.');
