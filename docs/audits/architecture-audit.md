# Architecture Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/roadmap/master-refactoring-roadmap.md`, `README.md`, `docker-compose.yml`, `docker-compose.prod.yml`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/services/operations.service.ts`, `shuttle-tracking-backend/src/services/cache.service.ts`, `shuttle-tracking-backend/src/services/operational-signals.ts`, `shuttle-tracking-backend/src/config/redis.ts`, `shuttle-tracking-backend/src/routes/ingest.route.ts`, `shuttle-tracking-backend/src/controllers/public.controller.ts`, `shuttle-tracking-backend/src/controllers/devices.controller.ts`, `shuttle-tracking-backend/src/controllers/routeStops.controller.ts`, `shuttle-tracking-backend/src/controllers/trips.controller.ts`, `shuttle-tracking-backend/src/middleware/auth.ts`, `shuttle-tracking-backend/src/middleware/validation.ts`, `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/prisma/migrations/20260722120000_transactional_trip_lifecycle/migration.sql`, `shuttle-tracking-backend/test_pipeline.js`, `shuttle-tracking-backend/test_t5_operations.js`, `shuttle-tracking-backend/test_socket_boundary.js`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/services/api.ts`, `shuttle-tracking-web/services/publicApi.ts`, and `shuttle-tracking-web/next.config.ts`.
- Reviewed at: `2026-07-22T20:55:32+07:00`
- Validation state: **Validated**
- Predecessor baselines: Discovery and Product, both `@ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Legacy report commit: `f0bd2e7`

## 1. Executive Summary

The Express/Socket.IO monolith, Next.js client, PostgreSQL/PostGIS, and Redis remain an appropriate architecture for the approved controlled demonstration scope D-001=A. The repository now has a distinct tracking-source registry, three converging ingest boundaries, deterministic source selection, redacted operational signals, and a transactional Operations/Trip service from T5.

The main architectural risk is still the meaning of live state. The backend stores latest source and canonical locations in Redis, but it does not preserve event time, sequence, schema version, experiment/session identity, or a durable raw observation. A stale source is detected internally, yet the public active-vehicle read can return an old Redis location and the realtime clients receive no explicit stale/offline transition. The public client also supplies route association, ETA, and next-stop calculations when the event does not contain authoritative route identity.

These gaps do not require a service split for the current MVP. They do require the versioned canonical-state contract in current roadmap T6 before daily operations, map truthfulness, or D-002/D-004 research claims are implemented.

## 2. Scope, Freshness, and Predecessor Gate

This review covers module ownership, source acquisition and authentication, transport convergence, normalization, canonical selection, persistence, realtime delivery, client read behavior, data-product authority, and scale/maintainability posture. It does not certify a deployment, physical device, TTN account, browser session, or measured load target.

Discovery and Product are Complete and Validated at the same evidence baseline, so the Architecture predecessor gate passes. The prior Architecture report was stale: it predated T5 and used superseded decision/roadmap numbering. Changes since that report include the T5 transactional lifecycle boundary, source lifecycle/credential rules, the current public/admin clients, the three-device research scope, simulator/test alignment, and the approved D-001–D-004 decisions. Current uncommitted changes are audit documentation only and do not alter application behavior.

## 3. Prior-Finding Revalidation

| Prior finding | State | Current evidence and implication |
|---|---|---|
| Vehicle and source identity were conflated | **Resolved** | `TrackingSource` is a separate registry entity with type, credential version, vehicle binding, priority, status, and last-seen data; `GPSTrack` retains `sourceId`. |
| Source health/failover was not operational | **Partially Resolved** | Source health sweep, 30-second freshness, priority selection, recovery signals, and source ownership checks exist. Health is process-local and no public/admin state contract or explicit failover reason is exposed. |
| Canonical state was Redis-only | **Still Present** | `vehicle:current_location:<vehicleId>` is the current-state authority. PostgreSQL stores sampled canonical `gps_tracks`, not the current read model or all source observations. |
| Realtime delivery was global | **Still Present** | Every canonical update uses `io.emit('location-update', ...)`. The Redis adapter supports multiple Node processes, but there are no vehicle/route/viewer rooms or measured capacity thresholds. |
| Frontend owned ETA and route intelligence | **Still Present** | `ShuttleTracker` loads geometry and route stops, calculates ETA/next stop locally, and falls back to the selected route when an update lacks a local vehicle-route mapping. |
| Trip lifecycle lacked one owner | **Resolved** | `operations.service.ts` owns explicit start, virtual-trip creation, active-trip validation, idempotent end, vehicle state repair, and sampled history writes; T5 uses a vehicle row lock and database constraints. |
| Route-stop architecture was incomplete | **Partially Resolved** | Ordered `RouteStop` data and admin APIs exist, but product UI is absent. Route-stop create/delete does not call the shared public-cache invalidation service, so the architecture still has a mutation/read-cache contract gap. |
| Raw observation and event ordering were unspecified | **Still Present** | Latest snapshots use backend `Date.now()` and sampled history uses that timestamp. No event timestamp, receive/processing separation, sequence/deduplication, payload schema version, raw durable record, or experiment/session key exists. |

## 4. Current Architecture and Ownership

- The backend is one Express process with REST and Socket.IO. It mounts public reads, authenticated admin CRUD, sender trip routes, HTTP ingest, and TTN webhook ingest.
- PostgreSQL/PostGIS owns users, route/stop master data, vehicle/source registry, trips, sampled GPS history, and feedback. The T5 migration adds trip status/time checks while preserving the partial unique active-trip-per-vehicle index.
- Redis owns public response caches, latest source snapshots, current canonical locations, sampling admission keys, source-selection counters, rate-limit state, and Socket.IO adapter pub/sub. Redis loss is logged, but current-state loss is not converted to a durable degraded-state event.
- `tracking.service.ts` owns coordinate validation, source lookup/credential binding, source snapshot update, priority/freshness selection, canonical normalization, selection counters, operational signals, and admission to sampled history.
- `operations.service.ts` owns the transactional trip/history invariants. It is the lifecycle owner after T5, although tracking still decides when an observation enters the sampling path.
- The public tracker owns route geometry acquisition (OSRM, local storage, bundled fallback), route rendering, route-position inference, ETA, and next-stop calculation. The admin live map consumes global Socket.IO updates and has no initial REST snapshot or connection/freshness state.
- TTN remains a server-side webhook boundary; it must not bypass source registry and canonical selection. Physical mobile, ESP32, gateway, and provider runtime behavior was not observed.

## 5. Source-to-State Data Flow

| Source | Acquisition/authentication | Transport and normalization | State products and delivery | Unverified boundary |
|---|---|---|---|---|
| Mobile | Phone GPS; sender JWT bound to source, vehicle, and credential version | Authenticated Socket.IO `send-location`; token revalidated per write; shared `processObservation` | Latest source snapshot in Redis → priority/freshness canonical selection → sampled `gps_tracks` → global `location-update` and public/admin reads | No supported mobile app or clock/sequence contract |
| ESP32 | GPS module over Wi-Fi according to approved research scope | Authenticated HTTP `/api/ingest/http`; shared validation and `processObservation` | Same Redis/canonical/history/realtime path | No firmware, provisioning, retry, or field runtime |
| LoRaWAN | Device → gateway → TTN; webhook secret required | Authenticated `/api/ingest/ttn`; TTN payload decoded into the same observation shape; `lorawan` type enforced | Same Redis/canonical/history/realtime path | No TTN application, gateway, coverage, codec, or provider delivery evidence |
| Simulator | Repository scripts and seed-aligned fixtures | HTTP, Socket.IO, and TTN test paths | Validates boundary convergence only | Cannot prove physical device, radio, provider, clock, battery, or coverage behavior |

The shared path is a useful MVP boundary: transport-specific authentication and decoding happen before one source-aware observation pipeline. However, the normalized observation currently contains only source ID, coordinates, optional speed/bearing/accuracy/station, and optional trip ID. It has no producer event time, client clock quality, sequence, deduplication key, payload/schema version, or research session identity.

## 6. Data Products and Authority

| Product | Current authority | Retention/fidelity | Architecture assessment |
|---|---|---|---|
| Master data and ownership | PostgreSQL/PostGIS | Durable relational records | Appropriate authority for routes, stops, vehicles, sources, trips, and permissions. |
| Latest source observation | Redis `source:last_location:*` | Latest only; no durable raw record and no explicit TTL | Suitable as a transient selection input, not as research or incident evidence. |
| Current canonical vehicle location | Redis `vehicle:current_location:*` | Latest only; freshness is checked during selection but not consistently on public reads | Needs a versioned state contract and an explicit stale/offline representation. |
| Canonical trip history | PostgreSQL/PostGIS `gps_tracks` | Sampled at most once per 60 seconds through Redis admission | Durable and transactionally linked to an active trip, but not a high-fidelity event stream. |
| Source-selection analytics | Redis hashes | Aggregate counters; no durable time window or experiment key | Useful diagnostic counter, insufficient for D-004 historical comparison/export. |
| Operational signals | Process logs with allowlisted JSON fields | Best-effort, cooldown-suppressed, no repository-backed event store | Good boundary telemetry; not a queryable audit/event history. |
| Public/API/realtime read | Redis-backed REST plus global Socket.IO | Canonical-only to public consumers; no raw exposure | Appropriate privacy direction. Freshness and version semantics are incomplete. |
| Research/export read | None | No authenticated Dev Dashboard or bounded export | D-004 is a scope decision, not an implemented capability. |

The current design correctly keeps public consumers canonical-only and avoids exposing raw coordinates through the public API. D-002=B and D-004 now require bounded raw diagnostics for research, but retention, deletion owner, access role, clock semantics, and experiment parameters remain unresolved; implementation must not infer them from the approval alone.

## 7. Temporal and Realtime Semantics

The system currently has these observable times:

1. The backend assigns `Date.now()` while accepting the observation and stores it as the source snapshot timestamp.
2. `TrackingSource.lastSeenAt` is updated from the backend receive time, throttled to approximately ten seconds.
3. The canonical `recordedAt` is derived from the snapshot timestamp.
4. `gps_tracks.recorded_at` stores that canonical timestamp when the 60-second sampler admits a write.
5. The frontend displays the received object without a canonical version or freshness transition.

There is no separate producer event time, backend receive time, processing time, canonical-selection time, or client-display time. The 30-second freshness window is deterministic for selection, but an old Redis canonical value can still be returned by `getActiveVehicles` because that read does not repeat the freshness check. When all sources become stale, the backend emits an operational signal and returns `null` from selection; it does not publish a vehicle state transition for clients.

Socket.IO sender writes are authenticated and revalidated, but public viewers connect without credentials and receive the same global canonical stream. Neither public `ShuttleTracker` nor admin `LiveMap` subscribes to connection/error/reconnect state, and neither client gets a periodic server-side stale/offline update. The Redis adapter enables horizontal process fan-out, but it does not provide event ordering or durable replay.

## 8. Architecture Strengths

1. A conventional monolith is coherent for D-001=A and the stated small pilot; there is no evidence requiring microservices.
2. HTTP, Socket.IO, and TTN converge on one source-aware canonical-selection path after transport-specific boundary checks.
3. Source identity, vehicle binding, priority, credential version, and source type provide a sound extension point for three input classes.
4. T5 makes trip start/end/history writes transactional and idempotent, with deterministic locking and database constraints.
5. PostGIS and ordered `RouteStop` provide a durable spatial and route-order foundation.
6. Public routes expose canonical fields rather than raw source payloads, while admin device analytics remain authenticated.

## 9. Architecture Risks and Recommendations

### High — Canonical vehicle state is not an explicit, versioned operational contract

Selection returns a location or `null`, not a state machine containing freshness, availability, reason, version, route authority, and source metadata. Public initial reads can therefore show a Redis location older than the 30-second selection window, while live clients cannot distinguish no update, stale service, disconnected transport, or no service.

Define one backend-owned canonical vehicle-state contract before daily operations. At minimum it should carry a monotonic/versioned state identity, vehicle and authoritative route identity, source identity/type, event/receive/selection timestamps when available, freshness/availability, selection/failover reason, and explicit no-location states. Public and admin consumers may project the contract differently, but must not invent route authority or stale semantics.

### High — Raw diagnostics and event ordering are absent

The latest Redis snapshot overwrites earlier source observations. Rejected observations and lower-priority candidates are represented only by bounded logs/counters, and sampled canonical history cannot reconstruct source disagreement or delivery ordering. This blocks credible D-002/D-004 latency, duplicate, missing, failover, and accuracy analysis.

Add a bounded, authenticated research evidence boundary only after retention/deletion/access and clock/session parameters are recorded. Preserve source identity, producer payload/schema version, event and receive timestamps, sequence/deduplication data, trip/vehicle assignment at receipt, and transport metadata. Keep raw research records separate from public canonical state and sampled operational history.

### Medium — Temporal semantics cannot support latency or out-of-order claims

All current recorded timestamps are backend-derived, and selection is priority-first rather than event-time-aware. A delayed high-priority source can win over a newer lower-priority source while both are inside the freshness window, and clients cannot reject an older canonical event.

Document clock-quality and ordering rules as part of T6/T7. If a source cannot provide trustworthy event time or sequence, label that limitation rather than presenting receive-to-display latency as device latency.

### Medium — Route and ETA authority is duplicated in the public client

The client fetches route geometry, calculates ETA/next stop, and assigns an event to the selected route as a fallback when route mapping is absent. This is acceptable for the controlled MVP but creates divergent answers for future admin, research, or export consumers.

For T6/T8, make route identity and route-stop order part of the backend read contract. Keep client calculation temporarily if it is explicitly labeled as a presentation estimate and remains the only consumer. Do not add a distributed ETA service without a second-consumer or measured-scale trigger.

### Medium — Redis degradation is not an explicit state transition

Redis is used for current source/canonical state, sampling admission, rate limits, caches, and Socket.IO adapter coordination. Redis errors are signaled, but there is no durable degraded-live-state event, replay mechanism, or recovery reconciliation for current location. PostgreSQL retains only admitted canonical samples.

Define what the system guarantees when Redis is unavailable: whether ingest rejects, whether durable history can continue, how stale state is cleared, and how clients are notified. Treat Redis loss as a visible degraded state, not as silent disappearance of research evidence.

### Medium — Route-stop cache ownership is incomplete

The shared cache service can invalidate route-stop keys, but route-stop create/delete controllers do not call it. Public route-stop reads also filter active stops but do not enforce active-route status. This can expose a stale route-stop projection after an admin mutation.

Make route-stop mutation and cache invalidation one boundary, and define active-route/active-stop semantics in the API contract. This is a bounded correctness task, not a reason to split services.

### Low — Global broadcast has a scale trigger

Global `location-update` fan-out is reasonable for the controlled ten-vehicle target and the Redis adapter supports multiple backend processes. Measure connection count, update rate, payload size, and client render pressure before introducing route/viewer rooms or a broker. Larger history and research queries should use bounded database read models rather than the live broadcast path.

## 10. Journey and Consumer Boundary Review

| Consumer | Current path | Architecture result |
|---|---|---|
| Public rider | REST active routes/vehicles/stops + unauthenticated Socket.IO + client map/ETA | Canonical-only direction is right; stale/no-service and route authority are incomplete. |
| Admin/operator | Authenticated CRUD and a Socket.IO live map | Master-data boundary exists; operational state, trip history, device health, and feedback triage read models are absent. |
| Sender/device | Sender JWT for Socket.IO/HTTP; TTN webhook secret | Boundary convergence and ownership checks are strong; physical retry/clock/provider behavior is unknown. |
| Developer/researcher | Seed/simulators, source-selection counters, operational logs | Pipeline evidence exists; no authenticated Dev Dashboard, raw evidence store, history filters, or bounded export. |
| External provider | TTN webhook into server-side decoder | Correct placement; deployment, payload codec, coverage, and provider delivery guarantees remain unverified. |

## 11. Scalability and Maintainability

For roughly ten vehicles and 1–3 second source inputs, the monolith plus Redis is a proportionate starting point. No load test or deployed runtime evidence was observed, so this is a design assessment, not a capacity claim. At higher load, the first measurements should cover canonical selection database reads, Redis operations, Socket.IO fan-out, frontend render cost, and history insert volume.

The highest maintainability payoff is a small shared canonical/operations contract and explicit data-product boundaries. A repository abstraction, microservice split, or broker would not fix the current semantic gaps and would add coordination cost before the pilot supplies evidence.

## 12. Actionable Architecture Handoffs

| Capability | Measurable outcome | Primary owner | Acceptance signal | Privacy/data boundary | Stage |
|---|---|---|---|---|---|
| Versioned canonical vehicle state | Every public/admin location or no-location response has a monotonic version, freshness/availability, route identity, source, and reason | Backend + Frontend | T6 contract tests prove stale, failover, out-of-order, and reconnect projections | Public receives canonical projection only | Phase 2 / T6 |
| Truthful map consumers | Clients never display a location past the documented freshness policy without an explicit stale label | Frontend + Backend | Browser/runtime smoke evidence covers initial read, stale transition, reconnect, and route filtering | No raw source payloads in public client | Phase 2 / T8 |
| Bounded research diagnostics | Approved three-source sessions can query raw/accepted/rejected/duplicate facts with timestamps and schema | Database + Backend + Research | Authenticated bounded query/export test and deletion/retention test | Research role, redaction, retention, and export bounds required | Phase 2 / T7, T15 |
| Route-stop projection integrity | Route-stop writes invalidate all affected public projections and enforce active route/stop semantics | Backend + Frontend | Mutation-to-public-read test observes new ordered stops | Operational master data only | Phase 3 / T10 |
| Operations/history read model | Operators can query trip state and sampled history from PostgreSQL with one lifecycle vocabulary | Backend + Database + Dashboard | Transactional start/end/history tests plus authenticated read test | Admin role and retention policy | Phase 3 / T11 |
| Measured realtime scale | Update rate, fan-out, reconnect, and render metrics establish a room/broker trigger | Infrastructure + Backend + Frontend | Repeatable load evidence at pilot and next target | Aggregate telemetry; no raw coordinates in logs | Phase 4 / T14 |

These are handoffs and acceptance signals, not implementation authorization. Level 2 is only needed for focused unresolved decisions such as retention, clock semantics, research access, or provider/device parameters.

## 13. Roadmap and Decision Impact

The current roadmap is the source for task order. T1–T5 are complete; this Architecture audit revalidates the dependency basis for T6, T7, T8, T9, T11, and T15. T6 remains the next architectural implementation contract, with T7 and the research portion of T15 depending on it. T10–T12 remain deferred by D-001=A unless the owner changes the release scope. D-003=A already resolves the former topology/origin sequencing cycle.

Existing approved decisions remain sufficient; no new owner decision is created here:

- D-001=A keeps the release at controlled demonstration/pilot scope.
- D-002=B permits bounded raw diagnostics for the approved three-sender research, but does not choose retention, deletion, access, or clock parameters.
- D-003=A orders topology/origin work before client/server configuration alignment.
- D-004 defines Mobile, ESP32, and LoRaWAN research boundaries plus the authenticated Dev Dashboard scope.

Do not copy superseded historical task names or old pending-decision language into implementation handoffs.

## 14. Assumptions, Unknowns, and Confidence

- No mobile app, ESP32 firmware/GPS module, TTN account, gateway, deployed provider, browser session, or production runtime was observed.
- The ten-vehicle and 1–3 second input target is a design target, not measured capacity.
- Source clock synchronization, event timestamp quality, sequence guarantees, payload schema versions, retry behavior, and provider delivery semantics are unknown.
- D-002/D-004 research retention, deletion owner, access role, experiment repetition, checkpoints/reference receiver, and export limits remain unresolved.
- Confidence is **high** for repository-visible ownership and data flow, **medium** for operational truth and scalability behavior, and **low** for physical/provider runtime claims.

## 15. Audit Limitations and Handoff

No code, schema, deployment, or decision-queue changes are authorized by this report. Runtime, physical-device, provider, security, infrastructure, dashboard, and production-readiness claims remain for their own audits.

Architecture is now Complete and Validated. The next eligible Level 1 profiles are Backend, Frontend, and Database in parallel. Infrastructure & Device, Dashboard & UX, Security/DevOps/Observability, Production Readiness, and Roadmap remain gated by their predecessor sequence.
