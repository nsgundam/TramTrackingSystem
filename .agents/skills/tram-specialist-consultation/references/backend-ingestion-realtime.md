# Backend Ingestion and Realtime

- Preserve one normalized observation service behind Socket.IO, HTTP, and TTN adapters while
  retaining transport/source metadata needed for bounded research.
- Define versioned DTOs, units, nullable fields, event/receive time, sequence/deduplication identity,
  maximum payload, ownership, trip binding, and structured rejection reasons.
- Decide transaction/outbox behavior for durable raw evidence, canonical state, and broadcast so a
  partial failure is visible and recoverable.
- Make retries idempotent and ordering explicit. Test duplicate Socket.IO emissions, repeated HTTP
  requests, TTN webhook retries, late events, and clock skew.
- Keep raw observation acceptance distinct from canonical selection; lower-priority or rejected data
  must never impersonate the public current location.
- Design bounded developer APIs with authorization, time/source/session filters, pagination,
  server aggregation, export limits, cancellation, and stable response schemas.
- Benchmark query and ingest paths with representative frequency and retention before adding queues,
  streaming platforms, or a new backend stack.
