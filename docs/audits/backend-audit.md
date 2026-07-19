# Backend Audit: Tram Tracking System

Re-audited: 2026-07-19
Scope: current Express/TypeScript backend, Prisma schema and migrations, Redis/Socket.IO pipeline,
backend tests, and backend-facing configuration. This is a source review, not a live-service or
penetration test.

## 1. Executive Summary

The backend is materially stronger than the prior audit. Sender credentials are short-lived,
source- and vehicle-bound, revalidated on every Socket.IO write, and used by HTTP ingestion and
trip routes. The tracking-source registry, deterministic source selection, canonical-location
pipeline, and readiness endpoint are credible foundations for a controlled MVP.

It is not yet an operations-grade backend. Trip lifecycle has competing writers and no database
guarantee of one active trip per vehicle. Validation and error normalization remain inconsistent,
device APIs disclose `secretHash`, and observations lack event-time, sequence, idempotency, and
rejection semantics. The next implementation priority is one transactional Operations/Trip owner.

## 2. Scope, Evidence, and Re-audit Status

Evidence reviewed:

- `shuttle-tracking-backend/src/server.ts`, middleware, routes, controllers, services, Prisma
  schema, and migration `20260716170000_operationalize_tracking_sources`.
- `docs/project-knowledge-base.md`, current Product and Architecture reports, and the prior
  Backend Audit.
- `npm test` passed on 2026-07-19: TypeScript build plus sender-JWT boundary test. Socket.IO and
  pipeline scripts require a configured running stack and were not run.

| Prior finding | Re-audit status | Current evidence |
|---|---|---|
| Trip and Socket.IO sender identity was weak | **Resolved** | Sender JWT is source/vehicle/version bound; HTTP/trip routes require it; Socket.IO revalidates it per write. |
| Tracking-source/device abstraction was incomplete | **Resolved** | Source lifecycle fields, migration constraints, priority, and source-aware canonical selection are present. |
| Trip lifecycle was only partially protected | **Still Present** | Start and auto-trip paths can both create `in_progress` trips; neither uses one transaction or a DB uniqueness invariant. |
| REST/GPS validation and safe errors were inconsistent | **Partially Resolved** | GPS ownership/coordinate checks improved, but resource endpoints still admit untyped input and map many failures to 500. |
| Tracking-source ingestion needed authentication/rotation | **Resolved** | Active non-LoRaWAN sources require secrets; credential rotation invalidates old sender tokens. |
| Route-stop cache invalidation was missing | **Still Present** | Route-stop mutations do not invalidate `public:route_stops:*`. |
| Realtime broadcast could report an invalid result | **Resolved** | Transports broadcast only a returned canonical location and acknowledge/reject the sender. |
| Admin trip history/GPS playback reads were missing | **Still Present** | No protected trip-history or GPS-track read route is mounted. |
| Automated backend tests were missing | **Partially Resolved** | Build/JWT boundary test exist; no repeatable service/controller integration suite is evidenced. |
| Device responses expose credential hashes | **New Finding** | Device list/get/create/update directly serialize `TrackingSource`, including `secretHash`. |
| Observation ordering and retention semantics were undefined | **New Finding** | Receipt time and sampled canonical points are stored; no event time, sequence, idempotency, or disposition contract exists. |

## 3. Current Backend Overview

Express exposes public reads and feedback, authenticated admin CRUD, sender trip controls, HTTP
ingestion, and a TTN webhook. Redis holds latest source snapshots, canonical vehicle locations,
sampling locks, public cache, and source-selection counters. PostgreSQL/PostGIS holds master data,
trips, sampled canonical `gps_tracks`, feedback, and tracking sources.

Every accepted observation reaches `processObservation`: it validates coordinates and source/sender
binding, chooses the highest-priority fresh source, stores canonical state in Redis, and attempts a
60-second sampled history write. HTTP and Socket.IO broadcast only the returned canonical result.

## 4. Backend Strengths

- Sender login issues source, vehicle, and credential-version claims; revocation, reassignment,
  deactivation, and rotation take effect during revalidation.
- TTN fails closed without a secret and compares its bearer value with `timingSafeEqual`.
- The tracking-source migration constrains active non-LoRaWAN sources to have a vehicle and secret.
- Source selection is deterministic by priority then ID, with a 30-second freshness window.
- `/ready` checks PostgreSQL and Redis; a Redis Socket.IO adapter supports multi-process fan-out.
- Sender acknowledgements/error codes are explicit; `npm test` passes.

## 5. Critical Issues

### High — Trip lifecycle has competing, non-transactional writers

`POST /api/trips/start` always creates an `in_progress` trip. The tracking service also creates a
virtual active trip after a canonical observation when no active trip is found. Neither path checks
and creates atomically; the schema has indexes but no partial unique constraint for one active trip
per vehicle. Ending one trip also sets the vehicle inactive even if another active trip exists.

Impact: duplicate active trips, ambiguous sample ownership, and incorrect vehicle state under
retries or concurrent sender/location traffic.

Recommendation: create one Operations/Trip service with explicit idempotency, a transaction for
trip/vehicle/history changes, and a database invariant. Decide whether virtual trips are a supported
product behavior or are removed from the pipeline.

Priority: High. Difficulty: Medium.

### High — Device APIs disclose credential hashes

Device list, get, create, and update handlers serialize Prisma `TrackingSource` records without a
response mapper; authenticated admin clients therefore receive `secretHash`.

Impact: copied admin API output exposes an offline-verifiable credential hash beyond the server
boundary.

Recommendation: define a device response DTO that never serializes `secretHash`, return an explicit
rotation/provisioning acknowledgement, and test this absence.

Priority: High. Difficulty: Easy.

### High — Observation contract cannot reason about ordering or replay

The pipeline assigns `Date.now()` at receipt and accepts no sender event time, sequence,
idempotency key, or typed payload envelope. Redis keeps only the latest source snapshot and
PostgreSQL stores one canonical sample per 60 seconds. A delayed/retried observation can replace a
newer one, while rejected/lower-priority observations cannot be explained later.

Recommendation: define an observation and canonical-state contract with event/received time,
version or sequence, source, freshness, and selection/rejection disposition. D-002 determines
whether only canonical samples or bounded raw diagnostics are retained.

Priority: High before playback, source comparison, or daily operations. Difficulty: Medium.

## 6. API Review

Sender ownership and coordinate validation improved substantially. HTTP ingestion returns structured
rejection codes, while trip end rejects foreign/non-active trips. Resource controllers generally
accept `any` request bodies, rely on Prisma/database failures, and return generic 500 responses for
duplicates, foreign keys, invalid enum/status values, malformed priority, and constraints. TTN's
generic 500 branch exposes error details and a stack.

There is no shared request/response DTO layer, OpenAPI contract, or centralized error mapper. Add
schema validation and normalized 400/404/409/422 responses for device, route-stop, trip, feedback,
sender-login, and observation requests. Rate limiting is not evidenced for login, feedback, sender
login, or ingest endpoints; Security/DevOps should validate the broader abuse controls.

## 7. Trip Lifecycle Review

Start is sender-vehicle-bound and end checks ownership/status, but repeated starts are not
idempotent and do not coordinate with the virtual-trip creator. `gps_tracks` writes only when Redis
grants a 60-second key; failures are logged and swallowed. There is no admin history/read API or
explicit lifecycle model for cancellation, pause, or stale service.

## 8. WebSocket and GPS Review

Public viewers may connect anonymously. Sender sockets receive a verified context at handshake and
revalidate token expiry, source status, vehicle binding, and credential version before every write.
The event only broadcasts a canonical location and returns acknowledgement/error codes. This
resolves the prior unauthenticated-write finding.

Remaining protocol gaps: no event version, event time, sequence, duplicate rule, payload schema,
vehicle room, or stale/offline event. Global `location-update` is acceptable for a controlled MVP
but has a scale trigger.

## 9. Redis Review

Redis is appropriate for latest-source/canonical state, sampling locks, public cache, analytics, and
Socket.IO fan-out. It is not durable current state: Redis loss clears current location/freshness
until new observations arrive. All-stale selection returns `null`, and the public API shows a null
location rather than explicit freshness/no-service state.

Route, stop, and vehicle mutations invalidate public cache. Route-stop mutations do not. The cache
invalidator also uses `KEYS` for route-stop discovery, which should become targeted invalidation or
`SCAN` before cache cardinality grows.

## 10. Multiple Device Support Review

The registry separates sources from vehicles, offers deterministic priority/freshness selection, and
derives source health from `lastSeenAt`. Credential-version rotation invalidates old sender tokens.
It does not retain enough facts to compare sources later or expose an operational source-health /
canonical-selection read model. Those needs are blocked by the canonical-state contract and D-002,
not by a need for another pipeline.

## 11. Reliability Review

Readiness and startup failure handling give a useful dependency boundary. History persistence errors
are only logged, so a successful sender acknowledgement can coexist with lost history. No retry,
dead-letter, timeout, correlation ID, metrics, or alerting behavior is evidenced. Tests prove token
parsing but not configured Redis/Postgres, controller behavior, cache invalidation, trip races,
credential rotation, or stale failover in repeatable CI.

## 12. Missing Backend Capabilities

- Transactional/idempotent single active-trip ownership.
- Canonical state with freshness/no-service reason and version.
- Safe device response projection and shared validation/error DTOs.
- Admin trip/history/GPS-track read API.
- D-002-aligned observation ordering and retention policy.
- Route-stop cache invalidation and repeatable Postgres/Redis integration tests.

## 13. Recommended Improvements

1. **Create the Operations/Trip service** with a database invariant and explicit virtual-trip policy. **High; Medium.**
2. **Remove `secretHash` from all responses** using explicit device DTOs and route tests. **High; Easy.**
3. **Publish a versioned observation/canonical-state contract**; decide retention through D-002. **High; Medium.**
4. **Add shared validation and error mapping** for device, route-stop, sender, trip, feedback, and ingest requests. **Medium-High; Medium.**
5. **Repair route-stop cache and operational reads** for stale/no-service and trip history. **Medium; Medium.**
6. **Add an ephemeral-stack integration suite** for lifecycle, cache, and ingestion behavior. **Medium; Medium.**

## 14. Backend Learning Topics

- Partial unique indexes and transaction isolation for lifecycle state transitions.
- Idempotent/out-of-order telemetry processing.
- DTO validation, safe response projections, and error-taxonomy design.
- Redis freshness/cache invalidation and durable-versus-ephemeral state.
- Disposable PostgreSQL/Redis integration testing.

## 15. Roadmap Impact

- Before daily operations: resolve the Operations/Trip owner, credential-hash exposure, canonical
  freshness/ordering semantics, and route-stop cache invalidation.
- D-002 gates raw telemetry, source comparison, and high-fidelity playback claims.
- Admin history, source-health read models, feedback operations, rate limits, and observability are
  downstream work; no microservice split is justified.

## 16. Assumptions and Unknowns

- Deployment uses non-placeholder secrets and applied migrations; no live environment was queried.
- Production sender, TTN, Redis durability, and database concurrency behavior were not exercised.
- Virtual auto-trip policy and daily operating scope remain unresolved under D-001.

## 17. Confidence

**High** for source-visible sender boundaries, lifecycle/observation behavior, device response shape,
and the passing JWT boundary test. **Medium** for runtime reliability and race outcomes because no
configured service or production data was used.

## 18. Required Decisions

- **D-001 — Operational MVP release scope:** determines whether unresolved trip/history and stale
  state gaps block release beyond a controlled demonstration.
- **D-002 — Telemetry retention and canonical-history fidelity:** determines canonical-only versus
  bounded raw diagnostics before playback or source comparison.

No new owner decision is needed to remove hash exposure, add DTOs, invalidate route-stop cache, or
make the active-trip invariant transactional.

## 19. Audit Limitations

No live database, Redis, Socket.IO server, sender hardware, TTN provider, browser client, load test,
or penetration test was used. Socket.IO and pipeline scripts were inspected but not run because they
need configured live services and credentials.

## 20. Handoff

This report supersedes the prior Backend Audit. Lead Audit may mark Backend complete after shared
minimum validation. The next phase should use this report as input and must not treat the resolved
sender-authentication finding as open.
