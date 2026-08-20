-- Tracking sources are movable identities.  Preserve the current direct
-- source/vehicle relationship as the first assignment before removing the
-- denormalized vehicle_id authority.

BEGIN;

ALTER TABLE "trips"
ADD COLUMN "last_trip_activity_at" TIMESTAMP(6),
ADD COLUMN "closed_at" TIMESTAMP(6),
ADD COLUMN "end_reason" VARCHAR(50);

-- Only meaningful movement advances the inactivity clock. A stationary source
-- may continue to emit GPS samples, so raw telemetry recency is intentionally
-- not used as trip activity. Keep these thresholds aligned with
-- trip-activity.service.ts (2 m/s or 25 m displacement).
WITH meaningful_activity AS (
  SELECT
    "trip_id",
    MAX("recorded_at") AS "last_activity_at"
  FROM (
    SELECT
      "trip_id",
      "recorded_at",
      "speed",
      "location",
      LAG("location") OVER (
        PARTITION BY "trip_id"
        ORDER BY "recorded_at", "id"
      ) AS "previous_location"
    FROM "gps_tracks"
  ) AS ordered_tracks
  WHERE (
    "speed" IS NOT NULL
    AND "speed" >= 2
  )
  OR (
    "location" IS NOT NULL
    AND "previous_location" IS NOT NULL
    AND ST_Distance("location", "previous_location") >= 25
  )
  GROUP BY "trip_id"
)
UPDATE "trips"
SET
  "last_trip_activity_at" = CASE
    WHEN "status" = 'in_progress' THEN GREATEST(
      "start_time",
      COALESCE(
        (
          SELECT "last_activity_at"
          FROM meaningful_activity
          WHERE meaningful_activity."trip_id" = "trips"."id"
        ),
        "start_time"
      )
    )
    ELSE COALESCE("end_time", "start_time")
  END,
  "closed_at" = CASE
    WHEN "status" = 'in_progress' THEN NULL
    ELSE COALESCE("end_time", "start_time")
  END,
  "end_reason" = CASE
    WHEN "status" = 'in_progress' THEN NULL
    ELSE 'explicit_end'
  END;

-- Legacy product data can contain more than one stale in-progress row for a
-- vehicle because the old schema did not enforce the partial unique index.
-- Apply the same 15-minute inactivity policy used by the service before
-- recreating that database invariant. Recent active rows are left untouched;
-- the unique-index creation then fails closed if an operator must resolve a
-- genuinely ambiguous live state first. The vehicle reconciliation is a
-- separate statement in the same transaction because PostgreSQL data-changing
-- CTEs use the statement snapshot for the following predicates.
UPDATE "trips"
SET
  "status" = 'aborted',
  "end_time" = "last_trip_activity_at",
  "closed_at" = CURRENT_TIMESTAMP,
  "end_reason" = 'inactivity_timeout'
WHERE "status" = 'in_progress'
  AND "last_trip_activity_at" <= CURRENT_TIMESTAMP - INTERVAL '15 minutes';

UPDATE "vehicles" AS v
SET "status" = 'inactive'
WHERE v."status" = 'active'
  AND NOT EXISTS (
    SELECT 1
    FROM "trips" AS active_trip
    WHERE active_trip."vehicle_id" = v."id"
      AND active_trip."status" = 'in_progress'
  );

DROP INDEX IF EXISTS "unique_active_trip_per_vehicle";
CREATE UNIQUE INDEX "unique_active_trip_per_vehicle"
ON "trips"("vehicle_id")
WHERE "status" = 'in_progress';

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

-- The product database was provisioned without the checks from the earlier
-- tracking-source migration. Reconcile them here so the new assignment model
-- does not leave the write boundary dependent on application code alone.
ALTER TABLE "tracking_sources"
DROP CONSTRAINT IF EXISTS "tracking_sources_id_not_blank_check",
DROP CONSTRAINT IF EXISTS "tracking_sources_name_not_blank_check",
DROP CONSTRAINT IF EXISTS "tracking_sources_type_check",
DROP CONSTRAINT IF EXISTS "tracking_sources_status_check",
DROP CONSTRAINT IF EXISTS "tracking_sources_priority_check",
DROP CONSTRAINT IF EXISTS "tracking_sources_credential_version_check",
DROP CONSTRAINT IF EXISTS "tracking_sources_active_credential_check",
ADD CONSTRAINT "tracking_sources_id_not_blank_check"
  CHECK (btrim("id") <> ''),
ADD CONSTRAINT "tracking_sources_name_not_blank_check"
  CHECK (btrim("name") <> ''),
ADD CONSTRAINT "tracking_sources_type_check"
  CHECK ("type" IN ('mobile', 'lorawan', 'esp32', 'simulator')),
ADD CONSTRAINT "tracking_sources_status_check"
  CHECK ("status" IN ('provisioning', 'active', 'inactive', 'retired')),
ADD CONSTRAINT "tracking_sources_priority_check"
  CHECK ("priority" >= 1),
ADD CONSTRAINT "tracking_sources_credential_version_check"
  CHECK ("credential_version" >= 1),
ADD CONSTRAINT "tracking_sources_active_credential_check"
  CHECK (
    "status" <> 'active'
    OR "type" = 'lorawan'
    OR "secret_hash" IS NOT NULL
  );

-- Likewise reconcile the role boundary from the feedback-triage migration;
-- the product rows already use the current vocabulary, but the constraint was
-- not present in the live database.
ALTER TABLE "users"
DROP CONSTRAINT IF EXISTS "users_role_check",
ADD CONSTRAINT "users_role_check"
  CHECK ("role" IN ('ADMIN', 'DEV', 'SUPER_ADMIN'));

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

COMMIT;
