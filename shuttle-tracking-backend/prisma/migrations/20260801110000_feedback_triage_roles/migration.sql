BEGIN;

-- D-010:A: retain privileged roles, promote only legacy ordinary operators, and
-- reject unexpected historical values without partially committing this migration.
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_check";

UPDATE "users" SET "role" = 'ADMIN' WHERE "role" = 'OPERATOR';
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
ALTER TABLE "users"
  ADD CONSTRAINT "users_role_check"
  CHECK ("role" IN ('ADMIN', 'DEV', 'SUPER_ADMIN'));

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
  ADD COLUMN "restore_expires_at" TIMESTAMP(6);

ALTER TABLE "feedback"
  ADD CONSTRAINT "feedback_assigned_to_id_fkey"
    FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL,
  ADD CONSTRAINT "feedback_deleted_by_id_fkey"
    FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL;

CREATE INDEX "feedback_status_created_at_idx" ON "feedback"("status", "created_at" DESC);
CREATE INDEX "feedback_deleted_at_restore_expires_at_idx" ON "feedback"("deleted_at", "restore_expires_at");

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
);

CREATE INDEX "feedback_audit_events_feedback_id_occurred_at_idx"
  ON "feedback_audit_events"("feedback_id", "occurred_at" DESC);
CREATE UNIQUE INDEX "feedback_audit_events_feedback_id_event_key_key"
  ON "feedback_audit_events"("feedback_id", "event_key");

COMMIT;
