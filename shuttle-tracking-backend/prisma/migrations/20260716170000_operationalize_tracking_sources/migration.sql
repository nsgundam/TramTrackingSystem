-- Add credential lifecycle metadata without rewriting existing hashes.
ALTER TABLE "tracking_sources"
ADD COLUMN "credential_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "credential_issued_at" TIMESTAMP(6),
ADD COLUMN "credential_rotated_at" TIMESTAMP(6);

-- These constraints are intentionally NOT VALID first so the migration can
-- apply the write boundary before validating existing rows. Validation below
-- still fails closed if the current registry contains invalid data.
ALTER TABLE "tracking_sources"
ADD CONSTRAINT "tracking_sources_id_not_blank_check"
CHECK (btrim("id") <> '') NOT VALID,
ADD CONSTRAINT "tracking_sources_name_not_blank_check"
CHECK (btrim("name") <> '') NOT VALID,
ADD CONSTRAINT "tracking_sources_type_check"
CHECK ("type" IN ('mobile', 'lorawan', 'esp32', 'simulator')) NOT VALID,
ADD CONSTRAINT "tracking_sources_status_check"
CHECK ("status" IN ('provisioning', 'active', 'inactive', 'retired')) NOT VALID,
ADD CONSTRAINT "tracking_sources_priority_check"
CHECK ("priority" >= 1) NOT VALID,
ADD CONSTRAINT "tracking_sources_credential_version_check"
CHECK ("credential_version" >= 1) NOT VALID,
ADD CONSTRAINT "tracking_sources_active_vehicle_check"
CHECK ("status" <> 'active' OR "vehicle_id" IS NOT NULL) NOT VALID,
ADD CONSTRAINT "tracking_sources_active_credential_check"
CHECK (
  "status" <> 'active'
  OR "type" = 'lorawan'
  OR "secret_hash" IS NOT NULL
) NOT VALID;

ALTER TABLE "tracking_sources"
VALIDATE CONSTRAINT "tracking_sources_id_not_blank_check",
VALIDATE CONSTRAINT "tracking_sources_name_not_blank_check",
VALIDATE CONSTRAINT "tracking_sources_type_check",
VALIDATE CONSTRAINT "tracking_sources_status_check",
VALIDATE CONSTRAINT "tracking_sources_priority_check",
VALIDATE CONSTRAINT "tracking_sources_credential_version_check",
VALIDATE CONSTRAINT "tracking_sources_active_vehicle_check",
VALIDATE CONSTRAINT "tracking_sources_active_credential_check";

CREATE INDEX "tracking_sources_vehicle_id_status_priority_id_idx"
ON "tracking_sources"("vehicle_id", "status", "priority", "id");

CREATE INDEX "tracking_sources_status_last_seen_at_idx"
ON "tracking_sources"("status", "last_seen_at" DESC);

CREATE INDEX "gps_tracks_source_id_recorded_at_idx"
ON "gps_tracks"("source_id", "recorded_at" DESC);
