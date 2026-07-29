# Architecture Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/audits/README.md`, `docs/audits/product-audit.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/research/T7-owner-input-questionnaire.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/roadmap/master-refactoring-roadmap.md`, `docs/tasks/T6-canonical-vehicle-state.md`, `docs/audits/specialized/T6-backend-realtime-canonical-vehicle-state.md`, `README.md`, `docker-compose.yml`, `docker-compose.prod.yml`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/routes/ingest.route.ts`, `shuttle-tracking-backend/src/controllers/public.controller.ts`, `shuttle-tracking-backend/src/controllers/routeStops.controller.ts`, `shuttle-tracking-backend/src/services/canonical-state.service.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/services/operations.service.ts`, `shuttle-tracking-backend/src/services/cache.service.ts`, `shuttle-tracking-backend/src/services/operational-signals.ts`, `shuttle-tracking-backend/src/config/redis.ts`, `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/tests/test_t5_operations.js`, `shuttle-tracking-backend/tests/test_t6_canonical_state.js`, `shuttle-tracking-backend/tests/test_t6_realtime.js`, `shuttle-tracking-backend/tests/test_pipeline.js`, `shuttle-tracking-backend/tests/test_socket_boundary.js`, `shuttle-tracking-web/types/canonical-state.ts`, `shuttle-tracking-web/types/index.ts`, `shuttle-tracking-web/services/publicApi.ts`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/hooks/useShuttleTracker.ts`, `shuttle-tracking-web/hooks/useSocketConnection.ts`, `shuttle-tracking-web/hooks/useVehicleTracking.ts`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/utils/ShuttleHelpers.ts`, and the related frontend layout/style files changed by T6.
- Reviewed at: `2026-07-29T10:48:53+07:00`
- Validation state: `Validated`
- Predecessor baselines: `docs/project-knowledge-base.md @ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`; `docs/audits/product-audit.md @ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Previous report evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Legacy report commit: `f0bd2e7`

## 1. Executive Summary

The T6 implementation materially improves the architecture for the approved controlled demonstration
scope D-001=A. Canonical vehicle state is now a backend-owned versioned envelope with an epoch and
per-vehicle version, explicit `live`/`stale`/`no_service`/`unknown` states, server-owned route
authority, a single Socket.IO publication boundary, and a matching public REST projection. The
frontend seeds from REST, rejects older state versions, uses canonical route identity, expires live
markers locally, and the admin map exposes connection and service-state summaries.

The monolith, PostgreSQL/PostGIS, Redis, and Socket.IO remain proportionate for the controlled MVP.
T6 does not make Redis durable, add raw research observations, establish producer event-time or
duplicate/late semantics, or prove deployment/provider/device behavior. The public surface remains
intentionally neutral: it shows a live count and applies state/ETA guards, while detailed connection
and source-health state remains an admin/operations concern.

The remaining architectural blockers are bounded raw/event evidence for T7, explicit Redis
degradation/recovery guarantees, duplicated source-selection logic between tracking and canonical
refresh paths, route-stop cache ownership, and unmeasured global realtime fan-out. D-006 now narrows
the approved disposable T7 target and default export controls; it does not make T7 storage or reads
implemented. These remain roadmap constraints; this report authorizes no implementation or
release-scope change.

## 2. Scope, Freshness, and Predecessor Gate

This re-audit covers module ownership, the three ingestion boundaries, normalization and canonical
selection, route authority, current-state persistence, sampled history, REST/realtime delivery,
public/admin consumers, source-health transitions, cache boundaries, temporal semantics, and scale
posture. It does not certify a deployed environment, physical device, TTN account, browser session,
production security boundary, or measured load target.

Discovery and Product were the accepted predecessor reports at the recorded `847a18c...` baseline,
so the Architecture predecessor gate is satisfied for this selected re-audit. The previous
Architecture report was stale because T6 changed the canonical state, ingest/public boundaries,
frontend consumers, and the related acceptance evidence.

The freshness comparison
`git diff --name-only 847a18cce9bc27c82b2622dbc176b3a89bc4d037..HEAD` identified these relevant
changes and reasons:

| Changed evidence | Why it can affect Architecture findings |
|---|---|
| `shuttle-tracking-backend/src/services/canonical-state.service.ts`, `tracking.service.ts`, `operations.service.ts`, `server.ts`, `routes/ingest.route.ts`, `controllers/public.controller.ts` | Changes canonical ownership, versioning, route authority, stale transitions, public reads, transport convergence, and history ordering. |
| `shuttle-tracking-backend/tests/test_t6_canonical_state.js`, `test_t6_realtime.js`, relocated boundary tests, and updated pipeline assertions | Adds repository-visible contract and boundary evidence; stateful runtime claims remain limited to the documented isolated target. |
| `shuttle-tracking-web/types/canonical-state.ts`, `publicApi.ts`, `ShuttleTracker.tsx`, `useShuttleTracker.ts`, `useSocketConnection.ts`, `useVehicleTracking.ts`, and `admin/LiveMap.tsx` | Changes consumer authority, initial snapshot hydration, version filtering, local expiry, ETA eligibility, and admin state presentation. |
| `docs/tasks/T6-canonical-vehicle-state.md`, T6 specialist brief, `docs/testing/pipeline-smoke-tests.md`, roadmap, and `docs/decision-queue.md` | Changes the approved T6 contract, validation evidence, and D-005 stale-trip policy. |
| T7 owner-input, specialist/task documents, and the owner-approved D-006 change | Records 90-day receive-time retention, isolated disposable validation, safer bounded default exports, and break-glass controls; it does not implement raw storage or research reads. |

Validation performed during this re-audit:

- In `shuttle-tracking-backend`: `npm run test:t6` — passed.
- In `shuttle-tracking-web`: `npm run lint` — passed with two warnings and no errors.
- In `shuttle-tracking-web`: `npx tsc --noEmit` — passed.
- `git diff --check` — passed.
- The repository records a completed isolated `t6-disposable` migration/seed, REST/Socket parity,
  stale/recovery, dependency-failure, and owner-confirmed public rendering verification. That
  documented evidence was not rerun against an ambient target during this audit.
- D-006 is present as an owner-approved, uncommitted coordination change while this report is being
  reviewed. It is treated as scope/decision evidence only; it does not count as T7 implementation
  evidence or change the T6 canonical-state findings.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Vehicle and source identity were conflated | **Resolved** | `TrackingSource` remains a separate registry entity with source type, vehicle binding, priority, credential version, status, and `GPSTrack.sourceId`; the canonical envelope carries source type without exposing internal source identity publicly. |
| Source health/failover was not operational | **Partially Resolved** | The source-health sweep now publishes vehicle transitions and recovery through the canonical service, and selection exposes canonical/fallback reason codes. Source-health maps remain process-local, multi-process sweep coordination is not evidenced, and public source-health detail is intentionally absent. |
| Canonical state was Redis-only | **Partially Resolved** | Redis now stores a versioned, explicit canonical state rather than an untyped location. It is still the transient current-state authority; PostgreSQL retains sampled canonical history, not a durable current-state or event log. |
| Realtime delivery was global | **Still Present** | Publication is centralized but still uses `io.emit('location-update', ...)` globally. No room strategy, replay, capacity threshold, or fan-out measurement is evidenced. |
| Frontend owned route and ETA intelligence | **Partially Resolved** | Route identity and authority now come from the backend and the selected UI route cannot assign a vehicle. Geometry, route-position inference, next-stop calculation, and ETA remain frontend presentation logic. |
| Trip lifecycle lacked one owner | **Resolved** | T5 `operations.service.ts` still owns explicit/virtual start, active-trip validation, idempotent end, vehicle-state repair, and sampled history transaction behavior. T6 preserves this boundary. |
| Route-stop architecture was incomplete | **Still Present** | Ordered route-stop data and APIs exist, but route-stop create/delete still do not invoke the shared public-cache invalidation service, and the public route-stop query does not enforce active route status. |
| Raw observations and event ordering were unspecified | **Partially Resolved** | Canonical public events now use `(stateEpoch, stateVersion)` ordering and reject older client state. Raw observations still overwrite a Redis latest snapshot; `observedAt` is nullable, producer event time/sequence/deduplication/disposition/session identity are not durable, and T7 is not implemented. |
| Redis degradation was not an explicit state transition | **Partially Resolved** | `unknown` and `DEPENDENCY_UNAVAILABLE` exist for state evaluation failures, but Redis is required to allocate/store canonical state and no durable degraded-live/reconciliation path is evidenced when Redis itself fails. |

## 4. Current Architecture and Ownership

- The backend remains one Express process with REST and Socket.IO. It serves public reads,
  authenticated admin CRUD, sender trip routes, HTTP ingestion, and TTN webhook ingestion.
- PostgreSQL/PostGIS owns users, routes/stops, vehicles, trips, sampled `GPSTrack` history,
  tracking-source registry, feedback, and admin users. T5 remains the lifecycle owner.
- Redis owns public caches, latest source snapshots, versioned canonical current state, sampling
  admission, source-selection counters, rate limits, and Socket.IO adapter coordination. The
  versioned state is explicit but transient.
- `tracking.service.ts` validates source ownership, writes the latest source snapshot, selects a
  fresh source by priority/id, invokes the canonical publisher, and persists sampled history after
  live publication. `canonical-state.service.ts` owns the envelope, freshness transitions,
  epoch/version allocation, projections, and publication guard.
- `operations.service.ts` resolves active-trip route authority first, then vehicle assignment, then
  `unknown`. The selected UI route is not used to populate the canonical route.
- The public tracker consumes canonical state and keeps route geometry/ETA as presentation logic.
  The admin `LiveMap` consumes the initial REST snapshot and the same `location-update` envelope,
  while rendering connection and vehicle service-state summaries.
- TTN remains a server-side webhook boundary. Mobile, ESP32, gateway, TTN, firmware, device clocks,
  and physical delivery behavior remain external or unverified.

## 5. Source-to-State Data Flow

| Source | Acquisition/authentication | Shared transport and state path | Unverified boundary |
|---|---|---|---|
| Mobile | Phone GPS; sender JWT bound to source, vehicle, and credential version | Authenticated Socket.IO `send-location` → shared validation/`processObservation` → Redis source snapshot → priority/freshness selection → canonical state → REST/Socket.IO → sampled `GPSTrack` | No supported mobile application, producer clock, retry, or field runtime |
| ESP32 | GPS module over Wi-Fi under the approved research definition | Authenticated HTTP `/api/ingest/http` → same normalized observation/canonical service/history path | No firmware, provisioning, retry, or physical runtime |
| LoRaWAN | Separate device → gateway → TTN → webhook | Authenticated `/api/ingest/ttn` → TTN decode and source-type check → same canonical service/history path | No TTN application, gateway, codec, coverage, provider delivery, or recovery evidence |
| Simulator | Checked-in test tool only | Exercises the same server boundaries; it is not a fourth research source | Cannot prove device, radio, provider, clock, battery, or field behavior |

Only accepted canonical state is published. `canonicalLocation`, where retained in acknowledgements,
is the same versioned object as `canonicalState`, not a second semantic payload.

## 6. Data Products and Authority

| Product | Current authority | Architectural result |
|---|---|---|
| Latest source snapshot | Redis `source:last_location:<sourceId>` | Transient latest value; no raw history, event disposition, or research retention. |
| Canonical current vehicle state | Redis `canonical:state:vehicle:<vehicleId>` plus version namespace | Explicit T6 contract with public projection, freshness, route authority, and monotonic state identity; not durable across Redis loss. |
| Sampled trip history | PostgreSQL/PostGIS `GPSTrack` through T5 operations/history service | Durable sampled canonical history; not a raw source comparison or event stream. |
| Public/admin live read | Canonical service → typed REST/Socket.IO projection | Public omits `sourceId` and raw payload; admin uses the same semantic state with operational summaries. |
| Research diagnostics | Not implemented; T7 task/specification only | D-002=B/D-004 do not yet create raw facts, export, or a research read model. |
| Route/stop projections | PostgreSQL plus Redis public caches | Ordered route-stop data exists, but mutation invalidation and active-route semantics remain incomplete. |

## 7. Temporal and Realtime Semantics

- `timing.receivedAt` is a backend-derived timestamp used as the freshness clock; `selectedAt`
  records canonical publication time; `observedAt` remains `null` until a source adapter supplies a
  producer event time. The system must not call receive-to-display time device or network latency.
- A live state is fresh only within the 30-second threshold. Source silence creates a single stale
  or no-service transition through the sweep; a recovery creates a new canonical state. A stale
  marker is last-known only and is not eligible for current ETA.
- Redis-backed epoch/version state lets clients ignore older events in the same epoch and reset
  comparison on a new epoch. It does not establish raw duplicate/late disposition or durable replay.
- The REST active-vehicle read returns the canonical public state and refreshes stale live values.
  This preserves the freshness contract but means an initial/read path can evaluate and publish a
  state transition; that side effect should remain documented if more read consumers are added.
- The public and admin clients use the same canonical route/state fields. The public presentation
  intentionally exposes only the live count and marker/ETA behavior; it does not expose detailed
  connection or source-health labels. Viewer transport state remains conceptually separate from
  vehicle service state.
- The Redis adapter enables process fan-out, but it does not provide ordering, replay, or distributed
  sweep coordination. No capacity or render-pressure measurement is available.

## 8. Architecture Strengths

1. The monolith and current Redis/PostgreSQL split remain proportionate to D-001=A; no evidence
   requires a microservice, broker, or time-series split.
2. Mobile/Socket.IO, ESP32/HTTP, and LoRaWAN/TTN converge on one source-aware observation path.
3. Source identity, vehicle binding, priority, credential version, and source type provide a sound
   extension point for the three approved input classes.
4. T5 keeps trip lifecycle and sampled history invariants transactional and idempotent.
5. T6 establishes one canonical public/admin state vocabulary, route authority, freshness policy,
   state ordering, and safe projection boundary.
6. Public consumers remain canonical-only and do not receive raw source payloads or credentials.

## 9. Architecture Risks and Recommendations

### High — Canonical state remains transient

T6 makes the Redis current-state contract explicit and versioned, but Redis still owns the only
current read model and version namespace. Redis loss can prevent state allocation and publication;
there is no durable current-state replay or reconciliation path. Keep D-001=A bounded, define the
degraded behavior in a future operations/deployment task, and do not present Redis state as durable
research evidence.

### High — Raw diagnostics and event-time evidence remain absent

The latest source snapshot overwrites earlier observations. There is no durable producer event time,
sequence/deduplication identity, raw disposition, experiment/session key, or bounded research read.
T7 owner parameters, D-006, and task specifications define a future protected boundary, but they do
not constitute implementation or field evidence. Keep raw research data separate from canonical
state, sampled trip history, and public projections.

### Medium — Source-health transitions are process-local

The sweep publishes useful stale/recovery states, but its maps are in-process and every backend
process can run its own sweep. Duplicate transitions, multi-process coordination, and recovery
reconciliation are not tested. Add a distributed sweep/transition policy only when deployment and
operational requirements justify it; do not claim failover correctness from the current adapter.

### Medium — Public truthfulness is improved but intentionally not fully operational

The public tracker uses backend route authority, suppresses ETA for non-live state, removes or dims
markers according to state, and keeps the live count neutral. It still does not expose viewer
connection/reconnect or detailed stale/no-service wording; the admin map does. This is consistent
with D-005 and D-001=A, but daily operations requires a protected exception surface and a deliberate
public wording decision.

### Medium — Source selection logic exists in two paths

`tracking.service.ts` selects the source during ingestion while `canonical-state.service.ts`
repeats source-snapshot selection during freshness refresh. Both currently use priority/id and the
same 30-second window, but independent logic can drift in fallback, malformed-snapshot, or future
event-time behavior. Consolidate the selection fact or make one service the explicit selector before
adding T7 dispositions.

### Medium — Route-stop cache ownership is incomplete

The cache service can invalidate public route data, but route-stop mutations do not call it and the
public route-stop query does not enforce active route status. Keep mutation, ordered-route semantics,
and cache invalidation in one bounded T10 boundary.

### Low — Global broadcast has a scale trigger

Global `location-update` fan-out is acceptable for the controlled small-fleet target. Measure
connection count, update rate, payload size, Redis operations, and client render pressure before
introducing rooms, replay, or a broker.

## 10. Journey and Consumer Boundary Review

| Consumer | Current path | Architecture result |
|---|---|---|
| Public rider | Canonical REST snapshot + unauthenticated Socket.IO + client map/ETA projection | Canonical route/state authority is correct; public status remains deliberately neutral and not a daily-service guarantee. |
| Admin/operator | Authenticated CRUD + canonical REST/Socket.IO LiveMap | State and connection summaries exist; source-health exceptions, trip history, feedback triage, and route-stop operations remain absent. |
| Sender/device | Sender JWT for Socket.IO/HTTP; TTN webhook secret | Transport boundaries converge and ownership checks remain strong; device retry/clock/provider behavior is unknown. |
| Developer/researcher | Simulators, source-selection counters, operational signals | No raw evidence store, protected research query, export, or metric read model is implemented. |
| External provider | TTN webhook into server-side decoder | Correct placement is evidenced in code; provider account, gateway, codec, delivery, and recovery are unverified. |

## 11. Scalability and Maintainability

For roughly ten vehicles and 1–3 second source inputs, the monolith plus Redis is still a
proportionate design assessment, not a measured capacity claim. The first measurements at a higher
target should cover canonical selection queries, Redis atomic allocation, source-health sweeps,
Socket.IO fan-out, frontend marker/render cost, and sampled-history writes.

The highest maintainability payoff is to keep one canonical state contract and one source-selection
fact while separating raw research evidence from public state. A service split or broker would not
resolve the remaining semantic gaps without runtime evidence.

## 12. Actionable Architecture Handoffs

| Capability | Measurable outcome | Primary owner | Acceptance signal | Stage |
|---|---|---|---|---|
| Durable degraded-live behavior | Redis loss/recovery produces a documented safe state and reconciliation outcome | Backend + Infrastructure | Isolated failure/recovery test with no false durable-history claim | Future operations/deployment work |
| Bounded research diagnostics | Approved Mobile/ESP32/LoRaWAN facts have separate timestamps, dispositions, retention, and protected reads | Backend + Database + Research | T7 contract, retention, metric, export, and canonical-isolation tests | T7; implementation gate remains separate |
| One source-selection fact | Ingest and freshness refresh use one tested selector and identical fallback semantics | Backend | Unit/contract tests cover priority, malformed/stale snapshots, fallback, and recovery | Follow-up to T6/T7 boundary |
| Truthful operational consumers | Admin can inspect stale/silent vehicles and active-trip exceptions without conflating stale with trip completion | Backend + Dashboard/UX | Protected exception/read workflow under D-005 | T11 / future daily scope |
| Route-stop projection integrity | Route-stop writes invalidate affected public projections and enforce active route/stop semantics | Backend + Frontend | Mutation-to-public-read test observes new ordered stops | T10 |
| Measured realtime scale | Fan-out/render measurements establish a room/broker trigger | Infrastructure + Backend + Frontend | Repeatable load and reconnect evidence | T14 / evidence-triggered |

These are handoffs and acceptance signals, not implementation authorization. No new Level 2
consultation is required for this re-audit; T6 and T7 specialist briefs remain the immutable
focused decisions for their respective boundaries.

## 13. Roadmap and Decision Impact

T6 is revalidated as an architectural boundary at the current evidence baseline. T7 remains a
separate bounded research implementation with owner parameters and D-006 safer controls recorded on
2026-07-29; its raw storage, retention execution, access, metric, and export behavior must not be
inferred from T6 or from the task specification alone.

Approved decisions remain unchanged: D-001=A controlled demonstration, D-002=B bounded raw
diagnostics, D-003=A topology/origin dependency order, D-004 three-device research boundaries and
Dev Dashboard scope, D-005 separate stale observability from Trip closure, and D-006 safer T7
disposable/export controls. No new owner decision is proposed by this report.

After this Architecture re-audit, Backend, Frontend, and Database are the next parallel-eligible
Level 1 profiles under the predecessor table. Their reports must each perform their own freshness
comparison and revalidate all material T6 findings before Infrastructure & Device, Dashboard & UX,
Security/DevOps/Observability, Production Readiness, or Roadmap is consumed as current.

## 14. Assumptions, Unknowns, and Confidence

- No mobile app, ESP32 firmware/GPS module, TTN account, gateway, deployed provider, production
  browser session, or field runtime was treated as evidence in this review.
- The documented isolated T6 runtime and owner-confirmed browser checks are accepted as recorded
  repository evidence; they were not repeated against an ambient target during this audit.
- Producer clock quality, event-time delivery, sequence guarantees, retries, provider delivery,
  multi-process sweep behavior, and capacity remain unknown.
- Route distance remains a conformance proxy and device-reported accuracy remains uncertainty; no
  absolute accuracy claim is made.

Confidence is **High** for repository-visible ownership, contract shape, consumer boundaries, and
the T6 finding dispositions. Confidence is **Medium** for concurrent Redis/process behavior and
runtime freshness because the documented disposable evidence is bounded. Confidence is **Low** for
provider, physical-device, deployment, and real-world rider/operator outcomes.

## 15. Audit Limitations and Handoff

This report does not change application code, schema, deployment, retention policy, or release scope.
It validates the Architecture profile only. Architecture is now **Complete / Validated** at
`fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd` with the recorded Discovery and Product predecessor
baselines. The next eligible profiles are Backend, Frontend, and Database in parallel; downstream
profiles remain gated until their current predecessor and freshness checks pass.
