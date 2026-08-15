# Security, DevOps, and Observability

- Model public viewer, admin/operator, developer/researcher, Mobile sender, ESP32 sender, TTN webhook,
  gateway/provider, database, Redis, and export consumers as separate trust boundaries.
- Require least-privilege roles for raw telemetry, experiment management, export, device
  provisioning, and credential rotation. UI hiding is not authorization.
- Protect admin/session and sender credentials; rate-limit each ingress; validate payload size and
  type; resist replay, duplicate, forged source, cross-vehicle, and export abuse.
- Minimize precise location retention, document purpose and expiry, restrict raw exports, audit
  sensitive reads/exports, and define deletion/incident handling.
- Keep coordinates, secrets, tokens, payload bodies, and high-cardinality device events out of
  ordinary logs. Use allowlisted metrics and sampled/redacted diagnostics.
- Observe per-transport accepted/rejected/duplicate counts, latency, freshness, persistence failure,
  queue/backpressure, source recovery, TTN webhook failure, and dashboard query/export failure.
- Validate CI dependency checks, secret scanning, boundary tests, migration safety, container
  hardening, TLS/origins, backup/restore, alert routing, runbooks, and environment separation.
- Treat firmware/provider configuration and physical access as production security evidence, not
  application-code assumptions.
