-- Tracking sources are movable identities.  Preserve the current direct
-- source/vehicle relationship as the first assignment before removing the
-- denormalized vehicle_id authority.

ALTER TABLE "trips"
ADD COLUMN "last_trip_activity_at" TIMESTAMP(6),
ADD COLUMN "closed_at" TIMESTAMP(6),
ADD COLUMN "end_reason" VARCHAR(50);

UPDATE "trips"
SET
  "last_trip_activity_at" = COALESCE("end_time", "start_time"),
  "closed_at" = CASE WHEN "status" = 'completed' THEN "end_time" ELSE NULL END,
  "end_reason" = CASE WHEN "status" = 'completed' THEN 'explicit_end' ELSE NULL END;

ALTER TABLE "trips"
ALTER COLUMN "last_trip_activity_at" SET NOT NULL;

CREATE TABLE "tracking_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tracking_source_id" VARCHAR(50) NOT NULL,
    "vehicle_id" VARCHAR(50) NOT NULL,
    "assigned_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassigned_at" TIMESTAMP(6),
    "assigned_by_id" UUID,
    "unassigned_by_id" UUID,
    "method" VARCHAR(30) NOT NULL DEFAULT 'admin',

    CONSTRAINT "tracking_assignments_pkey" PRIMARY KEY ("id")
);

INSERT INTO "tracking_assignments" (
  "tracking_source_id",
  "vehicle_id",
  "assigned_at",
  "method"
)
SELECT
  "id",
  "vehicle_id",
  "created_at",
  'migration'
FROM "tracking_sources"
WHERE "vehicle_id" IS NOT NULL;

ALTER TABLE "tracking_sources"
RENAME COLUMN "last_seen_at" TO "last_telemetry_at";

-- PostgreSQL keeps the old index name when a column is renamed. Remove that
-- index before creating the schema-aligned replacement below.
DROP INDEX IF EXISTS "tracking_sources_status_last_seen_at_idx";
DROP INDEX IF EXISTS "tracking_sources_status_idx";

ALTER TABLE "tracking_assignments"
ADD CONSTRAINT "tracking_assignments_source_fkey"
  FOREIGN KEY ("tracking_source_id") REFERENCES "tracking_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT "tracking_assignments_vehicle_fkey"
  FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT "tracking_assignments_actor_fkey"
  FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT "tracking_assignments_unassign_actor_fkey"
  FOREIGN KEY ("unassigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT "tracking_assignments_time_check"
  CHECK ("unassigned_at" IS NULL OR "unassigned_at" >= "assigned_at"),
ADD CONSTRAINT "tracking_assignments_method_check"
  CHECK ("method" IN ('admin', 'mobile_qr', 'migration'));

CREATE UNIQUE INDEX "tracking_assignments_one_active_source_idx"
ON "tracking_assignments"("tracking_source_id")
WHERE "unassigned_at" IS NULL;

CREATE INDEX "tracking_assignments_source_assigned_at_idx"
ON "tracking_assignments"("tracking_source_id", "assigned_at" DESC);

CREATE INDEX "tracking_assignments_vehicle_assigned_at_idx"
ON "tracking_assignments"("vehicle_id", "assigned_at" DESC);

ALTER TABLE "tracking_sources"
DROP CONSTRAINT IF EXISTS "tracking_sources_active_vehicle_check",
DROP CONSTRAINT IF EXISTS "tracking_sources_vehicle_id_fkey",
DROP COLUMN "vehicle_id";

DROP INDEX IF EXISTS "tracking_sources_vehicle_id_idx";
DROP INDEX IF EXISTS "tracking_sources_vehicle_id_status_priority_id_idx";

CREATE INDEX "tracking_sources_status_priority_id_idx"
ON "tracking_sources"("status", "priority", "id");

CREATE INDEX "tracking_sources_status_last_telemetry_at_idx"
ON "tracking_sources"("status", "last_telemetry_at" DESC);

ALTER TABLE "trips"
DROP CONSTRAINT IF EXISTS "trips_status_check",
DROP CONSTRAINT IF EXISTS "trips_status_time_check",
DROP CONSTRAINT IF EXISTS "trips_end_after_start_check";

ALTER TABLE "trips"
ADD CONSTRAINT "trips_status_check"
CHECK ("status" IN ('in_progress', 'completed', 'aborted')),
ADD CONSTRAINT "trips_lifecycle_check"
CHECK (
  ("status" = 'in_progress'
    AND "end_time" IS NULL
    AND "closed_at" IS NULL
    AND "end_reason" IS NULL)
  OR ("status" IN ('completed', 'aborted')
    AND "end_time" IS NOT NULL
    AND "closed_at" IS NOT NULL
    AND "end_reason" IS NOT NULL)
),
ADD CONSTRAINT "trips_end_after_start_check"
CHECK ("end_time" IS NULL OR "end_time" >= "start_time"),
ADD CONSTRAINT "trips_closed_after_end_check"
CHECK ("closed_at" IS NULL OR "end_time" IS NULL OR "closed_at" >= "end_time"),
ADD CONSTRAINT "trips_end_reason_check"
CHECK ("end_reason" IS NULL OR "end_reason" IN ('explicit_end', 'inactivity_timeout'));
