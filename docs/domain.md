# Domain and Product Boundaries

Tram Tracking System is a university shuttle/tram application. It gives riders a truthful view of
service and gives authorized staff an operational workspace. It is an MVP; repository-visible
behavior is not proof of deployed, field, device, or human acceptance.

## Actors and responsibilities

| Actor | Primary use | Boundary |
|---|---|---|
| Public rider | Select routes, inspect stops and live vehicle state, view ETA, submit feedback. | Never receives credentials, raw source data, unrestricted history, research data, or administrative actions. |
| Admin (`ADMIN`, `SUPER_ADMIN`, `DEV`) | Maintain routes, stops, vehicles, and inspect operational state. | Server authorization is authoritative; sensitive actions need their explicit role/fresh-auth rules. |
| Sender | Mobile, ESP32, simulator, or LoRaWAN source that sends vehicle observations. | Authenticated and bound to an active source/vehicle; sender credentials are never public. |
| Research user | Compares source quality through a protected research boundary. | Research observations and metrics stay distinct from public/canonical operational truth. |

## Current capabilities

- Public Next.js tracker with routes, stops, live canonical vehicle updates, ETA projection, browser
  geolocation/nearest-stop support, and bounded feedback submission.
- Authenticated Admin pages for dashboard, vehicle/route/stop management, route-stop ordering,
  read-only source health, and role-gated feedback handling.
- Express REST and Socket.IO backend with separate public, admin, sender, and TTN ingress paths.
- PostgreSQL/PostGIS for durable relational and spatial data, and Redis for cache, latest-source
  state, canonical live state, rate/throttle data, and Socket.IO fan-out.
- Authenticated mobile/ESP32 HTTP and Socket.IO ingestion plus a TTN webhook, with deterministic
  local simulators and pipeline checks.

## Truth and data semantics

- A source observation is not automatically the public vehicle truth. The backend selects one
  current canonical state per vehicle from active fresh sources by priority.
- Redis keeps latest per-source and current canonical state; it is not an append-only research
  store. `gps_tracks` is sampled canonical history, not a complete raw observation record.
- Use receive time as the current freshness authority unless a producer timestamp has its own
  defined semantics. Do not turn receive time into a device-latency or field-accuracy claim.
- Research data preserves provenance, units, timestamp meaning, selection/rejection semantics, and
  versioned definitions. Route-conformance, reported accuracy, pairwise disagreement, and
  ground-truth error are different measures; see [research/device-comparison-scope.md](research/device-comparison-scope.md).
- Simulators and browser fixtures exercise contracts only. They cannot establish hardware,
  provider, coverage, power, availability, physical accuracy, or production behavior.

## Product constraints

- Operational truth is more important than visual polish. Do not fabricate availability, accuracy,
  capacity, root cause, recovery, or service promises.
- Public and Admin visual identities remain deliberately separate. The Admin design is governed by
  [DESIGN.md](../DESIGN.md); public UI changes need their own approved requirement.
- Validate authorization at the server. Protect source credentials, access tokens, payloads, raw
  locations, research data, and internal errors from public and inappropriate admin surfaces.
- Production readiness requires independent evidence for host/network/TLS/secrets, backup/restore,
  monitoring/alerts, capacity, provider/device behavior, and human/assistive-technology use.

For the owner's current product intent and visual constraints, read [PRODUCT.md](../PRODUCT.md).
