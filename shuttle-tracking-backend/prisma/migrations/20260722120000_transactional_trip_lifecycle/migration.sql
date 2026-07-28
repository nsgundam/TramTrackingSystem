-- T5: keep the active-trip partial unique index and make the lifecycle
-- vocabulary/time relationship a database invariant as well.
ALTER TABLE "trips"
ADD CONSTRAINT "trips_status_check"
CHECK ("status" IN ('in_progress', 'completed')) NOT VALID,
ADD CONSTRAINT "trips_status_time_check"
CHECK (
  ("status" = 'in_progress' AND "end_time" IS NULL)
  OR ("status" = 'completed' AND "end_time" IS NOT NULL)
) NOT VALID,
ADD CONSTRAINT "trips_end_after_start_check"
CHECK ("end_time" IS NULL OR "end_time" >= "start_time") NOT VALID;

ALTER TABLE "trips"
VALIDATE CONSTRAINT "trips_status_check",
VALIDATE CONSTRAINT "trips_status_time_check",
VALIDATE CONSTRAINT "trips_end_after_start_check";
