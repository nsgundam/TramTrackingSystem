# Product Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Accepted T14 application baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`
- Evidence scope: `PRODUCT.md`, `docs/project-knowledge-base.md`, `docs/decision-queue.md`,
  `docs/tasks/M-20260812-02-admin-role-migration-safety.md`,
  `shuttle-tracking-backend/prisma/migrations/20260801110000_feedback_triage_roles/migration.sql`,
  `shuttle-tracking-backend/tests/test_t12_feedback_identity.js`,
  `docs/tasks/T14-*.md`, Public/Admin journeys under `shuttle-tracking-web/app/` and
  `shuttle-tracking-web/components/`, and their browser tests under `shuttle-tracking-web/tests/`
- Reviewed at: `2026-08-13T21:51:09+07:00`
- Validation state: **Validated**
- Re-audit purpose: M-20260812-02 Product compatibility over source `71f2002` and completion evidence
  `9323afc`; accepted T14 application behavior remains `5955b7a`.
- Predecessor baselines: `docs/project-knowledge-base.md` (R1) validated over
  `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Owner-decision overlay: the user's 2026-08-12 Plan v1 approval, S14 move, and Frontend-team OSM
  assignment are owner authority recorded in current coordination, not source behavior at `531ec9e`.
- Separate Maintenance: `M-20260812-01` is accepted at source `cdd69f8`; it changes the Admin entry
  journey without entering the accepted T14 application baseline.
- Bounded S15 source: `5955b7a` changes only Admin Feedback/route-order mutation progress,
  recovery, and completion behavior. Full CI and exact held-request evidence are recorded in
  `docs/tasks/T14-admin-operational-mutation-integrity.md`.
- Bounded M-02 source: `71f2002` changes only SQL transaction/order and the deterministic identity
  test. It adds no route, UI, role policy, request/response, schema shape, or product capability;
  ADMIN active Feedback read-only access remains approved but unimplemented.

## 1. Current product state

The product has a canonical-only Public rider tracker, an authenticated Admin operations/master-data
workspace, protected research APIs without a Research UI, and separate Mobile, ESP32/HTTP,
LoRaWAN/TTN, and simulator sender boundaries. Thirteen bounded T14 outcomes are accepted:
`T14-S01` through `T14-S11`, `T14-S13`, and `T14-S15`. Those outcomes materially improved truthful state,
keyboard/dialog behavior, map quality, contrast, Admin hierarchy, mutation recovery, shared browser
transport mechanics, and session-hydration truth.

S15 is now product-validated at source `5955b7a`: Feedback note/status and route-order publish issue
one request, expose scoped progress, retain failure/retry state, and announce completion without
changing capability, payload, roles, or sensitive recovery policy. The owner's subsequent
2026-08-13 decision to grant `ADMIN` a read-only active Feedback view is a separate authorization
unit and is not inferred into this S15 delta.

The accepted T14 result is not a production or human-usability acceptance. D-001=C remains blocked
by supported sender/trip operations, deployment/operations, physical-device/provider evidence,
runtime data-lifecycle proof, and human/assistive-technology evidence.

Authenticated `/admin` now redirects to `/admin/dashboard` through accepted Maintenance
`M-20260812-01`, with deterministic successful-session and protected-route evidence. This resolves
the separate entry defect without absorbing it into T14.

## 2. Roles and journeys

| Audience / journey | Current state | Remaining owner |
|---|---|---|
| Rider selects route, sees stops/live vehicles/ETA, and recovers from bounded client-known failures | Implemented with synthetic source/browser evidence; human, device, deployed recovery, and provider acceptance are absent | T14 only for a genuinely bounded residual UI defect; external acceptance otherwise |
| Rider submits Feedback | Implemented with verified supplied vehicle identity and truthful load/error/empty state | Optional no-vehicle/general Feedback is Moved outside T14 and requires later Product/Data/Privacy synthesis |
| Admin maintains vehicles/routes/stops/route order | Implemented with truthful read/mutation state and deterministic browser contracts | Runtime database/cache and staff acceptance are external evidence |
| Admin monitors current service and source health | Partial | T11 owns history, timeout exceptions, sender claim/revocation, and audited recovery actions |
| Super Admin/Dev triages Feedback | Implemented with S15 guarded mutation source/test evidence | Migration, retention/purge, backup, multi-instance scheduling, and staff/rider acceptance remain rollout evidence |
| Admin reads active Feedback without mutation authority | Owner-approved on 2026-08-13; current source still denies access | Separate exact-path Product/Security Maintenance: active non-deleted list including existing internal-note text is readable; status/note mutation, delete/restore, and deleted/recovery reads remain privileged |
| Researcher compares physical sources | APIs/data definitions are partial; UI and field evidence are absent | T15 after T13 and physical/provider facts |
| General account/source lifecycle | Policy approved, implementation absent | D-012/later Roadmap task, explicitly outside T14 |

## 3. Product finding disposition for T14 planning

| Finding | State | T14 planning disposition |
|---|---|---|
| Public stop imagery has no deterministic loading/error fallback and its raw images omit intrinsic dimensions/lazy loading | Still Present | **Approved T14-S17**, with Public fallback authority granted and exact handoff still required |
| Current OSM Standard raster use requires visible OpenStreetMap credit | Still Present | **Removed from T14** by the owner's 2026-08-12 cancellation. Before production, separately stop using the basemap/provider or authorize a compliant provider/licence outcome. |
| Feedback must always require a vehicle | Still Present | **Outside T14 / S14 Moved**; the incumbent verified supplied-vehicle contract remains unchanged in this batch |
| Admin timestamps have inconsistent locale/time-zone/invalid-value behavior | Still Present | **Approved T14-S16** under the recorded en-GB, 24-hour Asia/Bangkok, visible ICT, safe-fallback, domain-only-Never policy |
| Non-sensitive Feedback updates and route-order publish lack the full pending/completion semantics used by accepted Admin mutation journeys | Resolved | **T14-S15 validated at `5955b7a` for exact local source/browser scope**: synchronous guards, scoped locks, retained safe retry, exact payloads, polite receipts, focus, and synthetic 390 px viewport/no-overflow evidence pass |
| ADMIN read-only active Feedback access | New Finding | Owner-approved policy is not implemented at `5955b7a`; use a separate exact-path Product/Security implementation and do not reopen or expand S15 |
| Admin remote icon, global Material Symbols, and design-sidecar drift | Still Present | **Maintenance** for bounded dependency/documentation hygiene, not new product capability |
| Automatic dark Admin theme | No Longer Relevant | **Removed** because it contradicts fixed-light Signal Lens direction |
| General Public redesign or unlimited Admin polish | No Longer Relevant | **Removed** because it contradicts D-011 and bounded T14 |
| Research Dashboard | Still Present | Missing and release-relevant; owned by **T15**, not T14 |
| Sender claim, timeout, protected history, exceptions, and recovery | Still Present | Missing and release-critical; owned by **T11**, not T14 |
| Account/Sender/deletion/backup lifecycle controls | Still Present | Approved policy remains unimplemented; **D-012/later Roadmap task** |
| Human, assistive-technology, deployed, provider, load, and physical-device proof | Unable to Verify | **External evidence**, not repository source slices |

No accepted-outcome T14 regression is established at the immutable research baseline. The separate
`/admin` defect is correctly owned by Maintenance.

## 4. Approved owner choices

1. **Public Feedback scope:** S14 is Moved outside T14; the incumbent vehicle association remains
   required in this batch.
2. **Timestamp policy:** use en-GB, 24-hour Asia/Bangkok with visible ICT, `Unavailable` for missing
   or malformed values, and `Never` only for a domain-confirmed never-seen source.
3. **Public stop-image fallback:** bounded visible fallback/loading behavior may change while Public
   identity and successful layout remain fixed.
4. **ADMIN Feedback read-only refinement:** ADMIN may read active Feedback and existing internal note
   text, but may not read deleted/recovery records or change notes/status, delete, or restore. This
   2026-08-13 authority requires a separate handoff and is not S15 source behavior.

The OSM choice is no longer pending for T14: the owner removed it. The unresolved current-provider
risk stays visible in Production Readiness rather than being converted into another T14 task.

These choices authorize the Plan v1 outcomes, not source by themselves; each unit still needs its
committed exact-path handoff.

## 5. Evidence limits and confidence

Confidence is High for repository-visible routes, roles, S15's retained exact local outcome, and
missing T11/T15/D-012 capabilities; Medium for synthetic browser behavior; and Low for human
comprehension, assistive technology, deployed service behavior, provider policy enforcement,
device/field performance, and operations. This Product re-audit validates M-02 compatibility while
retaining S15 behavior; it does not accept deployment, human/AT outcomes, or the later ADMIN
read-only policy implementation.
