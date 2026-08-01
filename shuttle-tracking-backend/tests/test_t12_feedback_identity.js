import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const {
  hasMinimumRole,
  isAdminRole,
} = await import('../dist/services/admin-role.service.js');
const {
  RECENT_REAUTHENTICATION_WINDOW_SECONDS,
  isRecentReauthentication,
  isAdminClaims,
} = await import('../dist/middleware/auth.js');
const {
  FEEDBACK_RESTORE_WINDOW_MS,
  canTransitionFeedback,
  feedbackAuditRecord,
  feedbackRestoreExpiry,
} = await import('../dist/services/feedback.service.js');
const {
  FEEDBACK_CONTENT_RETENTION_DAYS,
  FEEDBACK_IP_RETENTION_DAYS,
  feedbackContentRetentionCutoff,
  feedbackIpRetentionCutoff,
  feedbackPurgeFilter,
} = await import('../dist/services/feedback-retention.service.js');
const { toDeviceHealthResponse } = await import('../dist/types/device.js');

const migration = await readFile(
  new URL('../prisma/migrations/20260801110000_feedback_triage_roles/migration.sql', import.meta.url),
  'utf8',
);
assert.match(migration, /UPDATE "users" SET "role" = 'ADMIN' WHERE "role" = 'OPERATOR';/);
assert.match(migration, /ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ADMIN';/);
const feedbackController = await readFile(
  new URL('../src/controllers/feedback.controller.ts', import.meta.url),
  'utf8',
);
assert.equal(feedbackController.includes('req.ip'), false);

assert.equal(isAdminRole('ADMIN'), true);
assert.equal(isAdminRole('SUPER_ADMIN'), true);
assert.equal(isAdminRole('DEV'), true);
assert.equal(isAdminRole('OPERATOR'), false);
assert.equal(isAdminRole('UNKNOWN'), false);
assert.equal(hasMinimumRole('DEV', 'SUPER_ADMIN'), true);
assert.equal(hasMinimumRole('SUPER_ADMIN', 'ADMIN'), true);
assert.equal(hasMinimumRole('ADMIN', 'SUPER_ADMIN'), false);
assert.equal(isAdminClaims({ userId: 'admin-user', reauthenticatedAt: 1 }), true);
assert.equal(isAdminClaims({ kind: 'sender', userId: 'sender-user' }), false);

const nowSeconds = 1_800_000_000;
assert.equal(isRecentReauthentication(nowSeconds, nowSeconds), true);
assert.equal(
  isRecentReauthentication(nowSeconds - RECENT_REAUTHENTICATION_WINDOW_SECONDS, nowSeconds),
  true,
);
assert.equal(
  isRecentReauthentication(nowSeconds - RECENT_REAUTHENTICATION_WINDOW_SECONDS - 1, nowSeconds),
  false,
);
assert.equal(isRecentReauthentication(nowSeconds + 1, nowSeconds), false);

assert.equal(canTransitionFeedback('new', 'acknowledged'), true);
assert.equal(canTransitionFeedback('new', 'duplicate'), true);
assert.equal(canTransitionFeedback('acknowledged', 'investigating'), true);
assert.equal(canTransitionFeedback('acknowledged', 'resolved'), false);
assert.equal(canTransitionFeedback('resolved', 'acknowledged'), false);
assert.equal(canTransitionFeedback('duplicate', 'rejected'), false);

const deletedAt = new Date('2026-08-01T00:00:00.000Z');
assert.equal(
  feedbackRestoreExpiry(deletedAt).getTime() - deletedAt.getTime(),
  FEEDBACK_RESTORE_WINDOW_MS,
);
const audit = feedbackAuditRecord({
  feedbackId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  actorUserId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  action: 'soft_deleted',
  reason: 'privacy_request',
  occurredAt: deletedAt,
});
assert.deepEqual(Object.keys(audit).sort(), [
  'action',
  'actorUserId',
  'eventKey',
  'feedbackId',
  'fromStatus',
  'occurredAt',
  'reason',
  'toStatus',
]);
assert.equal(JSON.stringify(audit).includes('message'), false);
assert.equal(JSON.stringify(audit).includes('ipAddress'), false);

const retentionNow = new Date('2026-08-01T00:00:00.000Z');
assert.equal(FEEDBACK_IP_RETENTION_DAYS, 30);
assert.equal(FEEDBACK_CONTENT_RETENTION_DAYS, 180);
assert.equal(feedbackIpRetentionCutoff(retentionNow).toISOString(), '2026-07-02T00:00:00.000Z');
assert.equal(feedbackContentRetentionCutoff(retentionNow).toISOString(), '2026-02-02T00:00:00.000Z');
assert.deepEqual(feedbackPurgeFilter(retentionNow), {
  OR: [
    { createdAt: { lt: new Date('2026-02-02T00:00:00.000Z') } },
    {
      deletedAt: { not: null },
      restoreExpiresAt: { lt: retentionNow },
    },
  ],
});

const safeHealth = toDeviceHealthResponse({
  id: 'TS_TEST_01',
  name: 'Internal source name not returned',
  type: 'mobile',
  vehicleId: 'VH001',
  priority: 9,
  status: 'active',
  secretHash: '$2b$12$never-returned',
  credentialVersion: 4,
  credentialIssuedAt: new Date('2026-07-20T00:00:00.000Z'),
  credentialRotatedAt: new Date('2026-07-20T01:00:00.000Z'),
  lastSeenAt: new Date('2026-08-01T00:00:00.000Z'),
  createdAt: new Date('2026-07-19T00:00:00.000Z'),
  vehicle: {
    id: 'VH001',
    name: 'Vehicle 1',
    type: 'tram',
    assignedRouteId: 'RT001',
    status: 'active',
    createdAt: new Date('2026-07-18T00:00:00.000Z'),
  },
}, new Date('2026-08-01T00:00:10.000Z').getTime());
assert.deepEqual(Object.keys(safeHealth).sort(), [
  'errorCategory',
  'freshness',
  'lastSeenAt',
  'sourceType',
  'status',
  'vehicle',
]);
const serializedHealth = JSON.stringify(safeHealth);
assert.equal(Object.hasOwn(safeHealth, 'id'), false);
for (const forbidden of ['secretHash', 'credentialVersion', 'credentialIssuedAt', 'credentialRotatedAt', 'priority', 'Internal source name']) {
  assert.equal(serializedHealth.includes(forbidden), false);
}
assert.equal(safeHealth.freshness, 'online');
assert.equal(safeHealth.errorCategory, 'none');

console.log('T12 role, reauthentication, feedback retention, and safe source DTO boundary tests passed.');
