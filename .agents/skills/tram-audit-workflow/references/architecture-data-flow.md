# Architecture and Data Flow

- Trace each source from acquisition through authentication, transport, normalization, raw
  diagnostics, canonical selection, persistence, API/realtime delivery, dashboard query, and export.
- Preserve one normalized observation contract while retaining transport-specific metadata in a
  bounded extension; avoid three independent downstream pipelines.
- Separate device event time, server receive time, processing time, canonical selection time, and
  client display time. Define clock quality before interpreting latency.
- Keep raw research observations, canonical current state, sampled trip history, and aggregate
  analytics as explicit data products with different retention and authority.
- Require experiment/session identity, source identity, vehicle assignment history, payload/schema
  version, and deterministic deduplication or sequence semantics.
- Design Redis loss as a degraded live-state event, not loss of the approved durable research
  evidence. Keep PostgreSQL/PostGIS as durable truth unless a later evidence-backed decision changes
  it.
- Check backpressure, retries, duplicates, out-of-order events, reconnects, failover, and partial
  provider outage across all three transports.
- Preserve public canonical-only views and place raw comparison behind authenticated developer
  authorization.
