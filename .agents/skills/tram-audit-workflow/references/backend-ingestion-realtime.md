# Backend Ingestion and Realtime

- Inspect Mobile Socket.IO handshake and per-write authentication, ESP32 HTTP authentication, and
  TTN webhook authentication as separate trust boundaries feeding one canonical service.
- Validate schema, coordinate bounds, device/source ownership, vehicle/trip binding, timestamp,
  accuracy units, sequence/deduplication key, payload size, and optional metadata allowlists.
- Preserve raw received facts before normalization when bounded diagnostics are enabled; never let a
  rejected or lower-priority observation overwrite canonical state.
- Check acknowledgements, error taxonomy, idempotency, retry safety, rate limits, timeout behavior,
  ordering, Socket.IO reconnect, and TTN duplicate webhook delivery.
- Measure accepted/rejected counts, receive-to-process duration, canonical-selection outcome, and
  failure reason without logging secrets or continuous coordinates.
- Verify query endpoints enforce developer authorization, bounded time ranges, pagination,
  aggregation, and export limits.
- Require tests for each transport, malformed data, clock skew, stale input, duplicates,
  out-of-order input, source failover, Redis outage, and persistence failure.
