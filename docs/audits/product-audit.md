# Product Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`
- Accepted T14 application baseline: `c72feb90e7a35da45d82bac61eb927ab7c55a37c`
- Evidence scope: `PRODUCT.md`, `docs/project-knowledge-base.md`, `docs/decision-queue.md`,
  `docs/tasks/T14-*.md`, Public/Admin journeys under `shuttle-tracking-web/app/` and
  `shuttle-tracking-web/components/`, and their browser tests under `shuttle-tracking-web/tests/`
- Reviewed at: `2026-08-13T19:03:20+07:00`
- Validation state: **Validated**
- Re-audit purpose: T14-S15 Level 1 Product acceptance over source `5955b7a` and completion evidence
  `caf913d`.
- Predecessor baselines: `docs/project-knowledge-base.md` (R1) validated over
  `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Owner-decision overlay: the user's 2026-08-12 Plan v1 approval, S14 move, and Frontend-team OSM
  assignment are owner authority recorded in current coordination, not source behavior at `531ec9e`.
- Separate Maintenance: `M-20260812-01` is accepted at source `cdd69f8`; it changes the Admin entry
  journey without entering the accepted T14 application baseline.
- Bounded S15 source: `5955b7a` changes only Admin Feedback/route-order mutation progress,
  recovery, and completion behavior. Full CI and exact held-request evidence are recorded in
  `docs/tasks/T14-admin-operational-mutation-integrity.md`.

## 1. Current product state

The product has a canonical-only Public rider tracker, an authenticated Admin operations/master-data
workspace, protected research APIs without a Research UI, and separate Mobile, ESP32/HTTP,
LoRaWAN/TTN, and simulator sender boundaries. Twelve bounded T14 outcomes are accepted:
`T14-S01` through `T14-S11` plus `T14-S13`. Those outcomes materially improved truthful state,
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
| Admin reads active Feedback without mutation authority | Owner-approved on 2026-08-13; current source still denies access | Separate exact-path Product/Security Maintenance; active list only, with note/status/delete/restore and deleted recovery remaining privileged |
| Researcher compares physical sources | APIs/data definitions are partial; UI and field evidence are absent | T15 after T13 and physical/provider facts |
| General account/source lifecycle | Policy approved, implementation absent | D-012/later Roadmap task, explicitly outside T14 |

## 3. Product finding disposition for T14 planning

| Finding | State | T14 planning disposition |
|---|---|---|
| Public stop imagery has no deterministic loading/error fallback and its raw images omit intrinsic dimensions/lazy loading | Still present | **Approved T14-S17**, with Public fallback authority granted and exact handoff still required |
| Current OSM Standard raster use requires visible OpenStreetMap credit | Still present, but owner cancelled S12 on 2026-08-12 | **Removed from T14**. Before production, separately stop using the basemap/provider or authorize a compliant provider/licence outcome. |
| Feedback must always require a vehicle | S14 Moved | **Outside T14**; the incumbent verified supplied-vehicle contract remains unchanged in this batch |
| Admin timestamps have inconsistent locale/time-zone/invalid-value behavior | Policy approved | **Approved T14-S16**: en-GB, 24-hour Asia/Bangkok, visible ICT, safe fallback, domain-only Never |
| Non-sensitive Feedback updates and route-order publish lack the full pending/completion semantics used by accepted Admin mutation journeys | **Resolved for exact local source/browser scope at `5955b7a`** | **T14-S15 validated**: synchronous guards, scoped locks, retained safe retry, exact payloads, polite receipts, focus, and synthetic 390 px viewport/no-overflow evidence pass |
| ADMIN read-only active Feedback access | New finding: owner-approved policy is not implemented at `5955b7a` | Separate exact-path Product/Security implementation; do not reopen or expand S15 |
| Admin remote icon, global Material Symbols, and design-sidecar drift | Bounded dependency/documentation hygiene | **Maintenance**, not new product capability |
| Automatic dark Admin theme | Contradicts fixed-light Signal Lens direction | **Removed** |
| General Public redesign or unlimited Admin polish | Contradicts D-011 and bounded T14 | **Removed** |
| Research Dashboard | Missing and release-relevant, but not T14 | **T15** |
| Sender claim, timeout, protected history, exceptions, and recovery | Missing and release-critical, but not T14 | **T11** |
| Account/Sender/deletion/backup lifecycle controls | Approved policy, unimplemented | **D-012/later Roadmap task** |
| Human, assistive-technology, deployed, provider, load, and physical-device proof | Unavailable | **External evidence**, not repository source slices |

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

Confidence is High for repository-visible routes, roles, S15's exact local outcome, and missing T11/T15/
D-012 capabilities; Medium for synthetic browser behavior; and Low for human comprehension,
assistive technology, deployed service behavior, provider policy enforcement, device/field
performance, and operations. This Product re-audit accepts S15's observable behavior only; it does
not accept deployment, human/AT outcomes, or the later ADMIN read-only policy implementation.
