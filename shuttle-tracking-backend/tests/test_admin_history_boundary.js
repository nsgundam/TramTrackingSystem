import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFile } from 'node:fs/promises';

const {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_AUDIT_OUTCOMES,
  ADMIN_AUDIT_TARGET_TYPES,
  parseAdminHistoryList,
} = await import('../dist/middleware/validation.js');
const { BoundaryError } = await import('../dist/middleware/boundary-errors.js');
const {
  adminAuditOutcome,
  classifyAdminMutation,
  createAdminAuditCapture,
  logAdminAuditPersistenceFailure,
} = await import('../dist/middleware/admin-audit.js');
const { buildAdminHistoryListQuery } = await import('../dist/services/admin-audit.service.js');
const { rateLimit } = await import('../dist/middleware/rate-limit.js');

const invalid = (callback) => assert.throws(callback, (error) =>
  error instanceof BoundaryError && error.status === 400 && error.code === 'INVALID_REQUEST');

const classificationCases = [
  ['/api/admin/vehicles', 'POST', '/', { id: 'VH01', secret: 'must-not-leak' }, 'vehicle.create', 'vehicle', 'VH01'],
  ['/api/admin/vehicles', 'PUT', '/VH01', { token: 'must-not-leak' }, 'vehicle.update', 'vehicle', 'VH01'],
  ['/api/admin/vehicles', 'DELETE', '/VH01', null, 'vehicle.delete', 'vehicle', 'VH01'],
  ['/api/admin/routes', 'POST', '/', { id: 'R01' }, 'route.create', 'route', 'R01'],
  ['/api/admin/routes', 'PUT', '/R01', {}, 'route.update', 'route', 'R01'],
  ['/api/admin/routes', 'DELETE', '/R01', {}, 'route.delete', 'route', 'R01'],
  ['/api/admin/stops', 'POST', '/', { id: 'S01', lat: 1, lng: 2 }, 'stop.create', 'stop', 'S01'],
  ['/api/admin/stops', 'PUT', '/S01', { lat: 1, lng: 2 }, 'stop.update', 'stop', 'S01'],
  ['/api/admin/stops', 'DELETE', '/S01', {}, 'stop.delete', 'stop', 'S01'],
  ['/api/admin/route-stops', 'POST', '/', { routeId: 'R01', stopId: 'S01' }, 'route_stop.create', 'route_stop', 'R01'],
  ['/api/admin/route-stops', 'PUT', '/R01', { stopIds: ['S01'] }, 'route_stop.replace', 'route_stop', 'R01'],
  ['/api/admin/route-stops', 'DELETE', '/550e8400-e29b-41d4-a716-446655440000', {}, 'route_stop.delete', 'route_stop', '550e8400-e29b-41d4-a716-446655440000'],
  ['/api/admin/devices', 'POST', '/', { id: 'TS01', secret: 'must-not-leak' }, 'device.create', 'tracking_source', 'TS01'],
  ['/api/admin/devices', 'PUT', '/TS01', {}, 'device.update', 'tracking_source', 'TS01'],
  ['/api/admin/devices', 'DELETE', '/TS01', {}, 'device.delete', 'tracking_source', 'TS01'],
  ['/api/admin/devices', 'PUT', '/TS01/assignment', { vehicleId: 'VH01' }, 'device.assign', 'tracking_source', 'TS01'],
  ['/api/admin/devices', 'DELETE', '/TS01/assignment', {}, 'device.unassign', 'tracking_source', 'TS01'],
  ['/api/admin/feedback', 'PATCH', '/550e8400-e29b-41d4-a716-446655440000', { internalNote: 'must-not-leak' }, 'feedback.update', 'feedback', '550e8400-e29b-41d4-a716-446655440000'],
  ['/api/admin/feedback', 'POST', '/550e8400-e29b-41d4-a716-446655440000/delete', { reason: 'must-not-leak' }, 'feedback.delete', 'feedback', '550e8400-e29b-41d4-a716-446655440000'],
  ['/api/admin/feedback', 'POST', '/550e8400-e29b-41d4-a716-446655440000/restore', {}, 'feedback.restore', 'feedback', '550e8400-e29b-41d4-a716-446655440000'],
];

for (const [baseUrl, method, path, body, action, targetType, targetId] of classificationCases) {
  const result = classifyAdminMutation({ baseUrl, method, path, body });
  assert.deepEqual(result, { action, targetType, targetId });
  const serialized = JSON.stringify(result);
  for (const secret of ['must-not-leak', 'internalNote', 'reason', 'lat', 'lng', 'vehicleId', 'stopId']) {
    assert.equal(serialized.includes(secret), false);
  }
}
assert.deepEqual([...new Set(classificationCases.map((entry) => entry[4]))].sort(), [...ADMIN_AUDIT_ACTIONS].sort());
assert.deepEqual([...new Set(classificationCases.map((entry) => entry[5]))].sort(), [...ADMIN_AUDIT_TARGET_TYPES].sort());

for (const input of [
  { baseUrl: '/api/admin/vehicles', method: 'GET', path: '/', body: null },
  { baseUrl: '/api/admin/vehicles', method: 'GET', path: '/VH01/assignment-qr', body: null },
  { baseUrl: '/api/admin/devices', method: 'GET', path: '/analytics', body: null },
  { baseUrl: '/api/admin/trip-history', method: 'GET', path: '/', body: null },
  { baseUrl: '/api/assignments', method: 'POST', path: '/mobile/scan', body: { qrToken: 'secret' } },
]) assert.equal(classifyAdminMutation(input), null);
assert.equal(classifyAdminMutation({
  baseUrl: '/api/admin/vehicles', method: 'PUT', path: `/${'x'.repeat(51)}`, body: { id: 'body-id' },
})?.targetId, null);

assert.equal(adminAuditOutcome(200), 'success');
assert.equal(adminAuditOutcome(204), 'success');
assert.equal(adminAuditOutcome(401), 'denied');
assert.equal(adminAuditOutcome(403), 'denied');
assert.equal(adminAuditOutcome(400), 'failure');
assert.equal(adminAuditOutcome(500), 'failure');
assert.equal(adminAuditOutcome(302), 'failure');
assert.deepEqual([...ADMIN_AUDIT_OUTCOMES], ['success', 'denied', 'failure']);

class TestResponse extends EventEmitter {
  statusCode = 201;
}
const persisted = [];
let nextCalls = 0;
const capture = createAdminAuditCapture(async (event) => { persisted.push(event); });
const response = new TestResponse();
capture({
  baseUrl: '/api/admin/vehicles',
  method: 'POST',
  path: '/',
  body: { id: 'VH01', password: 'must-not-leak', lat: 1 },
  requestId: 'request-01',
  admin: { id: '550e8400-e29b-41d4-a716-446655440000', username: 'operator', role: 'ADMIN', reauthenticatedAt: 1 },
}, response, () => { nextCalls += 1; });
assert.equal(response.listenerCount('finish'), 1);
assert.equal(nextCalls, 1);
response.emit('finish');
await new Promise((resolve) => setImmediate(resolve));
assert.equal(response.listenerCount('finish'), 0);
assert.equal(persisted.length, 1);
assert.deepEqual({ ...persisted[0], occurredAt: undefined }, {
  actorUserId: '550e8400-e29b-41d4-a716-446655440000',
  actorUsername: 'operator',
  actorRole: 'ADMIN',
  action: 'vehicle.create',
  targetType: 'vehicle',
  targetId: 'VH01',
  outcome: 'success',
  responseStatus: 201,
  requestId: 'request-01',
  occurredAt: undefined,
});
assert.equal(persisted[0].occurredAt instanceof Date, true);
const persistedJson = JSON.stringify(persisted[0]);
for (const forbidden of ['password', 'must-not-leak', 'lat', 'coordinates', 'token', 'body']) {
  assert.equal(persistedJson.includes(forbidden), false);
}

const persistenceFailures = [];
const failingCapture = createAdminAuditCapture(
  async () => { throw new Error('database-url-and-secret-must-not-leak'); },
  (requestId) => persistenceFailures.push(requestId),
);
const failureResponse = new TestResponse();
failingCapture({
  baseUrl: '/api/admin/routes', method: 'DELETE', path: '/R01', body: {}, requestId: 'request-02',
  admin: { id: '550e8400-e29b-41d4-a716-446655440000', username: 'operator', role: 'ADMIN', reauthenticatedAt: 1 },
}, failureResponse, () => {});
failureResponse.emit('finish');
await new Promise((resolve) => setImmediate(resolve));
assert.deepEqual(persistenceFailures, ['request-02']);
assert.equal(failureResponse.statusCode, 201);

const brokenLogResponse = new TestResponse();
createAdminAuditCapture(
  async () => { throw new Error('persistence failure'); },
  () => { throw new Error('diagnostic sink failure'); },
)({
  baseUrl: '/api/admin/stops', method: 'DELETE', path: '/S01', body: {}, requestId: 'request-04',
  admin: { id: '550e8400-e29b-41d4-a716-446655440000', username: 'operator', role: 'ADMIN', reauthenticatedAt: 1 },
}, brokenLogResponse, () => {});
brokenLogResponse.emit('finish');
await new Promise((resolve) => setImmediate(resolve));
assert.equal(brokenLogResponse.statusCode, 201);

const originalError = console.error;
const safeLogs = [];
console.error = (message) => safeLogs.push(String(message));
try {
  logAdminAuditPersistenceFailure('request-03');
} finally {
  console.error = originalError;
}
assert.equal(safeLogs.length, 1);
assert.equal(safeLogs[0].includes('PERSISTENCE_FAILED'), true);
assert.equal(safeLogs[0].includes('request-03'), true);
assert.equal(safeLogs[0].includes('database-url'), false);

const parsed = parseAdminHistoryList({
  page: '2', pageSize: '50', action: 'device.assign', targetType: 'tracking_source',
  outcome: 'denied', actor: 'operator', from: '2026-08-01', to: '2026-08-24T10:00:00Z',
});
assert.equal(parsed.page, 2);
assert.equal(parsed.pageSize, 50);
assert.equal(parsed.from?.toISOString(), '2026-08-01T00:00:00.000Z');
assert.equal(parsed.to?.toISOString(), '2026-08-24T10:00:00.000Z');
for (const query of [
  { action: 'secret.read' }, { targetType: 'coordinate' }, { outcome: 'unknown' },
  { actor: 'x'.repeat(51) }, { page: 0 }, { pageSize: 101 },
  { from: '2026-08-24', to: '2026-08-01' },
]) invalid(() => parseAdminHistoryList(query));

const listQuery = buildAdminHistoryListQuery(parsed);
assert.equal(listQuery.skip, 50);
assert.equal(listQuery.take, 50);
assert.deepEqual(listQuery.orderBy, [{ occurredAt: 'desc' }, { id: 'desc' }]);
assert.deepEqual(Object.keys(listQuery.select).sort(), [
  'action', 'actorRole', 'actorUserId', 'actorUsername', 'id', 'occurredAt', 'outcome',
  'requestId', 'responseStatus', 'targetId', 'targetType',
].sort());
for (const forbidden of ['requestBody', 'responseBody', 'token', 'ipAddress', 'coordinates', 'error', 'feedback']) {
  assert.equal(Object.hasOwn(listQuery.select, forbidden), false);
}

let limiterFailure;
await rateLimit({ scope: 'test:admin-history-read', max: 1, windowMs: 1000, key: () => 'test-client' })(
  {}, { locals: {} }, (error) => { limiterFailure = error; },
);
assert.equal(limiterFailure instanceof BoundaryError, true);
assert.equal(limiterFailure.code, 'DEPENDENCY_UNAVAILABLE');

const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
const model = /model AdminAuditEvent \{([\s\S]*?)\n\}/.exec(schema)?.[1] ?? '';
for (const field of ['id', 'actorUserId', 'actorUsername', 'actorRole', 'action', 'targetType', 'targetId', 'outcome', 'responseStatus', 'requestId', 'occurredAt']) {
  assert.match(model, new RegExp(`\\b${field}\\b`));
}
for (const forbidden of ['requestBody', 'responseBody', 'token', 'ipAddress', 'latitude', 'longitude', 'errorText', 'feedbackMessage', 'reason']) {
  assert.doesNotMatch(model, new RegExp(`\\b${forbidden}\\b`, 'i'));
}
assert.match(model, /onDelete: SetNull/);
assert.doesNotMatch(model, /updatedAt|@updatedAt/);
assert.match(model, /@@index\(\[actorUsername, occurredAt\(sort: Desc\)\]\)/);

const migration = await readFile(new URL('../prisma/migrations/20260824160000_add_admin_audit_events/migration.sql', import.meta.url), 'utf8');
for (const column of ['actor_user_id', 'actor_username', 'actor_role', 'action', 'target_type', 'target_id', 'outcome', 'response_status', 'request_id', 'occurred_at']) {
  assert.match(migration, new RegExp(`"${column}"`));
}
for (const action of ADMIN_AUDIT_ACTIONS) assert.equal(migration.includes(`'${action}'`), true);
assert.match(migration, /ON DELETE SET NULL/);
assert.match(migration, /"occurred_at" DESC/);
assert.match(
  migration,
  /CREATE INDEX "admin_audit_events_actor_username_occurred_at_idx"\s+ON "admin_audit_events" \("actor_username", "occurred_at" DESC\)/,
);
for (const forbidden of ['request_body', 'response_body', 'token', 'ip_address', 'latitude', 'longitude', 'error_text', 'feedback_message']) {
  assert.equal(migration.includes(`"${forbidden}"`), false);
}

const serviceSource = await readFile(new URL('../src/services/admin-audit.service.ts', import.meta.url), 'utf8');
assert.equal(/adminAuditEvent\.(update|delete|upsert)/.test(serviceSource), false);
const routeSource = await readFile(new URL('../src/routes/adminHistory.route.ts', import.meta.url), 'utf8');
assert.match(routeSource, /router\.get\([\s\S]*requireMinimumRole\('SUPER_ADMIN'\)[\s\S]*adminHistoryReadLimit[\s\S]*parseAdminHistoryList/);
assert.match(routeSource, /scope: 'admin:admin-history-read'[\s\S]*RATE_LIMITS\.admin[\s\S]*clientAddress/);
assert.equal(/router\.(post|put|patch|delete)/.test(routeSource), false);
assert.equal(routeSource.includes('/export'), false);

const serverSource = await readFile(new URL('../src/server.ts', import.meta.url), 'utf8');
for (const resource of ['vehicles', 'routes', 'stops', 'route-stops', 'devices', 'feedback']) {
  assert.match(serverSource, new RegExp(`app\\.use\\(["']\\/api\\/admin\\/${resource}["'], authenticateToken, captureAdminAudit,`));
}
assert.match(serverSource, /app\.use\('\/api\/admin\/admin-history', authenticateToken, adminHistoryRouter\)/);

console.log('Admin audit append-only capture, redaction, query, and read-boundary tests passed.');
