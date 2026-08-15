# Identity, Security, and Privacy

- Separate rider, operator/admin, developer/researcher, Mobile sender, ESP32 sender, TTN webhook,
  provider, and service identities. Define resource ownership and action permissions server-side.
- Keep sender credentials source/vehicle/version-bound with expiry, rotation, revocation, safe
  provisioning, and no admin credential in apps or firmware.
- Protect Socket.IO writes, HTTP ingress, TTN webhook, raw-query, experiment-management, and export
  endpoints against replay, forgery, cross-vehicle access, abuse, oversized input, and enumeration.
- Treat precise historical location and device identifiers as sensitive research/operational data.
  Minimize fields, limit purpose/retention, audit reads/exports, redact logs, and define deletion.
- Assess threat and privacy impact before adding raw payloads, phone identifiers, battery/network
  metadata, or operator notes.
- Prefer allowlisted transport metadata over arbitrary JSON. Separate secrets and encrypted
  configuration from telemetry and exports.
- Require tests for role matrix, revoked/rotated credentials, token expiry, replay, insecure direct
  object reference, export bounds, log redaction, and retention deletion.
