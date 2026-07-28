# T6 Specialist Decision Brief — Backend Realtime Canonical Vehicle State

Status: **Immutable Level 2 decision brief — v1**

## 1. Trigger and focused question

- Task: **T6 — Publish a versioned, route-aware canonical vehicle-state contract**
- Triggering findings: Architecture Audit canonical state, temporal semantics, and route/ETA authority findings; Backend Audit sections 5, 7, 8, and 9; Frontend Audit realtime/route authority findings; Database Audit telemetry/timestamp findings; Production Readiness blockers PR-02, PR-03, and PR-07.
- Focused question: **What is the smallest backend-owned, versioned canonical vehicle-state contract that lets REST, Socket.IO, public riders, and admin consumers agree on route authority, ordering, freshness, stale/no-service behavior, and reconnect handling without adding raw telemetry or a schema migration?**
- Expected output: this brief at `docs/audits/specialized/T6-backend-realtime-canonical-vehicle-state.md`.
- Scope constraints: preserve D-001=A, D-002=B, D-003=A, and D-004; keep the monolith and the three existing transport boundaries; do not implement code, create a migration, update the roadmap, or edit the Decision Queue.

Evidence metadata:
- Evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Reviewed at: `2026-07-22T22:09:43+07:00`
- Evidence classification: validated repository evidence for the current code/audits; design recommendations are specialist inference; no physical/provider/runtime evidence was available.
- Primary playbook: `.agents/skills/tram-specialist-consultation/references/backend-ingestion-realtime.md`
- Supporting playbook: `.agents/skills/tram-specialist-consultation/references/developer-dashboard-visualization.md` because public/admin consumers must share the same authority contract.
- External research: **Not required**. This is a repository-local contract decision, not a version-sensitive technology, hardware, protocol, or security claim.

## 2. Current evidence

### Backend authority today

- `shuttle-tracking-backend/src/services/tracking.service.ts` stores one latest source snapshot in Redis, assigns a backend `Date.now()` timestamp, selects active sources by `priority` then `id`, accepts a source snapshot when it is within the 30-second freshness window, writes `vehicle:current_location:<vehicleId>`, and returns a location or `null`.
- `shuttle-tracking-backend/src/server.ts` and `shuttle-tracking-backend/src/routes/ingest.route.ts` each emit `location-update` directly after `processObservation` returns a canonical location. There is no single publisher or version guard.
- `shuttle-tracking-backend/src/controllers/public.controller.ts` reads the Redis canonical location without repeating the 30-second freshness check and exposes it as a location projection. This can return an old location after all sources are stale.
- `shuttle-tracking-backend/src/services/operations.service.ts` is the T5 lifecycle owner and can resolve an active trip/route or create a virtual trip from `Vehicle.assignedRouteId` during sampled history persistence. The current canonical event is emitted before that persistence operation completes.
- `shuttle-tracking-backend/src/services/tracking.service.ts` has internal `online`, `stale`, `never_seen`, and `disabled` source-health states and emits process-local signals for source/vehicle staleness, but it does not publish a client-visible state transition.

### Frontend consumers today

- `shuttle-tracking-web/components/public/ShuttleTracker.tsx` consumes `location-update` through `LocationUpdateData`, assigns a vehicle to `selectedRouteRef.current` when no mapping exists, derives route geometry/next stop/ETA locally, and has no Socket.IO connection, reconnect, freshness, version, or stale/no-service state.
- `shuttle-tracking-web/components/admin/LiveMap.tsx` consumes only global `location-update` events, has no initial REST snapshot, and keeps the latest event by `vehicleId` without ordering or connection state.
- `shuttle-tracking-web/types/index.ts` has a location shape with coordinates and presentation aliases (`id`, `vehicleId`, `actualStation`, `station`, `bearing`, `heading`) but no contract/schema version, route identity, source authority, state version, or freshness.
- `shuttle-tracking-web/services/publicApi.ts` exists, but the public tracker currently fetches active vehicle metadata through direct `fetch` calls and does not use a canonical state DTO for initial state.

### Existing constraints and non-goals

- Redis is the current transient authority for latest source/canonical state; PostgreSQL stores sampled canonical `GPSTrack` history, not raw observations.
- D-002=B/D-004 raw observations, event-time/receive-time separation, sequence/deduplication, experiment/session identity, retention, and research export belong to T7 and must not be silently invented by T6.
- D-001=A permits a supervised controlled demonstration, not daily/public service. T6 must improve truthfulness without implying field or provider validation.
- A viewer's Socket.IO disconnection is not the same fact as a vehicle source becoming stale. The contract must represent them separately.

## 3. Recommended decision

Adopt a **versioned `CanonicalVehicleStateV1` envelope** as the only application-level output for canonical vehicle state. Keep the existing Socket.IO event name `location-update` for the controlled-MVP migration, but replace its unversioned payload with this envelope. Make the same envelope available through the initial REST snapshot. Create one backend publisher/projection boundary; `server.ts` and `ingest.route.ts` must not construct or emit canonical payloads themselves.

### 3.1 Contract shape

The following is the normative shape for T6. Fields marked internal are omitted from the public projection, not given a second meaning.

```ts
type CanonicalVehicleStateV1 = {
  schemaVersion: 1;
  eventType: 'canonical_vehicle_state';
  stateEpoch: string;
  stateVersion: number;
  vehicleId: string;
  tripId: string | null;
  routeId: string | null;
  routeAuthority: 'active_trip' | 'vehicle_assignment' | 'unknown';
  serviceState: 'live' | 'stale' | 'no_service' | 'unknown';
  reasonCode:
    | 'CANONICAL_SELECTED'
    | 'FALLBACK_SOURCE_SELECTED'
    | 'ALL_SOURCES_STALE'
    | 'SOURCE_NEVER_SEEN'
    | 'NO_ACTIVE_SOURCE'
    | 'DEPENDENCY_UNAVAILABLE'
    | 'RECOVERED';
  liveLocation: {
    lat: number;
    lng: number;
    speed: number | null;
    heading: number | null;
    accuracy: number | null;
    station: string | null;
  } | null;
  lastKnownLocation: {
    lat: number;
    lng: number;
    speed: number | null;
    heading: number | null;
    accuracy: number | null;
    station: string | null;
  } | null;
  timing: {
    observedAt: string | null;
    receivedAt: string;
    selectedAt: string;
    freshnessClock: 'server_receive';
  };
  freshness: {
    ageMs: number | null;
    thresholdMs: number;
    bucket: 'fresh' | 'stale' | 'none';
  };
  sourceType: 'mobile' | 'esp32' | 'lorawan' | 'simulator' | null;
  // Internal/admin projection only. Never expose credential or raw payload data.
  sourceId?: string | null;
};
```

Normative semantics:

1. `schemaVersion` identifies the DTO shape; `stateEpoch` identifies the comparable version sequence; `stateVersion` is a server-issued, strictly increasing integer per vehicle within an epoch. Clients compare `(stateEpoch, stateVersion)`, never timestamps, to discard an older envelope.
2. The version is assigned only when an externally visible canonical state is accepted: a fresh canonical selection or a stale/no-service transition. A raw, lower-priority, rejected, or non-canonical observation does not get broadcast merely because it was received.
3. `stateEpoch` and per-vehicle `stateVersion` are generated through Redis-backed atomic state management. The epoch must change if the version namespace is lost/reset; clients then clear the previous comparator and accept the first state in the new epoch. Do not use `Date.now()` as the ordering key.
4. `serviceState=live` requires a selected source whose server-receive age is at most the existing `SOURCE_FRESHNESS_WINDOW_MS` (30 seconds). `liveLocation` is populated only in this state.
5. `serviceState=stale` means a vehicle/source configuration exists but no fresh source is currently selected. `lastKnownLocation` may be present for an explicitly labelled last-known marker; it is not a current location and must not drive ETA.
6. `serviceState=no_service` means no active source/route-backed service can be offered, including `NO_ACTIVE_SOURCE` or `SOURCE_NEVER_SEEN`. `liveLocation` and `lastKnownLocation` are null unless a separate product decision explicitly allows last-known display for that reason.
7. `serviceState=unknown` is reserved for dependency/state-evaluation failure. It must not be rendered as `no_service`, because the backend cannot prove that service is absent.
8. Viewer transport state is separate and frontend-owned: `connected`, `reconnecting`, or `disconnected`. Do not encode a viewer's socket `offline` state as the vehicle's `serviceState`.
9. `timing.observedAt` remains nullable until an adapter supplies a producer event time. `receivedAt` is the current authoritative freshness clock; T6 must not claim device latency or event-time ordering from it. `selectedAt` records server selection/publication time.
10. Route authority is server-owned: `active_trip.routeId` takes precedence over `Vehicle.assignedRouteId`; assignment is a weaker fallback and is labelled `vehicle_assignment`; absent/ambiguous route is `unknown`. The selected UI route is a filter only and can never populate `routeId`.
11. Public projection may expose `vehicleId`, `routeId`, `routeAuthority`, `serviceState`, safe reason, timestamps/freshness, `sourceType`, and canonical/last-known coordinates as permitted by the existing public contract. It must omit `sourceId` and all raw payload/credential data. Admin/internal projections may include `sourceId` only when needed for operations.

### 3.2 State transition and publication rules

- Fresh selection publishes one canonical envelope through one `publishCanonicalState` boundary. The boundary writes the current Redis state and state version atomically enough that concurrent writers cannot publish a lower version after a higher one.
- The source-health sweep publishes a state transition only when a vehicle crosses `live → stale/no_service/unknown` or recovers. It must not emit a repeated state every ten seconds merely because the sweep runs.
- All HTTP, Socket.IO, and TTN adapters call the same canonical service and return/emit the same DTO. They must not call `io.emit` directly.
- The `location-update` event remains the transport name for this migration. A future event rename is a separate compatibility decision. The acknowledgement may expose `canonicalState`; if `canonicalLocation` is retained temporarily for checked-in simulator compatibility, it must be a read-only alias of the same envelope and cannot be a second payload shape.
- `GET /api/public/active-vehicles` must provide the same canonical state as the initial REST snapshot. The state field is authoritative; any legacy location field is a derived compatibility projection and must not be read by new consumers.
- T6 preserves current best-effort sampled history behavior: live canonical publication is not blocked by the 60-second PostGIS sample. History failure remains an operational signal and must not be presented as durable research evidence. T7 decides raw disposition/outbox/retention semantics.

### 3.3 Frontend consumption rules

- On initial REST load, seed the per-vehicle `(stateEpoch, stateVersion)` map before opening/processing live updates. A live event with an older pair is ignored; an event from a new epoch resets that vehicle's comparator.
- The public tracker must use `routeId`/`routeAuthority` from the envelope. It must never fall back to the selected route to assign a vehicle. A vehicle with `routeAuthority=unknown` is not eligible for route-specific ETA.
- `live` may update the active marker and ETA. `stale` may show a clearly labelled last-known marker but must disable current ETA and current-service wording. `no_service` removes/clears the active marker and shows no-service state. `unknown` shows unavailable/degraded state rather than claiming no service.
- The client starts a local freshness timer from `timing.receivedAt + freshness.thresholdMs` so a disconnected viewer can become visibly stale even if no server transition arrives. This local timer is presentation state, not a new backend authority.
- `LiveMap` must consume the same initial REST state and event envelope. It must not maintain a separate “latest object by vehicle” shape or a static “Live System Active” claim.

## 4. Alternatives and trade-offs

### Alternative A — Recommended: Redis epoch/sequence envelope, existing event name

Use Redis-backed `stateEpoch` plus atomic per-vehicle `stateVersion`, one canonical publisher, one REST/Socket.IO DTO, and local client expiry. It requires no Prisma migration, preserves the monolith and transport adapters, makes stale transitions explicit, and is sufficient for D-001=A. It does not provide durable raw history or event-time ordering; those remain T7.

### Alternative B — Timestamp-only ordering

Reuse `recordedAt`/`Date.now()` as the client ordering key. This is lower effort but fails under clock skew, equal timestamps, concurrent workers, and restart/version resets. It cannot support the roadmap acceptance requirement that delayed events be ignored deterministically. Not recommended.

### Alternative C — Durable PostgreSQL event/outbox contract now

Persist every canonical transition and publish through an outbox/relay. This provides stronger replay and auditability, but introduces schema/migration, retry, retention, and operational scope that belongs to T7/T13 and is not required for the controlled demo. Not recommended for T6.

### Alternative D — New `canonical-state` Socket.IO event and new REST version

This is a clean long-term API break, but it creates simultaneous event contracts for current simulators, checked-in clients, and any external sender/operator. Keep `location-update` as the transport event while versioning its payload; revisit an event rename only with a compatibility plan.

## 5. MVP rationale and boundaries

This recommendation is proportionate to the approved scope:

- It fixes the misleading-accuracy risk without claiming provider, firmware, or field correctness.
- It uses existing Redis, `TrackingSource`, `Vehicle.assignedRouteId`, `Trip.routeId`, and T5 lifecycle vocabulary; no schema migration is needed.
- It keeps public consumers canonical-only and separates public presentation from future raw diagnostics.
- It makes the existing 30-second freshness rule visible and testable instead of silently relying on it.
- It gives T7 a stable boundary: raw event-time/sequence/disposition/session data can be added later without redefining what public canonical state means.
- It leaves route-stop mutation invalidation, rich admin source-health views, feedback triage, and research dashboard work to T10–T12/T15 as already sequenced.

## 6. Exact Level 3 implementation handoff

The following paths are the proposed T6 write allowlist. A Level 3 task specification must resolve exact line-level responsibilities before worker delegation; no other repository paths are implicitly authorized.

### Backend

- `shuttle-tracking-backend/src/services/canonical-state.service.ts` — **new** owner for `CanonicalVehicleStateV1`, state epoch/version allocation, route-authority resolution, freshness/state transitions, public/internal projections, and the single publication boundary.
- `shuttle-tracking-backend/src/services/tracking.service.ts` — pass receive-time/source/selection facts into the canonical service; keep transport-independent source selection and existing T5 history call; do not add raw-diagnostics persistence.
- `shuttle-tracking-backend/src/services/operations.service.ts` — expose or reuse the minimal active-trip/route lookup needed for route authority; preserve T5 transaction, lock, constraint, and idempotency behavior.
- `shuttle-tracking-backend/src/server.ts` — replace direct Socket.IO canonical emission with the canonical publisher and preserve sender acknowledgement/error behavior.
- `shuttle-tracking-backend/src/routes/ingest.route.ts` — replace direct HTTP/TTN emission and response shaping with the same canonical DTO; preserve TTN auth, validation, rate limits, and ingestion signals.
- `shuttle-tracking-backend/src/controllers/public.controller.ts` — return the canonical public projection from `GET /api/public/active-vehicles` and never return an un-freshness-checked legacy location as the authoritative state.
- `shuttle-tracking-backend/test_t6_canonical_state.js` — **new** unit/integration boundary checks for state shape, epoch/version ordering, route authority, freshness states, and dependency failure.
- `shuttle-tracking-backend/test_t6_realtime.js` — **new** checks for one publisher, REST/Socket payload equivalence, stale/recovery transition, and concurrent publication ordering.
- `shuttle-tracking-backend/test_socket_boundary.js` and `shuttle-tracking-backend/test_pipeline.js` — update only the checked-in assertions/fixtures needed for the versioned canonical envelope; preserve sender auth and transport convergence coverage.

### Frontend

- `shuttle-tracking-web/types/canonical-state.ts` — **new** shared `CanonicalVehicleStateV1`, public projection, and viewer `RealtimeConnectionState` types.
- `shuttle-tracking-web/types/index.ts` — remove the unversioned location shape as the new-consumer authority or re-export the canonical type; keep compatibility aliases only during the explicitly bounded migration.
- `shuttle-tracking-web/services/publicApi.ts` — add the typed initial active-vehicle/canonical-state read used by both public and admin consumers.
- `shuttle-tracking-web/components/public/ShuttleTracker.tsx` — consume route authority and state version, remove selected-route assignment fallback, handle stale/no-service/unknown and local expiry, and disable ETA when state is not eligible.
- `shuttle-tracking-web/components/admin/LiveMap.tsx` — seed from the initial REST state, consume the same versioned envelope, and render connection/state truth instead of only global latest events.

### Out of scope for this handoff

Do not modify Prisma schema/migrations, raw-observation storage, retention jobs, research export, route-stop mutation behavior, authentication/authorization roles, deployment topology, provider adapters, firmware, or public research UI. Those belong to T7/T9/T10–T15 and their own approved task contracts.

## 7. Acceptance criteria and validation plan

### Contract and backend tests

1. Every emitted and initial REST canonical state validates `schemaVersion`, `stateEpoch`, `stateVersion`, vehicle identity, route authority, service state, reason, freshness, and timing fields.
2. Two concurrent canonical publications for one vehicle cannot produce a lower state version after a higher one in the same epoch. An epoch reset is observable and causes client comparator reset.
3. A source within 30 seconds produces `live`; all configured sources stale produces one `stale` transition with no live location; no active/never-seen source produces `no_service`; Redis/state-evaluation failure produces `unknown`, not `no_service`.
4. Active trip route wins over vehicle assignment; assignment fallback is labelled; no route produces `unknown`. The UI-selected route is never used to populate the envelope.
5. HTTP, Socket.IO, and TTN paths produce byte-equivalent canonical state semantics and only accepted canonical state is emitted. Direct `io.emit('location-update', ...)` calls outside the publisher are absent.
6. REST initial state and Socket.IO state use the same versioned projection; stale Redis entries are not returned as `live`.
7. T5 operations tests still pass; sampled history failure remains signaled and does not create a false raw/research guarantee.

### Frontend tests and checks

1. A state for route R02 remains associated with R02 while the user selects R01; no marker or ETA is reassigned to R01 by UI fallback.
2. A lower `stateVersion` in the same epoch is ignored; a new epoch resets the comparator; duplicate pending zoom updates use the same ordering rule.
3. `live`, `stale`, `no_service`, `unknown`, `connected`, `reconnecting`, and `disconnected` render distinct truthful states; stale/no-service never presents a current ETA.
4. Initial REST state followed by Socket.IO updates produces the same marker state as Socket.IO-only updates; reconnect does not require replay to become correct because the client re-reads the snapshot.
5. Run backend build/boundary tests, T5 operations tests, frontend lint/build, and a disposable Postgres/Redis + Socket.IO smoke test only against an explicitly approved disposable target. Record the manual/browser interruption check for stale, reconnect, route filtering, and recovery.

## 8. Failure modes, compatibility, and rollout risk

| Failure mode | Required behavior | Risk/mitigation |
|---|---|---|
| Redis unavailable during state allocation | Do not fabricate a version or broadcast a state; return dependency-unavailable according to current ingest semantics and emit the existing redacted signal. | Current live state cannot be advanced; T13 must later define recovery/reconciliation. |
| Concurrent source/vehicle updates | Atomically allocate/write state version and reject a lower publication; use a server-owned sequence, not timestamps. | Redis remains a single runtime dependency; no durable replay in T6. |
| All sources stale | Publish one transition; expose last-known only as explicitly stale and disable ETA. | Requires health sweep and client expiry tests; do not repeatedly broadcast every sweep. |
| No active/never-seen source | Publish `no_service` with null live location; do not leak a stale cached coordinate as current. | Product may choose whether to show last-known in a later UX decision. |
| Viewer disconnects | Frontend marks connection separately and expires state locally; on reconnect, fetch the initial REST snapshot. | No Socket.IO replay is assumed; snapshot route must be tested. |
| Delayed/duplicate observation | T6 orders canonical envelopes by state version; it does not claim raw duplicate/event-time disposition. T7 owns raw semantics. | Do not label server receive time as device latency. |
| Sampled history insert fails | Keep live-state and sampled-history outcomes distinct; operationally signal failure; do not expose a false durable-history claim. | Existing best-effort behavior remains a controlled-MVP limitation. |
| Existing client/fixture expects old fields | Keep `location-update` event name; update checked-in types/fixtures in one bounded release. Any `canonicalLocation` alias must reference the same new object only. | External consumers are not verified; D-001 limits the claim to known controlled consumers. |
| Redis version namespace is lost | Generate a new `stateEpoch`; clients reset version comparison after epoch change. | State continuity/replay is not guaranteed until a later durable event/outbox task. |

## 9. Open questions and proposed owner decisions

These are returned to Level 1/owner control; this brief does not edit `docs/decision-queue.md`.

1. **Route fallback policy:** accept the recommended precedence `active trip route > vehicle assignment > unknown`, with no UI-selected route fallback? Recommended: yes. This is necessary to prevent route misassociation.
2. **Stale-marker presentation:** should a public rider see a muted last-known marker when `serviceState=stale`, or should it disappear? Recommended default for D-001=A: allow a muted last-known marker only with an explicit stale label and no ETA; hiding it is also safe but loses context.
3. **Compatibility window:** accept a checked-in one-release migration that keeps `location-update` but changes its payload to `CanonicalVehicleStateV1`, and deprecates any old `canonicalLocation` shape? Recommended: yes; no second semantic contract should be maintained.
4. **Public dependency failure wording:** should `unknown` render as “live data unavailable” rather than “no service”? Recommended: yes, because dependency failure does not prove the vehicle/service is absent.

No decision is requested about raw retention, event-time trust, sequence/deduplication, research roles, or export: those remain T7/D-002/D-004 implementation parameters and require their own focused brief if unresolved.

## 10. Rollout and validation ownership

- Level 2 owns this decision brief only; it does not change code, migrations, roadmap, or queues.
- Level 1 coordinator validates whether the owner accepts the four questions above and records any approved change in the Decision Queue.
- Level 3 creates an exact-path `docs/tasks/<task-id>-<topic>.md` handoff from this brief, implements only the allowlist, runs the acceptance checks, and synchronizes the roadmap task status.
- Production Readiness must remain No-Go for internal/public operation until T6 plus the other production-bar tasks are independently validated.

## 11. Assumptions, confidence, and supersession

- Assumes the current monolith remains the target for D-001=A, Redis is available for the controlled runtime, and T5's transactional service remains the only lifecycle owner.
- Assumes no physical device, provider, or synchronized clock can be treated as evidence; current `observedAt` is therefore nullable and receive time is the only freshness clock.
- Confidence is **High** for the repository-local contract recommendation and exact consumer gaps; **Medium** for concurrent Redis/runtime behavior until disposable multi-process tests run; **Low** for field/provider/device behavior.
- This file is immutable v1. If the focused question changes or an owner decision materially changes the contract, create `T6-backend-realtime-canonical-vehicle-state-v2.md` and link this brief as superseded. Do not edit this file in place.
