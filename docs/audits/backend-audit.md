# Backend Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/roadmap/master-refactoring-roadmap.md`, `shuttle-tracking-backend/package.json`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/middleware/auth.ts`, `shuttle-tracking-backend/src/middleware/validation.ts`, `shuttle-tracking-backend/src/middleware/rate-limit.ts`, `shuttle-tracking-backend/src/middleware/boundary-errors.ts`, `shuttle-tracking-backend/src/routes/auth.route.ts`, `shuttle-tracking-backend/src/routes/trips.route.ts`, `shuttle-tracking-backend/src/routes/ingest.route.ts`, `shuttle-tracking-backend/src/routes/devices.route.ts`, `shuttle-tracking-backend/src/routes/public.route.ts`, `shuttle-tracking-backend/src/controllers/auth.controller.ts`, `shuttle-tracking-backend/src/controllers/trips.controller.ts`, `shuttle-tracking-backend/src/controllers/feedback.controller.ts`, `shuttle-tracking-backend/src/controllers/routeStops.controller.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/services/operations.service.ts`, `shuttle-tracking-backend/src/services/cache.service.ts`, `shuttle-tracking-backend/src/services/operational-signals.ts`, `shuttle-tracking-backend/src/config/redis.ts`, `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql`, `shuttle-tracking-backend/prisma/migrations/20260716170000_operationalize_tracking_sources/migration.sql`, `shuttle-tracking-backend/prisma/migrations/20260722120000_transactional_trip_lifecycle/migration.sql`, `shuttle-tracking-backend/test_pipeline.js`, `shuttle-tracking-backend/test_t5_operations.js`, `shuttle-tracking-backend/test_socket_boundary.js`, `shuttle-tracking-backend/test_devices_boundary.js`, `shuttle-tracking-backend/test_redis_logging.js`, and `scripts/ci-checks.sh`.
- Reviewed at: `2026-07-22T21:25:57+07:00`
- Validation state: **Validated**
- Predecessor baselines: Discovery, Product, and Architecture, each `@ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Legacy report commit: `565c58c`

## 1. Executive Summary

The backend is a coherent controlled-MVP boundary. Mobile Socket.IO, ESP32 HTTP, and TTN webhook inputs each have transport-specific authentication and converge on one source-aware observation pipeline. Sender credentials are source/vehicle/version bound and revalidated on every long-lived Socket.IO write. T5 now gives trip start, virtual-trip creation, active-trip validation, end, vehicle-state repair, and sampled-history writes one transactional Operations/Trip owner.

The backend is not yet an operations-grade or research-grade telemetry service. Observations have no producer event time, sequence, idempotency key, payload version, experiment/session identity, or durable raw disposition. Redis stores latest source and canonical state, while PostgreSQL stores sampled canonical history. Selection returns `null` when all sources are stale, but no versioned stale/offline state is published and a public active-vehicle read can return an old Redis location. Legacy admin CRUD and route-stop mutations still have inconsistent validation/cache behavior, and there is no authenticated trip-history, source-health, research query, or bounded export API.

Keep the monolith and current transport convergence for D-001=A. Implement the current roadmap T6 canonical-state contract before T7 research diagnostics, T8 truthful map consumers, or daily operational claims.

## 2. Scope, Freshness, and Predecessor Gate

This review covers Express routes/controllers/middleware, sender and TTN trust boundaries, Socket.IO acknowledgements, observation validation, canonical selection, Redis use, Operations/Trip integration, errors/rate limits, operational signals, and backend test evidence. It is a source and test review, not a live-service, penetration, load, provider, or physical-device test.

Discovery, Product, and Architecture are Complete and Validated at the same baseline, so the Backend predecessor gate passes. Compared with legacy backend evidence, T5 added the transactional Operations/Trip service and lifecycle migration; current source/seed/test documentation also reflects the three-source research scope and approved D-001–D-004 decisions. The current uncommitted changes are audit documentation only and do not modify backend behavior.

Current repository validation evidence includes the backend build/boundary suite, Prisma validation, T5 integration-test artifact, Socket.IO boundary test, device response projection test, Redis redaction test, and the repository CI command. No claim is made that a database/Redis target or running backend was available for every smoke test in this audit.

## 3. Prior-Finding Revalidation

| Prior finding | State | Current evidence and implication |
|---|---|---|
| Trip and Socket.IO sender identity was weak | **Resolved** | Sender JWT claims bind source, vehicle, and credential version; HTTP/trip routes authenticate the sender; Socket.IO revalidates token, source status, vehicle binding, and credential version per write. |
| Tracking-source/device abstraction was incomplete | **Resolved** | `TrackingSource` has type, status, priority, credential lifecycle, assignment, and last-seen fields; canonical selection is source-aware and deterministic. |
| Trip lifecycle was only partially protected | **Resolved** | `operations.service.ts` now owns start/virtual start/end/history invariants with vehicle row locks and idempotent behavior; T5 adds lifecycle/time checks while the partial unique active-trip index remains. |
| REST/GPS validation and safe errors were inconsistent | **Partially Resolved** | Ingest, sender, feedback, trip, device, route-stop, and TTN boundaries use shared parsers/error codes. Legacy vehicle/route/stop CRUD still accepts untyped bodies and error mapping is not uniform across all controllers. |
| Tracking-source ingestion needed authentication/rotation | **Resolved** | Active non-LoRaWAN sources require credentials; token claims carry credential version; rotation/reassignment/deactivation invalidates old sender credentials. TTN uses a separate webhook secret. |
| Route-stop cache invalidation was missing | **Still Present** | The shared cache service can delete route-stop keys, but route-stop create/delete controllers do not call it. |
| Realtime broadcast could report an invalid result | **Resolved** | HTTP and Socket.IO emit only a returned canonical location and return explicit acknowledgement/error responses. |
| Admin trip history/GPS playback reads were missing | **Still Present** | No protected trip/history/GPS-track read endpoint or bounded history query is mounted. |
| Automated backend tests were missing | **Partially Resolved** | Build, boundary, JWT, validation, device projection, Redis redaction, operational-signal, and T5 artifacts exist; repeatable controller/service integration and failure-injection coverage remains limited. |
| Device responses exposed credential hashes | **Resolved** | Device response projections omit `secretHash` and the device boundary test verifies it. |
| Observation ordering and retention semantics were undefined | **Still Present** | Backend receipt time and sampled canonical points exist, but there is no event time, sequence, idempotency, duplicate disposition, raw record, or retention implementation. |
| TTN source identity compatibility was uncertain | **Still Present** | The current parser requires `end_device_ids.device_id`; no current adapter/test establishes compatibility with payloads that identify a device only by another TTN identifier such as `dev_eui`. |
| Operational signals and CI gates were missing | **Partially Resolved** | CI, request IDs, allowlisted JSON signals, source-health sweep, suppression, and redaction tests exist. Signals are best-effort process logs, and malformed/oversized bodies can fail before the ingestion route signal is registered. |

## 4. Transport and Trust-Boundary Review

| Boundary | Authentication and validation | Current result |
|---|---|---|
| Mobile / sender Socket.IO | Anonymous viewer connection is allowed; sender must have a JWT at handshake and is revalidated before every `send-location` write. Payload source/vehicle must match claims, rate limit applies, and sender receives acknowledgement/error code. | Strong controlled-MVP boundary; no reconnect, sequence, duplicate, or stale event contract. |
| ESP32 / sender HTTP | `/api/ingest/http` requires a source JWT, validates source ownership and coordinate range, applies sender rate limit, and shares `processObservation`. | Appropriate convergence; retry/idempotency and physical client behavior are unverified. |
| LoRaWAN / TTN webhook | `/api/ingest/ttn` requires configured bearer secret with timing-safe comparison, rate-limits IP and source, decodes accepted TTN coordinate shapes, and enforces `lorawan` source type. | Correct server-side boundary; provider payload/device identity and duplicate delivery contract are unverified. |
| Admin REST | JWT must be present and non-sender claims are accepted as admin claims; covered writes use shared validation/rate limits. | Authentication boundary exists, but there is no role model and legacy CRUD validation remains uneven. |

Coordinate validation constrains latitude/longitude and bounds speed, bearing, and numeric accuracy, but accuracy units and semantic kind are not preserved. `processObservation` validates the source is active, verifies sender ownership/version, validates optional trip ownership, stores the latest source snapshot, selects canonical state, and admits sampled history. Rejected observations do not overwrite canonical state; lower-priority accepted observations update their own source snapshot but only become canonical if selection later allows it.

## 5. Canonical and Trip Processing

The current path is:

1. Parse/validate transport input and authenticate the sender or TTN webhook.
2. Load the active `TrackingSource` and verify source type, credential binding, vehicle binding, and optional active trip.
3. Store one latest source snapshot in Redis with a backend-generated timestamp and source type.
4. Read all active sources for the vehicle, order by priority then ID, and select the first snapshot no older than 30 seconds.
5. Normalize station state, attach vehicle/source/recorded time, write current canonical location to Redis, increment source-selection counters, and emit an operational signal.
6. Use a 60-second Redis admission key before calling the transactional Operations/Trip service to create/reuse the active trip and insert a PostGIS canonical sample.
7. Emit the canonical location globally through Socket.IO and acknowledge the sender.

T5 materially resolves the prior lifecycle finding. Eight concurrent starts resolve to one trip, repeated ends are idempotent, a stale end cannot inactivate a newer trip, and history writes are transactionally linked to an active trip in the T5 integration artifact. The remaining backend gap is not trip ownership; it is the absence of operational read APIs and a versioned freshness state shared with clients.

The current observation path still collapses producer event time, receive time, processing time, and canonical selection time to backend `Date.now()`. It has no sequence/deduplication rule, so delayed or repeated inputs cannot be explained or rejected by contract. A failed history transaction is logged and signaled while the canonical response may still be acknowledged, which is acceptable for a best-effort sampled MVP but must be explicit before durable-history claims.

## 6. API, Error, and Abuse-Control Review

Shared parsers cover auth, feedback, device, route-stop, trip, ingest, and TTN payloads. They provide bounded strings, UUID checks, coordinate ranges, numeric bounds, and explicit boundary error codes. The global JSON body limit and Socket.IO buffer limit are bounded to at most 1 MiB by configuration rules. Rate limits cover admin/sender login, feedback, sender observations/trips, admin device/route-stop writes, and TTN IP/source traffic.

`BoundaryError`/`mapBoundaryError` provide safe response codes and redact error details from logs. Prisma conflict/not-found/input errors are mapped in the common layer, but legacy vehicle/route/stop controllers still often catch and map failures to generic 500 responses rather than using typed request schemas. `clientAddress` intentionally does not trust forwarded headers until the deployment topology is approved; proxy-aware rate-limit identity remains a deployment concern.

The backend does not expose a protected trip-history, source-health, canonical-state, raw-observation, research-session, or bounded export API. The device analytics route returns Redis selection counters under the authenticated admin device router, but it has no time window, pagination, experiment identity, or durable aggregation.

## 7. Reliability and Realtime Review

- `/ready` checks PostgreSQL and Redis; startup attaches the Redis Socket.IO adapter and starts the source-health sweep.
- Source health is derived from active status and `lastSeenAt` with `never_seen`, `online`, `stale`, and `disabled` internal states. Signals are cooldown-suppressed and process-local; no queryable state endpoint exists.
- All-stale canonical selection returns `null` and emits a warning. It does not invalidate all old canonical Redis data or publish a client-visible stale/offline event.
- HTTP and Socket.IO use global `io.emit('location-update', ...)`. The Redis adapter supports multi-process fan-out but not durable replay, sequence ordering, rooms, or per-viewer filtering.
- There is no backend contract for duplicate TTN webhook delivery, stale/out-of-order observations, Redis outage behavior, reconnect snapshots, or persistence-failure acknowledgement semantics.
- Operational logs intentionally exclude coordinates, request bodies, secrets, and arbitrary exception messages. This is a privacy strength but also means the current logs cannot explain a source dispute without a bounded research record.

## 8. Missing Backend Capabilities

- Versioned canonical vehicle state with route authority, freshness/availability, selection reason, and explicit no-location states.
- Durable bounded raw diagnostics and accepted/rejected/duplicate/canonical dispositions for D-002/D-004.
- Protected trip/history read model with bounded time range, pagination, and role enforcement.
- Source-health/failover read model and recovery semantics.
- Route-stop mutation cache invalidation and active-route contract.
- Feedback read/triage workflow if D-001 expands to a support obligation.
- Provider-specific TTN identity compatibility tests and a documented payload/schema contract.

## 9. Actionable Recommendations

| Capability | Measurable outcome | Owner | Acceptance signal | Privacy/data boundary | Stage |
|---|---|---|---|---|---|
| T6 canonical state | Every canonical/no-location event has version, route, source, freshness, timestamps, and reason | Backend + Frontend | Tests cover stale, failover, duplicate, out-of-order, reconnect, and Redis degradation | Public receives canonical projection only | Phase 2 / T6 |
| Research diagnostics | Accepted/rejected/duplicate raw facts are queryable by bounded experiment/session filters | Backend + Database | Authenticated range/pagination/export/deletion tests pass | Separate research role, redaction, retention | Phase 2 / T7/T15 |
| Trip/history reads | Staff can list bounded trips and sampled history using T5 lifecycle vocabulary | Backend + Database + Dashboard | Authenticated read test against T5 fixture | Admin access; retention owner required | Phase 3 / T11 |
| Route-stop cache contract | Every route-stop mutation invalidates affected public projection | Backend | Mutation-to-public-read integration test observes updated order | Operational master data only | Phase 3 / T10 |
| Transport reliability | Retry, duplicate, stale, out-of-order, and dependency-failure outcomes have explicit disposition | Backend + Infrastructure | Per-transport failure-injection suite and redacted signal assertions | No continuous coordinates in logs | Phase 2/4 |

These are audit handoffs, not implementation authorization. No Level 2 consultation is required unless an owner asks for a focused retention, clock, provider identity, or research-access decision.

## 10. Roadmap and Decision Impact

T5 is now complete and its prior lifecycle finding must not be copied into new implementation work. This audit revalidates T6, T7, T8, T9, T11, T13, and T15 inputs. T6 remains the prerequisite for canonical consumer changes, raw diagnostics, and truthful maps. T10–T12 remain deferred by D-001=A unless the owner changes scope. D-002=B and D-004 authorize research direction but do not define retention, deletion, access, clock, or provider parameters.

No new owner decision is proposed. Existing D-001 through D-004 remain the source of truth.

## 11. Assumptions, Unknowns, and Confidence

- No running backend, PostgreSQL/Redis disposable target, mobile app, ESP32 firmware, TTN account, gateway, or production proxy was observed in this audit.
- Simulator and checked-in integration artifacts validate code paths, not field transport behavior.
- TTN provider identity aliases, webhook duplicate delivery, device clocks, sequence guarantees, retry policy, and Redis recovery behavior remain unknown.
- Confidence is **high** for repository-visible middleware, source ownership, service boundaries, and test artifacts; **medium** for runtime reliability and integration; **low** for provider/physical behavior.

## 12. Audit Limitations and Handoff

No application code or schema changes are authorized by this report. Backend is now Complete and Validated. Infrastructure & Device remains gated until Frontend and Database are also validated; Dashboard & UX, Security/DevOps/Observability, Production Readiness, and Roadmap remain in their registered predecessor order.
