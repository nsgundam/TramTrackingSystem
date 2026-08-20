-- The product database already contained the T7 research tables, but its
-- migration history was absent and several T7 indexes were never provisioned.
-- Reconcile those additive indexes without rewriting any research data.  The
-- IF NOT EXISTS guards keep this safe for environments where migration 7 did
-- create the indexes already.

BEGIN;

CREATE INDEX IF NOT EXISTS "research_sessions_experiment_started_at_idx"
  ON "research_sessions"("experiment_id", "started_at" DESC);
CREATE INDEX IF NOT EXISTS "research_sessions_status_started_at_idx"
  ON "research_sessions"("status", "started_at" DESC);

CREATE INDEX IF NOT EXISTS "research_raw_observations_session_run_receive_id_idx"
  ON "research_raw_observations"("session_id", "run_id", "backend_receive_time", "id");
CREATE INDEX IF NOT EXISTS "research_raw_observations_source_receive_id_idx"
  ON "research_raw_observations"("source_id", "backend_receive_time", "id");
CREATE INDEX IF NOT EXISTS "research_raw_observations_vehicle_receive_id_idx"
  ON "research_raw_observations"("vehicle_id_at_receive", "backend_receive_time", "id");
CREATE INDEX IF NOT EXISTS "research_raw_observations_receive_time_idx"
  ON "research_raw_observations"("backend_receive_time");
CREATE INDEX IF NOT EXISTS "research_raw_observations_validation_receive_idx"
  ON "research_raw_observations"("validation_outcome", "backend_receive_time");
CREATE INDEX IF NOT EXISTS "research_raw_observations_location_gist_idx"
  ON "research_raw_observations" USING GIST ("location");
CREATE UNIQUE INDEX IF NOT EXISTS "research_raw_observations_session_source_dedupe_key"
  ON "research_raw_observations"("session_id", "source_id", "dedupe_key")
  WHERE "dedupe_key" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "research_metric_aggregates_session_computed_at_idx"
  ON "research_metric_aggregates"("session_id", "computed_at" DESC);
CREATE INDEX IF NOT EXISTS "research_metric_aggregates_source_computed_at_idx"
  ON "research_metric_aggregates"("source_alias", "computed_at" DESC);

CREATE INDEX IF NOT EXISTS "research_lifecycle_runs_action_started_at_idx"
  ON "research_lifecycle_runs"("action", "started_at" DESC);
CREATE INDEX IF NOT EXISTS "research_lifecycle_runs_status_started_at_idx"
  ON "research_lifecycle_runs"("verification_status", "started_at" DESC);

COMMIT;
