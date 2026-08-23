-- Research data is intentionally and permanently removed by product decision.
-- Drop dependants before the parent session table to respect foreign keys.
BEGIN;

DROP TABLE IF EXISTS "research_raw_observations";
DROP TABLE IF EXISTS "research_metric_aggregates";
DROP TABLE IF EXISTS "research_lifecycle_runs";
DROP TABLE IF EXISTS "research_sessions";

COMMIT;
