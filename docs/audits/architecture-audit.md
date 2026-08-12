# Architecture Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 9ff7e85b19bcbe17b6d810451904c0f981cb0571
- Evidence scope: PRODUCT.md, docs/project-knowledge-base.md, docs/audits/product-audit.md,
  DESIGN.md, .impeccable/design.json,
  docs/decision-queue.md, docs/research/, docs/tasks/, docs/operations/, README.md,
  Compose/environment configuration and scripts, shuttle-tracking-backend/src/,
  shuttle-tracking-backend/prisma/, shuttle-tracking-backend/tests/,
  shuttle-tracking-web/config/, shuttle-tracking-web/hooks/, shuttle-tracking-web/utils/,
  shuttle-tracking-web/types/, shuttle-tracking-web/services/,
  shuttle-tracking-web/components/, shuttle-tracking-web/tests/, and the T11 v3 external Mobile
  compatibility brief
- Reviewed at: 2026-08-12T19:14:00+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md @ 1eec866b986b4cb4e802f7a48fac93e54e780699;
  docs/audits/product-audit.md @ 9ff7e85b19bcbe17b6d810451904c0f981cb0571

## 2026-08-12 T14-S13 Admin Feedback session-hydration architecture re-audit

Discovery remains validated at `1eec866...`; Product is validated at evidence baseline `9ff7e85`.
The Architecture-relevant application delta from accepted source `70f42c1` to application-source
baseline `c72feb9` is exactly the Admin Feedback page plus its deterministic browser specification,
with completion record `9a9cf5c`. The twelfth accepted T14 source slice
(`T14-S01` through `T14-S11` plus `T14-S13`) is **Complete for its exact frontend architecture
contract**; deferred `T14-S12` is not renumbered or accepted.

`AuthContext` and `GET auth/me` remain the unchanged session/role authority. The page consumes the
existing `isLoading` projection, prevents its privileged read effect until a non-null server-returned
`SUPER_ADMIN`/`DEV` role exists, and separates temporary session absence from final role denial. It
does not become an authorization boundary, add a timeout or fallback role, or move API/proxy,
backend, schema, persistence, Login, Public, or Feedback mutation authority.

| Current Architecture finding | State | Evidence and implication |
|---|---|---|
| Temporary session absence could become final access projection and premature data flow | Resolved | For bounded local source/browser evidence, the held-auth guard failed before source and now proves neutral pending state, zero privileged reads, exact post-resolution reads, and unchanged final `ADMIN` denial. |
| Public/Admin service-state behavior is an operational contract | Partially Resolved | This page now projects auth hydration truthfully; history, actionable exceptions, causal diagnosis, general account/session lifecycle, and deployed recovery remain incomplete. |

Focused hydration 1/1, full operations 6/6, Login regression 5/5, accessibility 4/4, Dashboard 2/2,
lint/build, detector `[]`, full CI, and two finish reviews pass. Preserve the architectural rule that
privileged reads require a resolved server-returned privileged role; a transient `user === null`
must not be interpreted as authorization denial. No successful credential Login, human/AT,
deployed, security, or release claim is added. No new owner decision is needed to accept `T14-S13`;
the separate `T14-S14` proposal remains blocked by the pending D-011/Public-UI choice at `9ff7e85`.
Frontend may consume this baseline; the unrelated migration remains excluded.

## T14 Re-audit Provenance

Superseded per-slice narratives were compacted on 2026-08-12. The current finding dispositions and
domain analysis below remain authoritative. Stable slice IDs and H/S/C/R provenance live in
`docs/roadmap/T14-scope-and-closure-ledger.md`; exact implementation and validation evidence stays
in the committed `docs/tasks/T14-*.md` records and Git history. This structural compaction changes
no evidence baseline, finding state, score, release determination, or owner decision.

## 1. Executive Summary

The current monolith remains an appropriate implementation shape, but D-001=C raises the operational requirements imposed on it. Express/Socket.IO is the boundary for public, admin, sender, and TTN traffic; PostgreSQL/PostGIS owns durable operational and research records; Redis owns transient canonical state, caches, throttles, and Socket.IO fan-out. Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and LoRaWAN/Gateway/TTN/Webhook remain distinct acquisition paths that converge on one normalization/canonical-selection boundary.

T6/T8 give public consumers one versioned canonical projection: only an authoritative, unexpired live state displays a Marker, contributes to active count, or supplies ETA. This is a local truthfulness correction, not public service-state or operations accountability. T7 adds bounded raw research records, distinct from canonical state and sampled GPSTrack, so raw diagnostics must not leak into public/admin operational projections.

The C-scope architecture still lacks protected history/exception/read models and the Mobile
installation/claim/timeout state machine. D-008 now declares a university-managed single-host,
single-origin logical topology and operations handoff. T9 now statically validates the repository
template, runtime/origin authorities, and runbook; the external runtime remains unvalidated.
T10/T12 supply their bounded route-stop, authorization, Feedback and
safe-view boundaries. None is a reason to split the appropriate monolith into unrelated services.
T14 now also centralizes repeated Admin master-data presentation and dialog focus structure while
leaving each request, DTO, authorization, and mutation contract at its incumbent boundary. Source
Health and Feedback now consume the same presentation/focus vocabulary without moving their T12
safe-field, role, lifecycle, or request authority. Owner refinement `a0a0ce1` now requires those
shared presentation boundaries to consume one bright-neutral Admin Liquid Glass material/token
foundation; `c4fdc3a` implements it without moving domain or request ownership.
Source baseline `e6a04ad` now replaces the three page-local native mutation recovery paths with one typed
feedback/confirmation composition while resource pages retain endpoint, target, DTO, refresh, and
pending-state ownership. The shared confirmation identifies the immutable target visually and in
its accessible description.
Source baseline `70f42c1` now supplies one browser Socket.IO transport/listener implementation
boundary for the Public tracker hook and Admin LiveMap. Each consumer retains its own lifecycle
instance plus structural validation, canonical state/version, snapshot/hydration, queue, map, Retry,
and expiry authority.
Application-source baseline `c72feb9` then makes Admin Feedback session hydration explicit without
moving session, role, request, or backend authority: the page prevents privileged reads while
`AuthContext` is unresolved, renders a neutral pending projection, and preserves the resolved
`SUPER_ADMIN`/`DEV` inbox plus final `ADMIN` denial. Coordination evidence through `9ff7e85` adds no
application delta; it records that the separate `T14-S14` proposal remains owner-gated.

## 2. Scope and Freshness

This profile covers boundaries, authority, data products, temporal semantics, cache/realtime
behavior, and task placement. It does not certify deployment, physical devices, provider behavior,
deployed browser runtime, human behavior, load, or an Android client.

Discovery remains current at `1eec866...`; Product is revalidated at evidence baseline `9ff7e85`,
and the preceding accepted application-source baseline was `70f42c1`. Exact changed application
evidence is `docs/tasks/T14-admin-feedback-session-hydration-truth-state.md`,
`shuttle-tracking-web/app/admin/feedback/page.tsx`,
`shuttle-tracking-web/tests/t14-admin-operations-support.spec.ts`, and completion record `9a9cf5c`.
Existing T9 topology, canonical selection, research capture, relational schema, route-stop mutation/
cache ownership, Feedback lifecycle, and Mobile/ESP32/LoRaWAN acquisition semantics are unchanged.
The exact two-file application delta at `c72feb9` supplies isolated browser evidence but no TLS,
recovery, capacity, deployment, device, Android, ambient data-target, human, or deployed-runtime
proof. Evidence baseline `9ff7e85` additionally records only the pending `T14-S14` owner gate.
The valid Discovery commit `1eec866b986b4cb4e802f7a48fac93e54e780699` is an ancestor of
`9ff7e85`; the bounded application change remains the two-file source/test commit `c72feb9`.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Temporary session absence could become final Admin Feedback access projection and premature data flow | Resolved | The held-auth browser guard proves a neutral pending projection with zero privileged reads, followed by exact reads only after a server-returned privileged role resolves; final `ADMIN` denial remains unchanged. |
| Public/Admin browser Socket.IO lifecycle implementation was duplicated and could drift | Resolved | `browserSocketLifecycle.ts` is the sole scoped production transport/listener implementation owner; Public/Admin retain separate instances and all structural-validation/canonical/UI authority. |
| Vehicle and source identity were conflated | Resolved | TrackingSource remains independent of Vehicle, with source type, binding, priority, credential version, and source reference on sampled history. Public canonical projection omits internal source identity. |
| Trip lifecycle lacked one owner | Resolved | operations.service.ts owns start/virtual-start, active-trip validation, end, vehicle repair, and sampled-history transaction behavior. Future timeout/force-close must extend this authority, not create controller-side writers. |
| Canonical current state was untyped/consumer-owned | Resolved | canonical-state.service.ts owns the V1 envelope, route authority, freshness, epoch/version, REST projection, and Socket.IO publication; T8 consumes that contract and rejects older state. |
| Raw diagnostics and temporal semantics were absent | Partially Resolved | T7 records bounded raw research observations with session, source, transport, receive/process/event-time, sequence/deduplication and disposition fields. Physical producer-clock quality and operational high-fidelity replay remain unverified/out of scope. |
| Redis current state is durable truth | Still Present | Redis current state/version allocation remains transient. PostgreSQL holds sampled canonical history and separate research evidence, not durable recovery/replay for public live state. |
| Route-stop cache ownership is incomplete | Resolved | T10 provides bounded active-membership validation, contiguous ordered replacement in one Prisma transaction, and post-success shared public-cache invalidation; legacy create/delete use the same invalidator. Deterministic tests/CI cover the pure boundary, not a stateful cache/DB runtime. |
| Realtime fan-out/scaling is proven | Unable to Verify | The Redis adapter exists, but publication is global and no rooms, replay, load threshold, or fan-out measurement is evidenced. |
| Public/admin service-state behavior is an operational contract | Partially Resolved | Canonical state distinguishes live, stale, no_service, and unknown; T8 keeps Public projection coherent; T14 now projects truthful Public snapshot/connection/service guidance plus Admin snapshot/realtime/local-expiry, Source Health/Feedback failure/retry/verified-empty state, and neutral Feedback auth hydration. History, actionable exceptions, unavailable causal diagnosis, deployed recovery, and operational ownership remain incomplete. |
| Production topology and REST/Socket origin authority were unresolved | Partially Resolved | T9 establishes one checked-in university topology, one fail-closed backend runtime parser, and one frontend REST/Socket origin resolver with deterministic tests. Actual reverse proxy, TLS, data-service exposure, restart, recovery, and capacity remain Unable to Verify externally. |
| Shared Admin material/Login presentation authority was absent | Resolved | `c4fdc3a` remains the one fixed-light Signal Lens authority; mutation receipts/errors use opaque operational tiers and confirmation reuses shared glass modal chrome. |
| Login rejection shared protected-route redirect behavior | Resolved | Login source is unchanged; the exact rejected-request exception and protected-route redirect remain independently covered. |
| Native/page-local mutation feedback lacked one shared semantic presentation/focus boundary | Resolved | `AdminMutationFeedback` owns narrowed error/receipt/confirmation presentation, including visible/accessibly described immutable target identity, while resource pages retain request, pending state, and DTO authority. |

## 4. Data Products and Authority

| Data product | Authoritative boundary | Required separation |
|---|---|---|
| Latest per-source observation | Redis source snapshot | Transient input to canonical selection; not research history or public state. |
| Canonical current vehicle state | Redis versioned canonical envelope | Only public/admin realtime/initial-state projection; server receive time is freshness clock. |
| Canonical trip history | PostgreSQL/PostGIS GPSTrack through Operations | Sampled operational history; does not become raw research replay. |
| Bounded raw diagnostics and aggregates | T7 PostgreSQL research schema/services | Authenticated research-only surface, session/protocol/versioned; never public projection. |
| Route/stop data | PostgreSQL plus public Redis caches | T10 mutates ordered data transactionally and invalidates public cache after success. |
| Feedback triage | PostgreSQL Feedback plus content-free audit events | T12 implements the D-009 lifecycle/retention/access policy at a server-authorized boundary; T14-S13 prevents client reads before that server-returned privileged role resolves. Runtime execution remains unverified. |

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
6. Preserve the shared browser transport boundary without turning it into a global connection or
   canonical-state store; consumer-specific validation and reconciliation remain intentional.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff under D-008. T10/T12 are complete for their
bounded handoffs. T14 has twelve accepted source IDs: `T14-S01` through `T14-S11` plus `T14-S13`.
The Admin Feedback hydration slice is complete for this Architecture source/browser-regression
contract at application-source baseline `c72feb9`; `T14-S12` remains deferred and is not counted.
`T14-S14` remains Proposed and blocked on the pending D-011/Public-UI choice at `9ff7e85`.
T11 still needs focused technical and external Android evidence;
Research remains blocked on T13.
Production operations, runtime retention, capacity and external-device facts remain open; no new
owner decision is needed to accept `T14-S13`.

Confidence is High for code-visible authority, display-color ownership, and missing boundaries;
Medium for synthetic request/viewport/motion/contrast behavior; and Low for assistive technology,
distributed recovery, deployment, load, hardware, provider, Android, and operations.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is needed to accept `T14-S13`. The separate `T14-S14` proposal has no source
handoff and remains blocked on the pending D-011/Public-UI choice recorded at `9ff7e85`; that choice
must not be inferred from this re-audit. D-012 continues to constrain only its stated general
account/source lifecycle work, while external T9/Mobile acceptance remains evidence rather than a
policy choice.

Frontend and downstream profiles consume evidence baseline `9ff7e85` and application-source
baseline `c72feb9`. Backend and Database remain current at `1eec866...` because T14-S13 changes no
runtime API, schema, or persistence authority. The canonical T14 ledger now owns the single finite
closure decision; no further source continuation is eligible unless the owner revises that package.
None of this evidence promotes a visual direction or browser fixture into assistive-technology,
device, or runtime proof.

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
