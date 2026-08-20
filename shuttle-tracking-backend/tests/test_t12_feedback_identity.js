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
  feedbackVehicleEligibilityWhere,
  validateFeedbackVehicleId,
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
const predecessorRoleMigration = await readFile(
  new URL('../prisma/migrations/20260729170000_add_t7_research_diagnostics/migration.sql', import.meta.url),
  'utf8',
);

const occurrences = (source, pattern) => source.match(pattern)?.length ?? 0;
const normalizeSqlStatement = (statement) => statement.replace(/\s+/g, ' ').trim();
const sqlStatements = migration
  .replaceAll(/--.*$/gm, '')
  .split(';')
  .map(normalizeSqlStatement)
  .filter(Boolean);
const expectedSqlStatements = [
  'BEGIN',
  'ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_check"',
  'UPDATE "users" SET "role" = \'ADMIN\' WHERE "role" = \'OPERATOR\'',
  'ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT \'ADMIN\'',
  'ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK ("role" IN (\'ADMIN\', \'DEV\', \'SUPER_ADMIN\'))',
  normalizeSqlStatement(`
    ALTER TABLE "feedback"
      ADD COLUMN "status" VARCHAR(30) NOT NULL DEFAULT 'new',
      ADD COLUMN "assigned_to_id" UUID,
      ADD COLUMN "assigned_at" TIMESTAMP(6),
      ADD COLUMN "acknowledged_at" TIMESTAMP(6),
      ADD COLUMN "investigating_at" TIMESTAMP(6),
      ADD COLUMN "resolved_at" TIMESTAMP(6),
      ADD COLUMN "internal_note" TEXT,
      ADD COLUMN "deleted_at" TIMESTAMP(6),
      ADD COLUMN "deleted_by_id" UUID,
      ADD COLUMN "deletion_reason" VARCHAR(500),
      ADD COLUMN "restore_expires_at" TIMESTAMP(6)
  `),
  normalizeSqlStatement(`
    ALTER TABLE "feedback"
      ADD CONSTRAINT "feedback_assigned_to_id_fkey"
        FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL,
      ADD CONSTRAINT "feedback_deleted_by_id_fkey"
        FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL
  `),
  'CREATE INDEX "feedback_status_created_at_idx" ON "feedback"("status", "created_at" DESC)',
  'CREATE INDEX "feedback_deleted_at_restore_expires_at_idx" ON "feedback"("deleted_at", "restore_expires_at")',
  normalizeSqlStatement(`
    CREATE TABLE "feedback_audit_events" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "feedback_id" UUID NOT NULL,
      "actor_user_id" UUID,
      "action" VARCHAR(50) NOT NULL,
      "event_key" VARCHAR(50),
      "from_status" VARCHAR(30),
      "to_status" VARCHAR(30),
      "reason" VARCHAR(500),
      "occurred_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "feedback_audit_events_pkey" PRIMARY KEY ("id")
    )
  `),
  'CREATE INDEX "feedback_audit_events_feedback_id_occurred_at_idx" ON "feedback_audit_events"("feedback_id", "occurred_at" DESC)',
  'CREATE UNIQUE INDEX "feedback_audit_events_feedback_id_event_key_key" ON "feedback_audit_events"("feedback_id", "event_key")',
  'COMMIT',
];
assert.deepEqual(sqlStatements, expectedSqlStatements);
const indexOfStatement = (source, pattern, description) => {
  const match = source.match(pattern);
  assert.ok(match, `Missing ${description}`);
  return match.index;
};
const rolesFromCheck = (source, description) => {
  const match = source.match(/CHECK \("role" IN \(([^)]+)\)\)/);
  assert.ok(match, `Missing ${description} role allowlist`);
  return match[1]
    .split(',')
    .map((role) => role.trim().replaceAll("'", ''));
};

const beginIndex = indexOfStatement(migration, /^BEGIN;$/m, 'transaction begin');
const dropIndex = indexOfStatement(
  migration,
  /ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_check";/,
  'predecessor role-constraint drop',
);
const updateIndex = indexOfStatement(
  migration,
  /UPDATE "users" SET "role" = 'ADMIN' WHERE "role" = 'OPERATOR';/,
  'legacy OPERATOR conversion',
);
const defaultIndex = indexOfStatement(
  migration,
  /ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ADMIN';/,
  'ADMIN role default',
);
const finalConstraintIndex = indexOfStatement(
  migration,
  /ALTER TABLE "users"\s+ADD CONSTRAINT "users_role_check"\s+CHECK \("role" IN \('ADMIN', 'DEV', 'SUPER_ADMIN'\)\);/,
  'final role constraint',
);
const feedbackDdlIndex = indexOfStatement(
  migration,
  /ALTER TABLE "feedback"\s+ADD COLUMN "status"/,
  'Feedback triage DDL',
);
const commitIndex = indexOfStatement(migration, /^COMMIT;$/m, 'transaction commit');

assert.equal(occurrences(migration, /^BEGIN;$/gm), 1);
assert.equal(occurrences(migration, /^COMMIT;$/gm), 1);
assert.equal(occurrences(migration, /DROP CONSTRAINT IF EXISTS "users_role_check"/g), 1);
assert.equal(occurrences(migration, /ADD CONSTRAINT "users_role_check"/g), 1);
assert.equal(/\bNOT\s+VALID\b/i.test(migration), false);
assert.deepEqual(
  [beginIndex, dropIndex, updateIndex, defaultIndex, finalConstraintIndex, feedbackDdlIndex, commitIndex],
  [...[beginIndex, dropIndex, updateIndex, defaultIndex, finalConstraintIndex, feedbackDdlIndex, commitIndex]].sort((a, b) => a - b),
);
assert.equal(migration.trimStart().startsWith('BEGIN;'), true);
assert.equal(migration.trimEnd().endsWith('COMMIT;'), true);

const roleUpdateStatements = sqlStatements.filter((statement) => (
  /^UPDATE\s+"?users"?\s+SET\b/i.test(statement)
  && /(?:^|,)\s*"?role"?\s*=/i.test(statement.slice(statement.search(/\bSET\b/i) + 3))
));
const roleDefaultStatements = sqlStatements.filter((statement) => (
  /^ALTER\s+TABLE\s+"?users"?\s+ALTER\s+COLUMN\s+"?role"?\s+(?:SET|DROP)\s+DEFAULT\b/i
    .test(statement)
));
const roleConstraintStatements = sqlStatements.filter((statement) => (
  /^ALTER\s+TABLE\s+"?users"?\b/i.test(statement)
  && /CHECK\s*\(\s*"?role"?\s+IN\s*\(/i.test(statement)
));
assert.deepEqual(roleUpdateStatements, [
  'UPDATE "users" SET "role" = \'ADMIN\' WHERE "role" = \'OPERATOR\'',
]);
assert.deepEqual(roleDefaultStatements, [
  'ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT \'ADMIN\'',
]);
assert.deepEqual(roleConstraintStatements, [
  'ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK ("role" IN (\'ADMIN\', \'DEV\', \'SUPER_ADMIN\'))',
]);

const predecessorRoles = rolesFromCheck(predecessorRoleMigration, 'predecessor');
const finalRoles = rolesFromCheck(
  migration.slice(finalConstraintIndex, feedbackDdlIndex),
  'final',
);
assert.deepEqual(predecessorRoles, ['OPERATOR', 'DEV', 'SUPER_ADMIN']);
assert.deepEqual(finalRoles, ['ADMIN', 'DEV', 'SUPER_ADMIN']);

const approvedRoleMapping = roleUpdateStatements[0].match(
  /^UPDATE "users" SET "role" = '([^']+)' WHERE "role" = '([^']+)'$/,
);
assert.ok(approvedRoleMapping, 'Role mapping must be derived from the sole users.role UPDATE');
const [, mappedRole, predecessorRole] = approvedRoleMapping;
const mapLegacyRole = (role) => role === predecessorRole ? mappedRole : role;
assert.equal(mapLegacyRole('OPERATOR'), 'ADMIN');
assert.equal(mapLegacyRole('DEV'), 'DEV');
assert.equal(mapLegacyRole('SUPER_ADMIN'), 'SUPER_ADMIN');
for (const role of predecessorRoles) {
  assert.equal(finalRoles.includes(mapLegacyRole(role)), true);
}
assert.equal(mapLegacyRole('UNKNOWN'), 'UNKNOWN');
assert.equal(finalRoles.includes(mapLegacyRole('UNKNOWN')), false);
const feedbackController = await readFile(
  new URL('../src/controllers/feedback.controller.ts', import.meta.url),
  'utf8',
);
assert.equal(feedbackController.includes('req.ip'), false);
const feedbackRoute = await readFile(
  new URL('../src/routes/feedback.route.ts', import.meta.url),
  'utf8',
);
assert.match(feedbackRoute, /router\.use\(requireMinimumRole\('ADMIN'\)\)/);
assert.equal(
  (feedbackRoute.match(/requireMinimumRole\('SUPER_ADMIN'\)/g) ?? []).length,
  3,
  'Every feedback mutation must retain an explicit SUPER_ADMIN authorization guard',
);

assert.deepEqual(feedbackVehicleEligibilityWhere('VH_ACTIVE'), {
  id: 'VH_ACTIVE',
  status: 'active',
  trips: { some: { status: 'in_progress' } },
});
let nullVehicleLookupCount = 0;
assert.equal(await validateFeedbackVehicleId(null, async () => {
  nullVehicleLookupCount += 1;
  return null;
}), null);
assert.equal(nullVehicleLookupCount, 0, 'General feedback must not query for a vehicle');

const feedbackVehicleFixtures = [
  { id: 'VH_INACTIVE', status: 'inactive', hasInProgressTrip: true },
  { id: 'VH_NO_TRIP', status: 'active', hasInProgressTrip: false },
  { id: 'VH_ACTIVE', status: 'active', hasInProgressTrip: true },
];
const findPublicActiveFeedbackVehicle = async (where) => {
  const candidate = feedbackVehicleFixtures.find((vehicle) => vehicle.id === where.id);
  return candidate?.status === where.status && candidate.hasInProgressTrip
    ? { id: candidate.id }
    : null;
};
for (const vehicleId of ['VH_UNKNOWN', 'VH_INACTIVE', 'VH_NO_TRIP']) {
  await assert.rejects(
    () => validateFeedbackVehicleId(vehicleId, findPublicActiveFeedbackVehicle),
    (error) => error?.status === 404 && error?.code === 'NOT_FOUND' && error?.message === 'Vehicle not found',
    `${vehicleId} must not be accepted for vehicle-specific feedback`,
  );
}
assert.equal(
  await validateFeedbackVehicleId('VH_ACTIVE', findPublicActiveFeedbackVehicle),
  'VH_ACTIVE',
);

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
  priority: 9,
  status: 'active',
  secretHash: '$2b$12$never-returned',
  credentialVersion: 4,
  credentialIssuedAt: new Date('2026-07-20T00:00:00.000Z'),
  credentialRotatedAt: new Date('2026-07-20T01:00:00.000Z'),
  lastTelemetryAt: new Date('2026-08-01T00:00:00.000Z'),
  createdAt: new Date('2026-07-19T00:00:00.000Z'),
  assignments: [{
    id: 'assignment-1',
    trackingSourceId: 'TS_TEST_01',
    vehicleId: 'VH001',
    assignedAt: new Date('2026-07-19T00:00:00.000Z'),
    unassignedAt: null,
    assignedById: null,
    method: 'admin',
    assignedBy: null,
    vehicle: {
      id: 'VH001',
      name: 'Vehicle 1',
      type: 'tram',
      assignedRouteId: 'RT001',
      status: 'active',
      createdAt: new Date('2026-07-18T00:00:00.000Z'),
    },
  }],
}, new Date('2026-08-01T00:00:10.000Z').getTime());
assert.deepEqual(Object.keys(safeHealth).sort(), [
  'errorCategory',
  'freshness',
  'lastTelemetryAt',
  'sourceId',
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
