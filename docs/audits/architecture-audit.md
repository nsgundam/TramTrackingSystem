# Architecture Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 1eec86602c40c859d50dd9d369f636b103b6896f
- Evidence scope: docs/project-knowledge-base.md, docs/audits/product-audit.md,
  docs/decision-queue.md, docs/research/, docs/tasks/, docs/operations/, README.md,
  Compose/environment configuration and scripts, shuttle-tracking-backend/src/,
  shuttle-tracking-backend/prisma/, shuttle-tracking-backend/tests/,
  shuttle-tracking-web/config/, shuttle-tracking-web/hooks/, shuttle-tracking-web/utils/,
  shuttle-tracking-web/types/, shuttle-tracking-web/services/,
  shuttle-tracking-web/components/, shuttle-tracking-web/tests/, and the T11 v3 external Mobile
  compatibility brief
- Reviewed at: 2026-08-08T00:07:30+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md and docs/audits/product-audit.md @ 1eec86602c40c859d50dd9d369f636b103b6896f

## 2026-08-08 Decision and Mobile boundary re-audit

Discovery and Product are current at `1eec866...`; application source in this repository is
unchanged. The pinned external Android source confirms a concrete consumer of the present
`vehicle-login`/Trip/Socket.IO contract, but also exposes contract drift: the client persists and
replays a static Source ID/secret while T11 requires installation enrollment, a protected refresh
credential, a non-secret vehicle selector, exclusive claim/version state, and authoritative
idempotent Trip recovery. The safe architecture remains one versioned cross-repository state machine
with server-owned claims/lifecycle; retaining old and new authentication contracts indefinitely
would create two authorities.

D-012 now supplies the future least-privilege account/Sender/deletion/recovery policy, closing the
owner question but not the schema/service/session/audit implementation. D-011 authorizes a bounded
T14 truth/integrity slice and preserves the Public visual identity. Neither decision changes current
runtime boundaries.

## 1. Executive Summary

The current monolith remains an appropriate implementation shape, but D-001=C raises the operational requirements imposed on it. Express/Socket.IO is the boundary for public, admin, sender, and TTN traffic; PostgreSQL/PostGIS owns durable operational and research records; Redis owns transient canonical state, caches, throttles, and Socket.IO fan-out. Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and LoRaWAN/Gateway/TTN/Webhook remain distinct acquisition paths that converge on one normalization/canonical-selection boundary.

T6/T8 give public consumers one versioned canonical projection: only an authoritative, unexpired live state displays a Marker, contributes to active count, or supplies ETA. This is a local truthfulness correction, not public service-state or operations accountability. T7 adds bounded raw research records, distinct from canonical state and sampled GPSTrack, so raw diagnostics must not leak into public/admin operational projections.

The C-scope architecture still lacks protected history/exception/read models and the Mobile
installation/claim/timeout state machine. D-008 now declares a university-managed single-host,
single-origin logical topology and operations handoff. T9 now statically validates the repository
template, runtime/origin authorities, and runbook; the external runtime remains unvalidated.
T10/T12 supply their bounded route-stop, authorization, Feedback and
safe-view boundaries. None is a reason to split the appropriate monolith into unrelated services.

## 2. Scope and Freshness

This profile covers boundaries, authority, data products, temporal semantics, cache/realtime behavior, and task placement. It does not certify deployment, physical devices, provider behavior, browser runtime, load, or an Android client.

Discovery and Product are revalidated at `1eec866...`. The preceding Architecture baseline was
`82f4d97...`. T9 changes the checked-in topology and architectural authorities but does not change
canonical selection, research capture, relational schema, route-stop ownership, Feedback lifecycle,
or Mobile/ESP32/LoRaWAN acquisition semantics.

Exact changed architecture evidence includes `docker-compose.prod.yml`, `env.production.example`,
`scripts/ci-checks.sh`, `scripts/test-production-topology.mjs`,
`docs/tasks/T9-production-topology-origin-handoff.md`,
`docs/operations/university-server-network-handoff.md`,
`shuttle-tracking-backend/src/config/prisma.ts`, `shuttle-tracking-backend/src/config/redis.ts`,
`shuttle-tracking-backend/src/config/runtime.ts`,
`shuttle-tracking-backend/src/config/validate-runtime.ts`,
`shuttle-tracking-backend/src/middleware/rate-limit.ts`,
`shuttle-tracking-backend/src/server.ts`,
`shuttle-tracking-backend/tests/test_t9_runtime_config.js`,
`shuttle-tracking-web/config/backend.ts`, the changed `LiveMap`, `FeedbackModal`, tracker/socket
hooks and API services, and `shuttle-tracking-web/tests/t9-backend-origin.test.ts`; current
predecessor/decision records changed as listed in the evidence scope. Focused backend, frontend
(5/5), and static topology checks pass. They prove repository composition and pure configuration
behavior only, not TLS, forwarded-hop behavior, recovery, capacity, deployment, or Android behavior.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Vehicle and source identity were conflated | Resolved | TrackingSource remains independent of Vehicle, with source type, binding, priority, credential version, and source reference on sampled history. Public canonical projection omits internal source identity. |
| Trip lifecycle lacked one owner | Resolved | operations.service.ts owns start/virtual-start, active-trip validation, end, vehicle repair, and sampled-history transaction behavior. Future timeout/force-close must extend this authority, not create controller-side writers. |
| Canonical current state was untyped/consumer-owned | Resolved | canonical-state.service.ts owns the V1 envelope, route authority, freshness, epoch/version, REST projection, and Socket.IO publication; T8 consumes that contract and rejects older state. |
| Raw diagnostics and temporal semantics were absent | Partially Resolved | T7 records bounded raw research observations with session, source, transport, receive/process/event-time, sequence/deduplication and disposition fields. Physical producer-clock quality and operational high-fidelity replay remain unverified/out of scope. |
| Redis current state is durable truth | Still Present | Redis current state/version allocation remains transient. PostgreSQL holds sampled canonical history and separate research evidence, not durable recovery/replay for public live state. |
| Route-stop cache ownership is incomplete | Resolved | T10 provides bounded active-membership validation, contiguous ordered replacement in one Prisma transaction, and post-success shared public-cache invalidation; legacy create/delete use the same invalidator. Deterministic tests/CI cover the pure boundary, not a stateful cache/DB runtime. |
| Realtime fan-out/scaling is proven | Unable to Verify | The Redis adapter exists, but publication is global and no rooms, replay, load threshold, or fan-out measurement is evidenced. |
| Public/admin service-state behavior is an operational contract | Partially Resolved | Canonical state distinguishes live, stale, no_service, and unknown; T8 keeps public projection coherent. C-scope user-facing wording, history, exception handling, and ownership are not implemented. |
| Production topology and REST/Socket origin authority were unresolved | Partially Resolved | T9 establishes one checked-in university topology, one fail-closed backend runtime parser, and one frontend REST/Socket origin resolver with deterministic tests. Actual reverse proxy, TLS, data-service exposure, restart, recovery, and capacity remain Unable to Verify externally. |

## 4. Data Products and Authority

| Data product | Authoritative boundary | Required separation |
|---|---|---|
| Latest per-source observation | Redis source snapshot | Transient input to canonical selection; not research history or public state. |
| Canonical current vehicle state | Redis versioned canonical envelope | Only public/admin realtime/initial-state projection; server receive time is freshness clock. |
| Canonical trip history | PostgreSQL/PostGIS GPSTrack through Operations | Sampled operational history; does not become raw research replay. |
| Bounded raw diagnostics and aggregates | T7 PostgreSQL research schema/services | Authenticated research-only surface, session/protocol/versioned; never public projection. |
| Route/stop data | PostgreSQL plus public Redis caches | T10 mutates ordered data transactionally and invalidates public cache after success. |
| Feedback triage | PostgreSQL Feedback plus content-free audit events | T12 implements the D-009 lifecycle/retention/access policy at a server-authorized boundary; runtime execution remains unverified. |

## 5. Required C-scope Placement

- T9: repository configuration now implements the one university-managed origin, private data
  network, loopback app bindings, runtime validation, and application/Server-Network handoff. Keep
  REST and Socket.IO behind one TLS proxy and stop before external operations unless named owners
  and an approved target are available.
- T10: complete for its exact composition/invalidation scope. A future audit must retain the invariant that the public read consumes the changed authoritative sequence rather than treating cache invalidation as a production proof.
- T11: extend the Operations/lifecycle authority and supporting schema/auth boundaries for receipt-time lastAcceptedAt, 10-minute timeout, no-reopen, Mobile installation/claim, revocation, audit, protected history, and exceptions. The pinned Android client is an external consumer that must migrate in coordination with the versioned contract. D-012 general lifecycle policy remains outside T11.
- T12: D-009 resolves feedback privacy/retention/triage/deletion and read-only device-view policy. Its feedback and source/device views must remain separate from raw research data and privileged actions, with server role/re-authentication enforcement.

## 6. Risks and Recommendations

1. Define Redis-loss/degraded and recovery behavior before a production claim; the current model cannot recreate a durable current-state/version stream from PostgreSQL.
2. Keep timeout execution serialized with sender observations and administrative recovery in the same lifecycle transaction/locking order. Rejected/post-close observations must not advance lastAcceptedAt.
3. Preserve the implemented reusable `ADMIN` < `SUPER_ADMIN` < `DEV` authorization and fresh-auth
   boundary; apply approved D-012 only through an exact general lifecycle handoff.
4. Preserve T10's explicit cache invalidation and add its stateful public-read proof only on an approved disposable target; do not fall back to TTL semantics.
5. Preserve the no-raw-public invariant; research data requires distinct authentication and provenance/retention semantics.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff under D-008. T10/T12 are complete for their
bounded handoffs. T11 needs focused technical and external Android evidence. Production operations,
runtime retention, capacity and external-device facts remain open; no new owner decision is proposed.

Confidence is High for code-visible authority and missing boundaries, Medium for T8 local projection because deterministic and isolated-browser tests exist, and Low for distributed recovery, deployment, load, hardware, provider, Android, and real operations outcomes.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed. D-011 and D-012 are approved and constrain only their stated
UX-order and general account/source lifecycle work; external T9/Mobile acceptance remains evidence,
not a policy choice to infer.

Backend, Frontend, and Database completed their independent T9 revalidations using this Architecture
baseline, and every downstream profile is current. None promotes a policy direction or simulator
into implementation or runtime evidence.

## 9. T12 Implementation Re-audit — 2026-08-01

**Finding: administrative identity had no role/re-authentication boundary — Partially Resolved.** A
single typed role module now forms the D-007 hierarchy. The administrative authentication middleware
verifies a non-sender token, obtains the current User role, rejects unknown/deleted accounts, and
attaches a typed principal. Sensitive Feedback delete/restore adds a 15-minute signed fresh-auth
boundary. This avoids token-role staleness and does not create a parallel identity system; general
account lifecycle/password management remains intentionally outside T12.

**Finding: feedback had no isolated lifecycle/data product — Resolved for the bounded T12 design.**
Feedback case state, responsible actor, deletion/restore fields, and independent content-free audit
events are additive operational records. Retention is a separate idempotent service; it does not
affect canonical, sampled trip, raw research, or public location data. The code has no external
scheduler owner/topology proof, so runtime scheduling remains an operations constraint rather than an
architecture completion claim.
