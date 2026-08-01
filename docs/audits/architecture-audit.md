# Architecture Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 671b71209ad3ba3341de78f836b6ec057813280c
- Evidence scope: docs/project-knowledge-base.md, docs/audits/product-audit.md, docs/decision-queue.md, docs/research/, docs/roadmap/master-refactoring-roadmap.md, docs/tasks/, README.md, Compose/configuration, shuttle-tracking-backend/src/, shuttle-tracking-backend/prisma/, shuttle-tracking-backend/tests/, shuttle-tracking-web/hooks/, shuttle-tracking-web/utils/, shuttle-tracking-web/types/, shuttle-tracking-web/services/, shuttle-tracking-web/components/, and shuttle-tracking-web/tests/
- Reviewed at: 2026-08-01T12:30:00+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md @ 671b71209ad3ba3341de78f836b6ec057813280c; docs/audits/product-audit.md @ 671b71209ad3ba3341de78f836b6ec057813280c

## 1. Executive Summary

The current monolith remains an appropriate implementation shape, but D-001=C raises the operational requirements imposed on it. Express/Socket.IO is the boundary for public, admin, sender, and TTN traffic; PostgreSQL/PostGIS owns durable operational and research records; Redis owns transient canonical state, caches, throttles, and Socket.IO fan-out. Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and LoRaWAN/Gateway/TTN/Webhook remain distinct acquisition paths that converge on one normalization/canonical-selection boundary.

T6/T8 give public consumers one versioned canonical projection: only an authoritative, unexpired live state displays a Marker, contributes to active count, or supplies ETA. This is a local truthfulness correction, not public service-state or operations accountability. T7 adds bounded raw research records, distinct from canonical state and sampled GPSTrack, so raw diagnostics must not leak into public/admin operational projections.

The C-scope architecture still lacks a role-enforcement boundary, route-stop mutation transaction and invalidation boundary, protected history/exception/read models, feedback-triage data model, Mobile installation/claim/timeout state machine, and declared production topology. These are task placements and gates, not reasons to merge unrelated concerns into one service.

## 2. Scope and Freshness

This profile covers boundaries, authority, data products, temporal semantics, cache/realtime behavior, and task placement. It does not certify deployment, physical devices, provider behavior, browser runtime, load, or an Android client.

Discovery and Product have both been revalidated at 671b712. The relevant evidence changed from the preceding baseline in T8 public hooks/utilities/tests and in D-001=C, D-005=B, D-007, D-008, and T11's focused technical constraints. T8 does not alter backend data ownership; the decisions change what future task boundaries must support. Static source/test evidence is used only for repository claims.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Vehicle and source identity were conflated | Resolved | TrackingSource remains independent of Vehicle, with source type, binding, priority, credential version, and source reference on sampled history. Public canonical projection omits internal source identity. |
| Trip lifecycle lacked one owner | Resolved | operations.service.ts owns start/virtual-start, active-trip validation, end, vehicle repair, and sampled-history transaction behavior. Future timeout/force-close must extend this authority, not create controller-side writers. |
| Canonical current state was untyped/consumer-owned | Resolved | canonical-state.service.ts owns the V1 envelope, route authority, freshness, epoch/version, REST projection, and Socket.IO publication; T8 consumes that contract and rejects older state. |
| Raw diagnostics and temporal semantics were absent | Partially Resolved | T7 records bounded raw research observations with session, source, transport, receive/process/event-time, sequence/deduplication and disposition fields. Physical producer-clock quality and operational high-fidelity replay remain unverified/out of scope. |
| Redis current state is durable truth | Still Present | Redis current state/version allocation remains transient. PostgreSQL holds sampled canonical history and separate research evidence, not durable recovery/replay for public live state. |
| Route-stop cache ownership is incomplete | Still Present | Public route-stop reads cache for five minutes; route-stop create/delete do not use the shared invalidation service, and there is no atomic ordered replacement/reorder contract. T10 is the correct owner. |
| Realtime fan-out/scaling is proven | Unable to Verify | The Redis adapter exists, but publication is global and no rooms, replay, load threshold, or fan-out measurement is evidenced. |
| Public/admin service-state behavior is an operational contract | Partially Resolved | Canonical state distinguishes live, stale, no_service, and unknown; T8 keeps public projection coherent. C-scope user-facing wording, history, exception handling, and ownership are not implemented. |

## 4. Data Products and Authority

| Data product | Authoritative boundary | Required separation |
|---|---|---|
| Latest per-source observation | Redis source snapshot | Transient input to canonical selection; not research history or public state. |
| Canonical current vehicle state | Redis versioned canonical envelope | Only public/admin realtime/initial-state projection; server receive time is freshness clock. |
| Canonical trip history | PostgreSQL/PostGIS GPSTrack through Operations | Sampled operational history; does not become raw research replay. |
| Bounded raw diagnostics and aggregates | T7 PostgreSQL research schema/services | Authenticated research-only surface, session/protocol/versioned; never public projection. |
| Route/stop data | PostgreSQL plus public Redis caches | Ordered data must be mutated and invalidated atomically by T10. |
| Feedback and future triage | PostgreSQL Feedback currently capture-only | T12 needs an approved lifecycle/retention/access model before adding operations views. |

## 5. Required C-scope Placement

- T9: configuration only after the owner names topology and operations responsibilities. One topology/origin record must govern REST and Socket.IO; do not infer a provider or expose plaintext/IP production service.
- T10: add one route-stop composition command that validates membership/order, writes an ordered replacement or safe equivalent transaction, and invalidates route/public geometry projections. The public read must consume the changed authoritative sequence.
- T11: extend the Operations/lifecycle authority and supporting schema/auth boundaries for receipt-time lastAcceptedAt, 10-minute timeout, no-reopen, Mobile installation/claim, revocation, audit, protected history, and exceptions. A separate Android client remains an external consumer of a versioned contract. General D-007 account-lifecycle policy is not authorized to be invented here.
- T12: must wait for feedback privacy/retention/triage/deletion and device action-matrix decisions. Its feedback and source/device views must be separate from raw research data and privileged actions.

## 6. Risks and Recommendations

1. Define Redis-loss/degraded and recovery behavior before a production claim; the current model cannot recreate a durable current-state/version stream from PostgreSQL.
2. Keep timeout execution serialized with sender observations and administrative recovery in the same lifecycle transaction/locking order. Rejected/post-close observations must not advance lastAcceptedAt.
3. Implement hierarchy enforcement at a reusable server authorization boundary after remaining owner policy is approved; current authenticateToken proves identity but has no role authorization.
4. Keep T10 cache invalidation explicit and test the next public read, rather than depending on TTL.
5. Preserve the no-raw-public invariant; research data requires distinct authentication and provenance/retention semantics.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is blocked by D-008. T10 has an architecturally narrow path once affected audits and a task handoff are current. T11 needs focused technical and external Android evidence plus any necessary approved role-policy constraints; T12 remains owner-policy blocked. No new owner decision is proposed: the unresolved topology, feedback/privacy, account lifecycle, destructive action, and external-device facts are already in the decision queue.

Confidence is High for code-visible authority and missing boundaries, Medium for T8 local projection because deterministic and isolated-browser tests exist, and Low for distributed recovery, deployment, load, hardware, provider, Android, and real operations outcomes.

## 8. Handoff

Backend, Frontend, and Database are now independently eligible for re-audit using this Architecture baseline. Their reports must cover the C-scope placement above without treating a policy direction or simulator as implementation/runtime evidence.
