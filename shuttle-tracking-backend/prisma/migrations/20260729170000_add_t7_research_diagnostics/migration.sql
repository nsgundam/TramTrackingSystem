-- T7 is additive. It does not rewrite or delete T5/T6 tables or Redis state.
ALTER TABLE "users"
  ADD COLUMN "role" VARCHAR(30) NOT NULL DEFAULT 'OPERATOR';

ALTER TABLE "users"
  ADD CONSTRAINT "users_role_check"
  CHECK ("role" IN ('OPERATOR', 'DEV', 'SUPER_ADMIN'));

CREATE TABLE "research_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "experiment_id" VARCHAR(100) NOT NULL,
  "session_alias" VARCHAR(100) NOT NULL,
  "protocol_version" VARCHAR(50) NOT NULL,
  "metric_definition_version" VARCHAR(50) NOT NULL,
  "status" VARCHAR(30) NOT NULL,
  "started_at" TIMESTAMPTZ(6) NOT NULL,
  "ended_at" TIMESTAMPTZ(6),
  "route_id" VARCHAR(50),
  "route_geometry_version" VARCHAR(100),
  "consent_basis_version" VARCHAR(50) NOT NULL,
  "aggregate_retention_class" VARCHAR(30) NOT NULL DEFAULT 'manual_delete',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "research_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "research_raw_observations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "run_id" VARCHAR(100) NOT NULL,
  "vehicle_id_at_receive" VARCHAR(50),
  "trip_id" UUID,
  "source_id" VARCHAR(50) NOT NULL,
  "source_type" VARCHAR(30) NOT NULL,
  "source_unit_key" VARCHAR(100) NOT NULL,
  "route_id" VARCHAR(50),
  "route_geometry_version" VARCHAR(100),
  "segment_id" VARCHAR(100),
  "metric_definition_version" VARCHAR(50) NOT NULL,
  "transport" VARCHAR(30) NOT NULL,
  "payload_schema_version" VARCHAR(50) NOT NULL,
  "device_model" VARCHAR(100),
  "device_os_or_app_version" VARCHAR(100),
  "firmware_version" VARCHAR(100),
  "codec_version" VARCHAR(100),
  "mounting_profile" VARCHAR(100),
  "power_profile" VARCHAR(100),
  "field_notes" VARCHAR(500),
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7),
  "location" geography(Point,4326),
  "speed_mps" DECIMAL(8,3),
  "heading_deg" DECIMAL(6,2),
  "producer_event_time" TIMESTAMPTZ(6),
  "producer_event_time_kind" VARCHAR(40),
  "producer_monotonic_time" BIGINT,
  "producer_clock_id" VARCHAR(100),
  "producer_clock_status" VARCHAR(40),
  "provider_receive_time" TIMESTAMPTZ(6),
  "provider_network_receive_time" TIMESTAMPTZ(6),
  "backend_receive_time" TIMESTAMPTZ(6) NOT NULL,
  "process_time" TIMESTAMPTZ(6) NOT NULL,
  "selected_time" TIMESTAMPTZ(6),
  "source_sequence" VARCHAR(100),
  "source_sequence_kind" VARCHAR(40),
  "trace_id" VARCHAR(100),
  "clock_uncertainty_ms" INTEGER,
  "clock_offset_ms" INTEGER,
  "validation_outcome" VARCHAR(30) NOT NULL,
  "duplicate_of" UUID,
  "reject_reason" VARCHAR(100),
  "late_reason" VARCHAR(100),
  "canonical_disposition" VARCHAR(40) NOT NULL,
  "reported_accuracy_value" DECIMAL(12,3),
  "reported_accuracy_unit" VARCHAR(30),
  "reported_accuracy_kind" VARCHAR(40),
  "reported_accuracy_source" VARCHAR(40),
  "observed_timestamp_difference_ms" INTEGER,
  "clock_basis" VARCHAR(40),
  "latency_claim" VARCHAR(40),
  "route_conformance_status" VARCHAR(40),
  "route_conformance_distance_m" DECIMAL(12,3),
  "pair_match_id" VARCHAR(100),
  "pairing_window_ms" INTEGER,
  "pairwise_disagreement_m" DECIMAL(12,3),
  "ttn_frame_port" INTEGER,
  "ttn_frame_counter" BIGINT,
  "gateway_count" INTEGER,
  "rssi" DECIMAL(8,2),
  "snr" DECIMAL(8,2),
  "provider_metadata_allowlist_version" VARCHAR(50),
  "battery_percentage" DECIMAL(5,2),
  "network_type" VARCHAR(40),
  "wifi_rssi" DECIMAL(8,2),
  "lorawan_rssi" DECIMAL(8,2),
  "lorawan_snr" DECIMAL(8,2),
  "dedupe_key" VARCHAR(160),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "research_raw_observations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "research_raw_observations_session_fkey"
    FOREIGN KEY ("session_id") REFERENCES "research_sessions"("id") ON DELETE CASCADE
);

CREATE TABLE "research_metric_aggregates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "metric_definition_version" VARCHAR(50) NOT NULL,
  "time_bucket" TIMESTAMPTZ(6),
  "source_alias" VARCHAR(100),
  "vehicle_alias" VARCHAR(100),
  "route_alias" VARCHAR(100),
  "transport" VARCHAR(30),
  "sample_count" INTEGER NOT NULL,
  "valid_count" INTEGER NOT NULL,
  "missing_count" INTEGER NOT NULL,
  "duplicate_count" INTEGER NOT NULL,
  "late_count" INTEGER NOT NULL,
  "availability_count" INTEGER NOT NULL,
  "cadence_mean_ms" DECIMAL(12,3),
  "cadence_jitter_ms" DECIMAL(12,3),
  "observed_timestamp_difference_ms" DECIMAL(12,3),
  "route_conformance_distance_m" DECIMAL(12,3),
  "pairwise_disagreement_m" DECIMAL(12,3),
  "reported_accuracy_value" DECIMAL(12,3),
  "ground_truth_error_m" DECIMAL(12,3),
  "input_watermark" TIMESTAMPTZ(6),
  "deletion_status" VARCHAR(40) NOT NULL DEFAULT 'retained_manual_delete',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "computed_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "research_metric_aggregates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "research_metric_aggregates_session_fkey"
    FOREIGN KEY ("session_id") REFERENCES "research_sessions"("id") ON DELETE CASCADE
);

CREATE TABLE "research_lifecycle_runs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID,
  "run_id" VARCHAR(100) NOT NULL,
  "action" VARCHAR(40) NOT NULL,
  "cutoff" TIMESTAMPTZ(6),
  "candidate_row_count" INTEGER,
  "backup_row_count" INTEGER,
  "deleted_row_count" INTEGER,
  "artifact_name" VARCHAR(255),
  "artifact_sha256" VARCHAR(64),
  "verification_status" VARCHAR(30) NOT NULL,
  "actor_role" VARCHAR(30) NOT NULL,
  "scope" VARCHAR(255),
  "started_at" TIMESTAMPTZ(6) NOT NULL,
  "ended_at" TIMESTAMPTZ(6),
  "error_code" VARCHAR(80),
  CONSTRAINT "research_lifecycle_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "research_lifecycle_runs_session_fkey"
    FOREIGN KEY ("session_id") REFERENCES "research_sessions"("id") ON DELETE SET NULL
);

CREATE INDEX "research_sessions_experiment_started_at_idx"
  ON "research_sessions"("experiment_id", "started_at" DESC);
CREATE INDEX "research_sessions_status_started_at_idx"
  ON "research_sessions"("status", "started_at" DESC);
CREATE INDEX "research_raw_observations_session_run_receive_id_idx"
  ON "research_raw_observations"("session_id", "run_id", "backend_receive_time", "id");
CREATE INDEX "research_raw_observations_source_receive_id_idx"
  ON "research_raw_observations"("source_id", "backend_receive_time", "id");
CREATE INDEX "research_raw_observations_vehicle_receive_id_idx"
  ON "research_raw_observations"("vehicle_id_at_receive", "backend_receive_time", "id");
CREATE INDEX "research_raw_observations_receive_time_idx"
  ON "research_raw_observations"("backend_receive_time");
CREATE INDEX "research_raw_observations_validation_receive_idx"
  ON "research_raw_observations"("validation_outcome", "backend_receive_time");
CREATE INDEX "research_raw_observations_location_gist_idx"
  ON "research_raw_observations" USING GIST ("location");
CREATE UNIQUE INDEX "research_raw_observations_session_source_dedupe_key"
  ON "research_raw_observations"("session_id", "source_id", "dedupe_key")
  WHERE "dedupe_key" IS NOT NULL;
CREATE INDEX "research_metric_aggregates_session_computed_at_idx"
  ON "research_metric_aggregates"("session_id", "computed_at" DESC);
CREATE INDEX "research_metric_aggregates_source_computed_at_idx"
  ON "research_metric_aggregates"("source_alias", "computed_at" DESC);
CREATE INDEX "research_lifecycle_runs_action_started_at_idx"
  ON "research_lifecycle_runs"("action", "started_at" DESC);
CREATE INDEX "research_lifecycle_runs_status_started_at_idx"
  ON "research_lifecycle_runs"("verification_status", "started_at" DESC);
