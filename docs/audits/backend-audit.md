# Backend Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`, `docs/audits/README.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/research/T7-owner-input-questionnaire.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/roadmap/master-refactoring-roadmap.md`, `docs/tasks/T6-canonical-vehicle-state.md`, `docs/tasks/T7-raw-research-observations.md`, `shuttle-tracking-backend/package.json`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/middleware/auth.ts`, `shuttle-tracking-backend/src/middleware/validation.ts`, `shuttle-tracking-backend/src/middleware/rate-limit.ts`, `shuttle-tracking-backend/src/middleware/boundary-errors.ts`, `shuttle-tracking-backend/src/routes/auth.route.ts`, `shuttle-tracking-backend/src/routes/trips.route.ts`, `shuttle-tracking-backend/src/routes/ingest.route.ts`, `shuttle-tracking-backend/src/routes/devices.route.ts`, `shuttle-tracking-backend/src/routes/public.route.ts`, `shuttle-tracking-backend/src/controllers/auth.controller.ts`, `shuttle-tracking-backend/src/controllers/trips.controller.ts`, `shuttle-tracking-backend/src/controllers/feedback.controller.ts`, `shuttle-tracking-backend/src/controllers/routeStops.controller.ts`, `shuttle-tracking-backend/src/controllers/public.controller.ts`, `shuttle-tracking-backend/src/services/canonical-state.service.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/services/operations.service.ts`, `shuttle-tracking-backend/src/services/cache.service.ts`, `shuttle-tracking-backend/src/services/operational-signals.ts`, `shuttle-tracking-backend/src/config/redis.ts`, `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/tests/`, and `scripts/ci-checks.sh`.
- Reviewed at: `2026-07-29T11:01:56+07:00`
- Validation state: `Validated`
- Predecessor baselines: `docs/project-knowledge-base.md @ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`; `docs/audits/product-audit.md @ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`; `docs/audits/architecture-audit.md @ fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`
- Previous report evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Legacy report commit: `565c58c`

## 1. Executive Summary

The backend is a coherent controlled-MVP boundary for D-001=A. Mobile Socket.IO, ESP32 HTTP,
and LoRaWAN/TTN inputs retain transport-specific authentication and converge on one source-aware
observation path. T5 still gives trip start, virtual-trip creation, active-trip validation, end,
vehicle-state repair, and sampled-history writes one transactional Operations/Trip owner.

T6 is now incorporated: canonical state has a backend-owned versioned envelope, route authority,
freshness/service states, a single publication boundary, public projection redaction, and REST/
Socket.IO parity. Lower-priority or rejected writes do not become canonical merely because they are
received, and sampled history remains best-effort after live publication.

The backend is not an operations-grade or research-grade telemetry service. It has no durable raw
observation/disposition record, producer event time, sequence/idempotency contract, research-session
API, protected history query, or bounded export. Source selection is duplicated between ingestion
and freshness refresh, source health uses process-local state and a database last-seen clock, and
legacy admin CRUD/cache behavior remains uneven. T7 may use the T6 boundary only after the remaining
affected audits and task gates are current.

## 2. Scope, Freshness, and Predecessor Gate

This re-audit covers Express routes/controllers/middleware, sender and TTN trust boundaries,
Socket.IO acknowledgements, observation validation, canonical selection, Redis use, Operations/Trip
integration, errors/rate limits, operational signals, T6 publication/read behavior, and backend
test evidence. It is a source and test review, not a live-service, penetration, load, provider, or
physical-device test.

Discovery and Product are accepted at `847a18c...`; Architecture is current and validated at
`fa9441b...`, so the Backend predecessor gate passes. The previous Backend report was stale because
T6 changed `canonical-state.service.ts`, `tracking.service.ts`, `server.ts`, `routes/ingest.route.ts`,
`public.controller.ts`, the backend test layout, and the public canonical contract.

The freshness comparison from `847a18cce9bc27c82b2622dbc176b3a89bc4d037..HEAD` identified the T6
backend services/boundaries/tests and related task, roadmap, research, and decision documents as
relevant changed evidence. The owner-approved D-006 changes are present as uncommitted coordination
evidence; they narrow the T7 disposable/export boundary but do not alter current backend behavior or
count as T7 implementation evidence.

Validation performed:

- In `shuttle-tracking-backend`: `npm run check` — passed, including build, boundary suite, T6
  contract/realtime checks, and `npx prisma validate`.
- The focused T6 tests verify version ordering, public `sourceId` omission, one publication boundary,
  REST/Socket projection parity, stale transitions, frontend-facing contract guards, and no direct
  transport emission.
- No ambient database/Redis migration, seed, runtime smoke, provider, or hardware check was run.
  The isolated T6 runtime evidence remains bounded documented evidence only.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Trip and Socket.IO sender identity was weak | **Resolved** | Sender JWT claims bind source, vehicle, and credential version; HTTP/trip routes authenticate the sender; Socket.IO revalidates token, source status, vehicle binding, and credential version for every write. |
| Tracking-source/device abstraction was incomplete | **Resolved** | `TrackingSource` retains type, status, priority, credential lifecycle, assignment, and last-seen fields; canonical selection is source-aware and deterministic. |
| Trip lifecycle was only partially protected | **Resolved** | `operations.service.ts` owns start/virtual start/end/history invariants with vehicle row locks and idempotent behavior; T5 constraints and transaction checks remain in place. |
| REST/GPS validation and safe errors were inconsistent | **Partially Resolved** | Ingest, sender, feedback, trip, device, route-stop, and TTN boundaries use shared parsers/error codes. Legacy vehicle/route/stop CRUD still has untyped bodies and uneven error mapping. |
| Tracking-source ingestion needed authentication/rotation | **Resolved** | Active non-LoRaWAN sources require credentials; token claims carry credential version; rotation, reassignment, and deactivation invalidate old sender credentials. TTN uses a separate webhook secret. |
| Route-stop cache invalidation was missing | **Still Present** | `cache.service.ts` can delete route-stop keys, but route-stop create/delete controllers still do not call it. |
| Realtime broadcast could report an invalid result | **Resolved** | HTTP, Socket.IO, and TTN return the canonical envelope only when the shared process returns one; canonical socket emission is centralized and public projection omits `sourceId`. |
| Admin trip history/GPS playback reads were missing | **Still Present** | No protected trip/history/GPS-track read endpoint or bounded history query is mounted. |
| Automated backend tests were missing | **Partially Resolved** | Build, boundary, JWT, validation, device projection, Redis redaction, operational-signal, T5, and T6 artifacts exist. Repeatable service/controller integration, failure-injection, duplicate, stale, and provider-compatibility coverage remains limited. |
| Device responses exposed credential hashes | **Resolved** | Device projections omit `secretHash`, and the device boundary test verifies the redaction. |
| Observation ordering and retention semantics were undefined | **Partially Resolved** | T6 canonical events now use `(stateEpoch,stateVersion)` ordering and freshness states. Raw observations still use a backend timestamp, have no producer event time/sequence/idempotency/disposition/session identity, and have no retention implementation. |
| TTN source identity compatibility was uncertain | **Still Present** | The parser requires `end_device_ids.device_id`; no current adapter/test establishes compatibility with payloads identified only by another TTN identifier such as `dev_eui`. |
| Operational signals and CI gates were missing | **Partially Resolved** | CI, request IDs, allowlisted signals, source-health sweep, suppression, and redaction tests exist. Signals remain best-effort process logs, and malformed/oversized requests can fail before route-level ingestion context is registered. |
| Versioned canonical state and public freshness were incomplete | **Resolved** | T6 provides `CanonicalVehicleStateV1`, epoch/version allocation, route authority, explicit service states, stale refresh, one publisher, and REST/Socket projections. Redis remains transient and runtime failure behavior is still bounded. |

## 4. Transport and Trust-Boundary Review

| Boundary | Authentication and validation | Current result |
|---|---|---|
| Mobile / sender Socket.IO | Anonymous viewer connection is allowed; sender must have a JWT at handshake and is revalidated before every `send-location` write. Payload source/vehicle must match claims, rate limiting applies, and the sender receives an acknowledgement/error code. | Strong controlled-MVP boundary; no producer sequence, duplicate, stale-event, or reconnect replay contract. |
| ESP32 / sender HTTP | `/api/ingest/http` requires a source JWT, validates source ownership and coordinate range, applies sender rate limiting, and shares `processObservation`. | Appropriate convergence; retry/idempotency and physical client behavior are unverified. |
| LoRaWAN / TTN webhook | `/api/ingest/ttn` requires a configured bearer secret with timing-safe comparison, rate-limits IP and source, decodes accepted coordinate shapes, and enforces `lorawan` source type. | Correct server-side boundary; provider identity aliases and duplicate delivery semantics remain unverified. |
| Admin REST | JWT is required for mounted admin routes; the current claim model does not evidence separate operator/research roles. | Authentication boundary exists, but role/least-privilege policy and legacy CRUD validation remain incomplete. |

Coordinate validation bounds latitude/longitude and numeric speed, bearing, and accuracy, but
accuracy units and semantic kind are not preserved. `processObservation` verifies active source,
sender ownership/version, optional active-trip ownership, writes a latest source snapshot, selects
canonical state, and admits sampled history. Rejected observations do not overwrite canonical state;
lower-priority source snapshots remain source-local and only become canonical if selection later
allows them.

## 5. Canonical and Trip Processing

The current path is:

1. Parse/validate transport input and authenticate the sender or TTN webhook.
2. Load the active `TrackingSource` and verify source type, credential binding, vehicle binding, and
   optional active trip.
3. Store one latest source snapshot in Redis with a backend-generated timestamp and source type.
4. Read active sources in priority/id order and select the first snapshot no older than 30 seconds.
5. Normalize station state, attach vehicle/source/recorded time, invoke the canonical service, allocate
   an epoch/version atomically, and publish only if the stored state is still the latest version.
6. Use a 60-second Redis admission key before calling the transactional Operations/Trip service to
   create/reuse the active trip and insert a PostGIS canonical sample.
7. Return the canonical envelope to the sender and publish its public projection globally through the
   configured Socket.IO publisher.

T6 correctly places live publication before sampled-history persistence. A failed history transaction
is logged and signaled while live state remains available, which is acceptable for the controlled
MVP but must not be described as durable research evidence.

The canonical service also has a refresh path used by source-health and public reads. It repeats the
Redis snapshot selection logic rather than consuming one shared selection fact. The two paths use the
same current priority/id and freshness rules, but malformed snapshot handling and future event-time
semantics can drift; this is a new maintainability/reliability risk.

## 6. API, Error, and Abuse-Control Review

Shared parsers cover auth, feedback, device, route-stop, trip, ingest, and TTN payloads. They provide
bounded strings, UUID checks, coordinate ranges, numeric bounds, and explicit boundary error codes.
The global JSON body limit and Socket.IO buffer limit are bounded to at most 1 MiB by configuration
rules. Rate limits cover admin/sender login, feedback, sender observations/trips, admin device/
route-stop writes, and TTN IP/source traffic.

`BoundaryError`/`mapBoundaryError` provide safe response codes and redact error details from logs.
Prisma conflict/not-found/input errors are mapped in the common layer, but legacy vehicle/route/stop
controllers still often catch and map failures to generic 500 responses rather than using typed
request schemas. `clientAddress` intentionally does not trust forwarded headers until topology is
approved; proxy-aware rate-limit identity remains a deployment concern.

The backend still exposes no protected trip-history, source-health, raw-observation, research-session,
or bounded export API. Device analytics returns Redis selection counters under the authenticated admin
device router, but has no time window, pagination, experiment identity, or durable aggregation.

## 7. Reliability and Realtime Review

- `/ready` checks PostgreSQL and Redis; startup attaches the Redis Socket.IO adapter and starts the
  source-health sweep.
- Source health uses active status and database `lastSeenAt` with `never_seen`, `online`, `stale`, and
  `disabled` internal states. Canonical freshness uses Redis snapshot timestamps. A failed throttled
  `lastSeenAt` update can therefore make the health sweep stale while a Redis snapshot is still fresh;
  the two clocks are not one authoritative source-health fact.
- Source-health maps are process-local. Multiple backend processes can independently sweep and emit a
  transition; the Redis adapter does not provide distributed sweep ownership or deduplication.
- All-stale selection now produces a canonical `stale`/`no_service` state through the refresh path,
  rather than returning an old live public location. Redis loss itself cannot allocate/store the
  fallback state and has no durable reconciliation path.
- HTTP, Socket.IO, and TTN use the global `location-update` publisher. The Redis adapter supports
  multi-process fan-out but not durable replay, sequence ordering, rooms, or per-viewer filtering.
- There is no backend contract for duplicate TTN webhook delivery, raw late/out-of-order disposition,
  reconnect snapshot replay, or queryable persistence-failure outcomes.
- Operational logs intentionally exclude coordinates, request bodies, secrets, and arbitrary exception
  messages. This protects privacy but leaves no bounded evidence for explaining source disputes.

## 8. Current Backend Findings and Recommendations

### High — T7 raw diagnostics and protected research reads are absent

The latest source snapshot overwrites earlier observations. There is no durable producer event time,
sequence/idempotency key, raw disposition, experiment/session identity, research role middleware,
retention job, metric query, or CSV export. D-002/B, D-004, owner parameters, specialist briefs, and
D-006 define the future bounded design but do not constitute implementation evidence. T7 must remain
separate from T6 canonical state and must not alter public/realtime authority.

### Medium — Canonical selection is duplicated

Ingest selection lives in `tracking.service.ts`; public/source-health refresh selection lives in
`canonical-state.service.ts`. Consolidate the selector or formally expose one tested selection fact
before adding T7 raw dispositions, so accepted/fallback/stale semantics cannot diverge.

### Medium — Source-health and canonical freshness have different clocks

`lastSeenAt` is throttled and persisted to PostgreSQL, while canonical freshness uses a Redis snapshot
timestamp. Define one operational contract for a failed database last-seen update, Redis snapshot TTL,
and recovery before daily operations or failover claims.

### Medium — Legacy admin boundaries remain uneven

Vehicle/route/stop CRUD still lacks the newer typed validation and consistent cache/error behavior.
Keep these out of T7's raw-research allowlist; address them through the bounded route/cache/security
tasks rather than silently broadening T7.

### Medium — Operational read surfaces are missing

Protected trip/history, source-health, exception, and research reads are absent. T7 may add only the
approved protected research routes in its exact task allowlist; it must not become a general admin
operations/read-model task.

### Low — TTN identity compatibility and duplicate delivery remain unverified

Keep the current server-side TTN boundary and record provider/device identity facts separately. Do not
infer gateway retries, `dev_eui` mapping, or provider delivery guarantees from the parser alone.

## 9. Roadmap and Decision Impact

T6 is revalidated at the backend boundary. T7 remains the next research implementation candidate,
but its Level 3 intake must wait for the remaining affected/cited audit freshness gates and the exact
D-006 disposable target record. T7 must preserve T6 state epochs/versions, `location-update`, T5
history semantics, and public redaction. T8 remains a separate truthful-consumer task; route-stop
cache work remains outside T7.

Approved D-001 through D-006 remain unchanged. No new owner decision is proposed by this report.

## 10. Assumptions, Unknowns, and Confidence

- No running backend, PostgreSQL/Redis target, mobile app, ESP32 firmware, TTN account, gateway, or
  production proxy was observed in this re-audit.
- Simulator and checked-in integration artifacts validate repository paths, not field transport
  behavior. Isolated T6 runtime evidence is documented but was not repeated against ambient state.
- TTN identity aliases, webhook duplicate delivery, device clocks, sequence guarantees, retry policy,
  Redis recovery, and multi-process sweep behavior remain unknown.
- Confidence is **High** for repository-visible middleware, source ownership, service boundaries,
  T6 contract, and test artifacts; **Medium** for runtime reliability and integration; **Low** for
  provider/physical behavior.

## 11. Audit Limitations and Handoff

No application code, schema, deployment, retention policy, or owner decision was changed by this
report. Backend is now **Complete / Validated** at `fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd` with
Discovery, Product, and Architecture predecessor baselines recorded above. The next selected profile
is **Frontend**; Database remains a separate required re-audit before Infrastructure & Device and T7
can consume its report as current.
