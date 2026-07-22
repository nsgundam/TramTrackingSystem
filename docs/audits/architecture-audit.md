# Architecture Audit: Tram Tracking System

Validation status: **Needs Re-audit**. This legacy report predates T5 lifecycle completion and the
current evidence-baseline contract; roadmap task references may use superseded numbering.

Last re-audited: 2026-07-19

## 1. Executive Summary

The single Express/Socket.IO backend, Next.js frontend, PostgreSQL/PostGIS, and Redis remain suitable for the controlled MVP.
Recent sender/session and tracking-source changes materially improve multi-source support.
The main risk is operational truth, not a need for microservices.
Canonical location is Redis-only, all-stale sources become `null`, events lack a canonical version, and trip state has split ownership.
Keep the monolith and establish backend-owned canonical vehicle state and Operations/Trip ownership before expanding daily operations.

## 2. Scope, Evidence, and Re-audit Status

Scope: architecture boundaries, data/realtime flow, module ownership, scalability posture, and decisions.
Excluded: code style, security severity, infrastructure configuration, query tuning, UI design, and runtime benchmarks.

Evidence inspected:

- `docs/project-knowledge-base.md` (2026-07-18)
- Validated `docs/audits/product-audit.md` (2026-07-19)
- Previous `docs/audits/architecture-audit.md`
- Current server, tracking service, schema, public tracker, admin navigation, roadmap, and Git log

| Prior finding | Status | Current evidence |
|---|---|---|
| Vehicle and source identity were conflated | **Resolved** | `TrackingSource` is distinct from `Vehicle`; ingestion is source-aware. |
| Source health/failover was not operational | **Partially Resolved** | Priority/freshness selection exists, but all-stale returns `null` and no product state is exposed. |
| Canonical state is Redis-only | **Still Present** | Current vehicle location is a Redis value; durable history is sampled separately. |
| Realtime is global | **Still Present** | `location-update` is broadcast globally; this is acceptable at MVP scale. |
| Frontend owns ETA and route intelligence | **Still Present** | `ShuttleTracker` calculates ETA and route position locally. |
| Trip lifecycle lacks one owner | **Still Present** | Trip routes change lifecycle while tracking can create virtual trips. |
| Route-stop architecture was incomplete | **Partially Resolved** | Ordered relation/API exists; validated Product Audit confirms UI is absent. |
| Raw observation/event ordering is unspecified | **New Finding** | Latest snapshots and sampled history lack event time, sequence, rejection, and version semantics. |

## 3. Architecture Overview

- Clients: public tracker, admin portal, simulator/device/mobile sender, and TTN webhook.
- Backend: one Express process owns REST, Socket.IO, and the canonical tracking pipeline.
- Tracking: source observation is validated, cached, selected by priority/freshness, emitted, and sampled into trip history.
- PostgreSQL/PostGIS owns master data, trips, sampled history, sources, and feedback.
- Redis owns public caches, latest source/canonical state, throttles, counters, and Socket.IO pub/sub.
- No deployed mobile, TTN provider, or ESP32 runtime was observed.

## 4. Architecture Strengths

1. A monolith is coherent for the MVP and avoids unnecessary distributed coordination.
2. `TrackingSource`, `GPSTrack.sourceId`, sender context, and deterministic source selection support multiple sources per vehicle.
3. PostGIS and ordered `RouteStop` provide a suitable spatial and route-order foundation.
4. Redis is correctly used for transient cache/current state and Socket.IO scale-out support.
5. HTTP, Socket.IO, and TTN input converge on one canonical-selection pipeline.

## 5. Architecture Risks

### High — Canonical location is not an explicit operational state

Problem: selection emits a location while fresh but does not publish a versioned `fresh`, `stale`, or `offline` state with a selection reason.

Current Impact: public/admin clients cannot distinguish a missing update from known stale data and cannot reject an older canonical result.

Future Risk: multi-source failover can become unexplainable and clients can display inconsistent operational truth.

Recommendation: define a backend-owned canonical vehicle-state contract with vehicle ID, timestamp/version, source, freshness, selection reason, and location when available.

Reason: the tracking service returns `null` when all sources are stale; the Product Audit requires stale/offline visibility before daily operations.

Priority: High. Difficulty: Medium. Research Topic: event ordering and operational state machines.

Expected Benefit: one trusted contract for public map, admin operations, history, and alerts.

### High — Trip and operations rules are split

Problem: trip routes start/end trips and update vehicle state, while tracking can create an in-progress virtual trip.

Current Impact: sender lifecycle exists, but no single component defines active, completed, or stale service state.

Future Risk: history, driver workflow, device health, and alerts can duplicate or conflict on operational meaning.

Recommendation: create an Operations/Trip domain service that owns active-trip lookup/creation, state transitions, freshness policy, and operational read models.

Reason: controllers and tracking each currently encode trip-state behaviour.

Priority: High. Difficulty: Medium. Research Topic: domain services and state transitions.

Expected Benefit: product workflows share one consistent operational model.

### Medium — Raw telemetry and canonical history are different unresolved needs

Problem: durable history is sampled canonical data, while raw source state is latest-only Redis data without durable event time, receive time, sequence, or rejection outcomes.

Current Impact: enough for live tracking and limited trip history, but not detailed source comparison, failover investigation, or playback promises.

Recommendation: choose retention before adding comparison, analytics, or playback. Keep canonical sampled history as the MVP default unless D-002 approves bounded raw diagnostics.

Priority: Medium now; High if playback or device research is promised. Difficulty: Medium.

### Medium — Public tracking intelligence is client-owned

Problem: the public tracker owns route geometry, snapping, ETA, and next-stop logic.

Recommendation: retain client ETA for the controlled MVP. First establish backend read contracts for canonical state, freshness, route-stop order, and history. Move ETA only when another consumer needs the same answer.

Priority: Medium. Difficulty: Medium. This is scale-triggered, not a rewrite now.

### Low — Global broadcast has a scale trigger

Global broadcast is acceptable for the stated ten-vehicle target. Add route/viewer rooms only after measured client or bandwidth pressure. Do not add a broker or microservice now.

## 6. Domain Model Review

The source/vehicle split, trip/GPS history, ordered route stops, and feedback entity are sound broad concepts.
Missing architectural concepts are canonical vehicle state, freshness reason, one operations owner, raw telemetry policy, and feedback triage state.

## 7. Data Flow Review

| Flow | Assessment |
|---|---|
| Public read and live update | Appropriate REST plus Socket.IO split; lacks explicit stale/offline state. |
| Sender/mobile | Stronger source-bound session and shared observation pipeline. |
| TTN | Correctly converges on the canonical pipeline; deployed provider topology is unobserved. |
| Canonical selection | Deterministic priority/freshness; no event-time/version rules. |
| Trip/history | Sampled history exists; active-trip ownership is split. |
| Feedback | Public capture exists; no staff inbox/read model exists. |

## 8. Module Review

The current API modules are understandable: auth, public, admin master data, trips, ingestion, and tracking.
The needed improvement is a domain boundary, not a service split.

- Tracking: normalize observations, select and publish canonical state.
- Operations/Trip: lifecycle, active status, freshness policy, and history/read-model ownership.
- Feedback: public capture now; staff workflow only if D-001 scope requires it.

## 9. Device Architecture Review

The system supports controlled multi-source experiments through source assignment, priority, and freshness.
It cannot yet claim reliable physical-device comparison without source-health visibility, ordering, retention policy, and provider/device runtime validation.
TTN should remain server-side input so canonical selection is not bypassed.
ESP32 remains deferred because no firmware, provisioning, or transport contract is present.

## 10. Scalability Review

- 10 vehicles / 1–3 second inputs: the monolith and Redis adapter are reasonable to validate; no load evidence was observed.
- 50 vehicles: keep topology; add measurement, canonical-state versioning, and rooms only if pressure warrants it.
- 100 vehicles or long history: revisit retention, indexes, and read models after pilot data; do not assume microservices are required.

## 11. Maintainability Review

The core risk is duplicated operational meaning across trip controllers, tracking, cache state, and frontend calculations.
A small Operations/Trip boundary and canonical-state contract reduce this more than a repository layer or distributed redesign.

## 12. Future Readiness

| Capability | Readiness |
|---|---|
| Route-stop management | Ordered model ready; product workflow missing. |
| Supported sender workflow | Backend boundary exists; client/product contract missing. |
| Trip history | Sampled data exists; ownership/read model work remains. |
| Playback | Blocked on D-002/T14 retention and fidelity decision. |
| Feedback triage | Capture exists; case/read model missing. |
| Device comparison | Blocked on raw telemetry/event ordering decision. |
| Alerts/dashboard | Blocked on canonical freshness/state contract. |

## 13. Architecture Score

| Dimension | Assessment | Reason |
|---|---|---|
| MVP architecture | Strong | Conventional monolith fits scope. |
| Multi-source extensibility | Partial | Registry/selection exist; operational state is incomplete. |
| Realtime correctness | Partial | Canonical selection exists; version/stale signal does not. |
| Maintainability | Partial | Modules are clear; trip/tracking ownership overlaps. |
| Scale readiness | Appropriate for 10 vehicles | Larger claims need measurements. |
| Overall | Suitable for controlled MVP | High-priority operations boundaries remain. |

## 14. Refactoring Roadmap

### Phase 1 — before daily operations

1. Canonical vehicle-state/freshness contract and operations visibility.
2. Operations/Trip domain boundary and active-trip/history read model.
3. Route-stop management using the existing ordered relation.

### Phase 2 — after Phase 1 validation

1. Align clients to versioned canonical events and stable read contracts.
2. Add feedback triage/device-health read models if D-001 requires them.
3. Implement only the D-002-approved telemetry policy.

### Phase 3 — scale-triggered

1. Route/viewer rooms after observed broadcast pressure.
2. Backend ETA/shared route intelligence when a second consumer needs it.
3. Playback/analytics after retention and pilot evidence.

## 15. Learning Topics

1. Canonical state, event versions, and stale/offline semantics — needed now.
2. Domain services and state transitions — needed now.
3. Raw versus canonical telemetry retention — needed for D-002.
4. Read models and client/server ownership — before sharing history or ETA.
5. Realtime rooms and capacity measurement — scale-triggered.

## 16. Architecture Questions

1. What should riders see when no source is fresh: last known, unavailable, or route-level no-service?
2. Is the target a controlled demo or daily operations (D-001)?
3. Is raw telemetry needed for comparison/incidents or only canonical history (D-002)?
4. What event-time and sequence rules will devices provide?
5. Who owns feedback triage if public feedback is promoted?

## 17. Roadmap Impact

This report revalidates the architectural basis of T2, T3, T9, T13, T14, T15, T19, T21, T26, T27, and T29.
It identifies the T6 ↔ T16 dependency cycle as a roadmap sequencing conflict.
The Roadmap Agent must make production configuration and origin-alignment order explicit.
No roadmap changes are made in this phase.

## 18. Assumptions and Unknowns

- No real mobile, ESP32, TTN provider, browser, or deployment runtime was observed.
- The ten-vehicle, 1–3 second target is a design target, not measured load.
- Product scope remains pending D-001.
- Source clocks, sequence numbers, and provider delivery guarantees are unknown.

## 19. Confidence

**High** for repository-visible boundaries and source/canonical flow.
**Medium** for operational scale and physical-device/provider behaviour because no runtime evidence was available.

## 20. Required Decisions

- D-001 — operational MVP release scope (existing, pending).
- D-002 — telemetry retention and canonical-history fidelity (new, pending).
- D-003 — T6/T16 production-configuration dependency order (new, pending).

## 21. Audit Limitations

No runtime load, browser, deployment, mobile, ESP32, or TTN provider session was observed.
Security and infrastructure conclusions are deferred to their respective re-audits.

## 22. Handoff

Next audits: Backend, Database, and Infrastructure & Device.
Backend and Database may proceed in parallel from this accepted architecture report.
Infrastructure follows their refreshed device/data evidence.
