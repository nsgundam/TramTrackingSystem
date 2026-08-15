# PostgreSQL, Redis, and Retention

- Keep Redis for ephemeral current/freshness/cache/coordination state and PostgreSQL/PostGIS for
  approved durable observations, assignments, experiments, and aggregates.
- Propose an additive schema that records experiment/session, source, vehicle/trip, event/receive
  times, geometry, reported accuracy, acceptance/selection result, sequence, transport, version, and
  allowlisted metadata without storing unrestricted payload blobs by default.
- Preserve source-to-vehicle assignment history and route geometry version for reproducible analysis.
- Define raw and aggregate retention, deletion verification, partitions if volume justifies them,
  indexes, query bounds, storage estimates, and backup/restore implications.
- Use appropriate PostGIS geography/geometry operations and coordinate reference systems; verify
  `ST_Distance` semantics and query plans against representative data.
- Make retention/deletion and aggregation jobs restart-safe and observable. Test duplicates,
  out-of-order data, late arrival, Redis loss, DB failure, migration rollout/rollback, and cascade.
- Do not adopt a time-series extension or external analytics store until measured volume/query
  evidence demonstrates PostgreSQL is insufficient.
