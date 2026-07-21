# Backend Audit: Tram Tracking System

Re-audited: 2026-07-21
Scope: current Express/TypeScript backend, Prisma schema and migrations, Redis/Socket.IO pipeline,
backend tests, and backend-facing configuration. This is a source review, not a live-service or
penetration test.

## 1. Executive Summary

The backend is materially stronger than the prior audit. Sender credentials are short-lived,
source- and vehicle-bound, revalidated on every Socket.IO write, and used by HTTP ingestion and
trip routes. The tracking-source registry, deterministic source selection, canonical-location
pipeline, and readiness endpoint are credible foundations for a controlled MVP.

It is not yet an operations-grade backend. Trip lifecycle still has competing non-transactional
writers, although the migration now includes a database guarantee of one active trip per vehicle.
Validation and error normalization remain inconsistent across legacy admin CRUD, and observations
still lack event-time, sequence, idempotency, and rejection semantics. The next implementation
priority is one transactional Operations/Trip owner.

## 2. Scope, Evidence, and Re-audit Status

Evidence reviewed:

- `shuttle-tracking-backend/src/server.ts`, middleware, routes, controllers, services, Prisma
  schema, and migration `20260716170000_operationalize_tracking_sources`.
- `docs/project-knowledge-base.md`, current Product and Architecture reports, and the prior
  Backend Audit.
- `npm test` passed on 2026-07-21: TypeScript build, sender-JWT boundary test, and T2 validation/error-boundary test.
- `node test_devices_boundary.js`, `node test_redis_logging.js`, and `npx prisma validate` passed on 2026-07-21.
- Pipeline and Socket.IO smoke scripts were attempted but could not connect to a running backend in this environment; no live-service result is claimed.

| Prior finding | Re-audit status | Current evidence |
|---|---|---|
| Trip and Socket.IO sender identity was weak | **Resolved** | Sender JWT is source/vehicle/version bound; HTTP/trip routes require it; Socket.IO revalidates it per write. |
| Tracking-source/device abstraction was incomplete | **Resolved** | Source lifecycle fields, migration constraints, priority, and source-aware canonical selection are present. |
| Trip lifecycle was only partially protected | **Partially Resolved** | Partial unique index now prevents duplicate active rows and boundary mapping returns conflicts, but start/auto-trip writers are still non-transactional and not idempotent. |
| REST/GPS validation and safe errors were inconsistent | **Partially Resolved** | GPS ownership/coordinate checks improved, but resource endpoints still admit untyped input and map many failures to 500. |
| Tracking-source ingestion needed authentication/rotation | **Resolved** | Active non-LoRaWAN sources require secrets; credential rotation invalidates old sender tokens. |
| Route-stop cache invalidation was missing | **Still Present** | Route-stop mutations do not invalidate `public:route_stops:*`. |
| Realtime broadcast could report an invalid result | **Resolved** | Transports broadcast only a returned canonical location and acknowledge/reject the sender. |
| Admin trip history/GPS playback reads were missing | **Still Present** | No protected trip-history or GPS-track read route is mounted. |
| Automated backend tests were missing | **Partially Resolved** | Build, JWT, validation/error, device-response, and Redis-log boundary tests pass; no repeatable service/controller integration suite is evidenced. |
| Device responses expose credential hashes | **Resolved** | `toDeviceResponse`/`toDeviceMutationResponse` omit `secretHash`; device boundary tests verify the omission. |
| Observation ordering and retention semantics were undefined | **New Finding** | Receipt time and sampled canonical points are stored; no event time, sequence, idempotency, or disposition contract exists. |
| TTN source identity compatibility | **New Finding** | `parseTtnSourceId` now requires `end_device_ids.device_id`; the previous adapter also accepted `dev_eui`, so payloads without `device_id` need an explicit contract decision or fallback. |

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
- Sender acknowledgements/error codes are explicit; device response projection, Redis log redaction,
  validation boundaries, and `npm test` pass.

## 5. Critical Issues

### High — Trip lifecycle has competing, non-transactional writers

`POST /api/trips/start` still attempts to create an `in_progress` trip on every request, while the
tracking service can create a virtual active trip after a canonical observation. A partial unique
index in `20260714155233_add_tracking_sources` prevents duplicate active rows, and the boundary
mapper turns the resulting conflict into 409, but neither writer checks and updates state in one
transaction. Ending one trip also sets the vehicle inactive without a transaction with the trip
update.

Impact: duplicate rows are blocked when the migration is applied, but concurrent starts can still
produce conflict responses and ambiguous virtual-vs-explicit ownership. Concurrent end requests can
both pass the initial status read because the final update is not conditional or transactional.

Recommendation: create one Operations/Trip service with explicit idempotency, a transaction for
trip/vehicle/history changes, and a database invariant. Decide whether virtual trips are a supported
product behavior or are removed from the pipeline.

Priority: High. Difficulty: Medium.

### Resolved — Device response credential exposure

`toDeviceResponse` and `toDeviceMutationResponse` explicitly project device fields and omit
`secretHash`. `test_devices_boundary.js` verifies that list/read/mutation-shaped responses do not
contain the hash or the original secret.

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
rejection codes, while trip end rejects foreign/non-active trips. T2 now validates admin login,
sender login, device writes, route-stop writes, feedback, trips, ingest payloads, and TTN envelopes.
Legacy vehicle/route/stop controllers still accept untyped request bodies and rely on Prisma/database
failures, so duplicate, foreign-key, invalid enum/status, and constraint responses remain uneven.

The new boundary layer provides shared parsers and error mapping for covered routes, but there is
still no OpenAPI contract and legacy admin CRUD is outside that boundary. Rate limiting now covers
admin login, sender login, feedback, sender trip/observation writes, device/route-stop writes, and
TTN IP/source quotas; broader abuse controls and proxy-aware client identity still need operational
validation. The TTN parser currently requires `end_device_ids.device_id`; support for `dev_eui` is
not evidenced in the current validation path.

## 7. Trip Lifecycle Review

Start is sender-vehicle-bound and end checks ownership/status, but repeated starts are not
idempotent and do not coordinate with the virtual-trip creator. End has a time-of-check/time-of-use
window: two requests can both observe `in_progress` before either update completes. `gps_tracks`
writes only when Redis grants a 60-second key; failures are logged and swallowed. There is no admin
history/read API or explicit lifecycle model for cancellation, pause, or stale service.

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
dead-letter, timeout, correlation ID, metrics, or alerting behavior is evidenced. Boundary tests now
cover token parsing, validation, safe errors, response projection, and Redis log redaction, but do
not cover configured Redis/Postgres, controller behavior, cache invalidation, trip races, or stale
failover in repeatable CI.

## 12. Missing Backend Capabilities

- Transactional/idempotent single active-trip ownership.
- Canonical state with freshness/no-service reason and version.
- Shared validation/error DTOs for legacy admin resources and a documented API contract.
- Admin trip/history/GPS-track read API.
- D-002-aligned observation ordering and retention policy.
- Route-stop cache invalidation and repeatable Postgres/Redis integration tests.

## 13. Recommended Improvements

1. **Create the Operations/Trip service** with a database invariant and explicit virtual-trip policy. **High; Medium.**
2. **Publish a versioned observation/canonical-state contract**; decide retention through D-002. **High; Medium.**
3. **Extend shared validation and error mapping** to legacy vehicle, route, and stop writes. **Medium-High; Medium.**
4. **Repair route-stop cache and operational reads** for stale/no-service and trip history. **Medium; Medium.**
5. **Add an ephemeral-stack integration suite** for lifecycle, cache, and ingestion behavior. **Medium; Medium.**

## 14. Backend Learning Topics

- Partial unique indexes and transaction isolation for lifecycle state transitions.
- Idempotent/out-of-order telemetry processing.
- DTO validation, safe response projections, and error-taxonomy design.
- Redis freshness/cache invalidation and durable-versus-ephemeral state.
- Disposable PostgreSQL/Redis integration testing.

## 15. Roadmap Impact

- Before daily operations: resolve the Operations/Trip owner, canonical freshness/ordering semantics,
  and route-stop cache invalidation.
- D-002 gates raw telemetry, source comparison, and high-fidelity playback claims.
- Admin history, source-health read models, feedback operations, rate limits, and observability are
  downstream work; no microservice split is justified.

## 16. Assumptions and Unknowns

- Deployment uses non-placeholder secrets and applied migrations; no live environment was queried.
- Production sender, TTN, Redis durability, and database concurrency behavior were not exercised.
- Virtual auto-trip policy and daily operating scope remain unresolved under D-001.

## 17. Confidence

**High** for source-visible sender boundaries, lifecycle/observation behavior, device response shape,
and the passing boundary tests. **Medium** for runtime reliability and race outcomes because no
configured service or production data was used.

## 18. Required Decisions

- **D-001 — Operational MVP release scope:** determines whether unresolved trip/history and stale
  state gaps block release beyond a controlled demonstration.
- **D-002 — Telemetry retention and canonical-history fidelity:** determines canonical-only versus
  bounded raw diagnostics before playback or source comparison.

No new owner decision is needed to extend legacy validation, invalidate route-stop cache, or make the
active-trip invariant transactional. Hash exposure is resolved by the current DTO projection.

## 19. Audit Limitations

No live database, Redis, Socket.IO server, sender hardware, TTN provider, browser client, load test,
or penetration test was used. Socket.IO and pipeline scripts were inspected but not run because they
need configured live services and credentials.

## 20. Handoff

This report supersedes the prior Backend Audit. Lead Audit may mark Backend complete after shared
minimum validation. The next phase should use this report as input and must not treat the resolved
sender-authentication finding as open.
