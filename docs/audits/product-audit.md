# Product Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `9ff7e85b19bcbe17b6d810451904c0f981cb0571`
- Evidence scope: `PRODUCT.md`, `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/`,
  `DESIGN.md`, `.impeccable/design.json`,
  `docs/tasks/T14-admin-liquid-glass-foundation.md`,
  `docs/tasks/T14-admin-master-data-mutation-feedback.md`,
  `docs/tasks/T14-shared-browser-socket-lifecycle.md`,
  `docs/tasks/T14-admin-feedback-session-hydration-truth-state.md`,
  `docs/tasks/T9-production-topology-origin-handoff.md`,
  `docs/operations/university-server-network-handoff.md`, `README.md`,
  `shuttle-tracking-web/app/`, `shuttle-tracking-web/components/`,
  `shuttle-tracking-web/config/`, `shuttle-tracking-web/services/`,
  `shuttle-tracking-web/contexts/`, `shuttle-tracking-web/hooks/`,
  `shuttle-tracking-web/utils/`, `shuttle-tracking-web/tests/`,
  `shuttle-tracking-web/package.json`, `shuttle-tracking-web/simulate.js`,
  `shuttle-tracking-web/simulate-manual.js`, `shuttle-tracking-backend/src/routes/`,
  `shuttle-tracking-backend/src/controllers/`, `shuttle-tracking-backend/src/services/`,
  `shuttle-tracking-backend/prisma/`, `shuttle-tracking-backend/tests/`, and
  `docs/audits/specialized/T11-mobile-repository-compatibility-v3.md`
- Reviewed at: `2026-08-12T19:13:00+07:00`
- Validation state: `Validated`
- Predecessor baselines: `docs/project-knowledge-base.md @ 1eec866b986b4cb4e802f7a48fac93e54e780699`

## 2026-08-12 T14-S13 Admin Feedback session-hydration Product re-audit

Discovery remains validated at `1eec866b986b4cb4e802f7a48fac93e54e780699`. Product-relevant
application evidence changes from accepted source `70f42c1` only in the Admin Feedback page and its
operations-support browser specification. Completion record `9a9cf5c` maps the exact task,
measurement-first failure, final checks, and evidence limits. Application-source baseline
`c72feb90e7a35da45d82bac61eb927ab7c55a37c` is
**Complete for the bounded Product truth-state contract** and becomes the twelfth accepted T14
source slice: accepted IDs are `T14-S01` through `T14-S11` plus `T14-S13`; `T14-S12` remains
owner-deferred.

While the existing `GET auth/me` session request is unresolved, Feedback now projects one neutral
polite verification status instead of a final role-denial alert and issues no privileged Feedback
read. After the server-returned role resolves, `SUPER_ADMIN`/`DEV` retain the exact inbox and
`ADMIN` retains the exact denial with zero Feedback reads. No capability, permission, endpoint,
payload, role, Login source, Public UI, backend, schema, or server-authorization behavior changed.

| Current Product finding | State | Evidence and limit |
|---|---|---|
| Unresolved Admin session was projected as final Feedback role denial | Resolved | For bounded local source/browser evidence, the held-auth measurement failed 1/1 before source; the repaired journey passes 1/1 with no denial/data/read before role resolution and exactly one active plus one deleted read after `SUPER_ADMIN`. |
| Feedback workflow lacks accountable runtime acceptance | Partially Resolved | T12/T14 source/browser behavior, including truthful hydration, exists; migration/retention execution and staff/rider acceptance remain absent. |
| Public/Admin accessibility meets release baseline | Partially Resolved | A truthful polite status and existing browser semantics add bounded evidence; human/assistive-technology acceptance remains unavailable. |

Admin operations support passes 6/6, Admin Liquid Glass/Login 5/5, accessibility 4/4, and Admin
Dashboard 2/2. Lint passes with zero errors and two pre-existing warnings; the 11-route build,
scoped Impeccable detector `[]`, full repository CI, workflow validation, diff check, and two finish
reviews pass. Login evidence remains limited to rejected-request pending/inline recovery, protected
redirect, and material behavior; no successful credential Login/session journey is claimed.

No counted finding closes beyond this concrete subcase: the technical score remains 15/20 with
zero P0, one P1, five P2, and one P3 open. `T14-S14` optional vehicle association is only a proposed
future Product change under the pending D-011/Public-UI confirmation at `9ff7e85`; it is not part of
this source acceptance and authorizes no write. Evidence remains local/synthetic, not human, AT,
device, deployed, security, operations, or release acceptance. Architecture may consume this
validated baseline. The unrelated dirty Feedback-role migration is excluded.

## T14 Re-audit Provenance

Superseded per-slice narratives were compacted on 2026-08-12. The current finding dispositions and
domain analysis below remain authoritative. Stable slice IDs and H/S/C/R provenance live in
`docs/roadmap/T14-scope-and-closure-ledger.md`; exact implementation and validation evidence stays
in the committed `docs/tasks/T14-*.md` records and Git history. This structural compaction changes
no evidence baseline, finding state, score, release determination, or owner decision.

## 1. Executive Summary

The owner has selected D-001=C, a wider public rider release. This changes the product contract: the
existing public tracker and feedback capture cannot be represented as an eligible public service until
route-stop operations, supported sender/trip accountability, actionable exceptions, accountable feedback
triage, and truthful public service states are delivered. D-005=B also makes the 10-minute backend
receipt-time auto-close and its exception/recovery path a required operational outcome, not an optional
enhancement. D-007 defines `DEV` > `SUPER_ADMIN` > `ADMIN`, but the user/account lifecycle and privileged
action controls required to implement that hierarchy remain owner-controlled gaps.

Repository evidence now shows a public map, route/stop/vehicle CRUD, authenticated route-stop
composition, authenticated technical sender contracts, simulators, raw-research APIs, and feedback
submission. The external native driver application now provides only a partially compatible static-
secret path; protected trip/history or exception UI and a Dev
Dashboard remain absent. T12 adds the bounded feedback inbox, privacy notice, and safe
read-only source-health view; it is not a device recovery/operations implementation. The
T8 public-map correction is retained as
**Resolved for its limited truthful-local-state scope**; it does not supply the C-scope operational state
model.

T14 also gives the existing Vehicles, Routes, and Stops journeys one semantic Admin hierarchy,
truthful initial read states, inline Retry, responsive tables/cards, named actions, and shared CRUD/
route-order dialog behavior. This improves maintainability and staff task clarity without changing
the underlying T10/T12 product contracts or completing T11 operations. Source Health and Feedback
Inbox now use that same operations language, truthful failure/empty projection, responsive 44 px
actions, and shared sensitive dialog while retaining the approved T12 policy and request behavior.
Owner refinement `a0a0ce1` selects a premium iOS-inspired Liquid Glass world for Admin, and
`c4fdc3a` implements its explicitly light white/gray foundation plus converged Login presentation.
The first nine accepted T14 slices and all Public/product/API boundaries remain intact; rejected
Login errors now remain inline while protected-route rejection behavior is preserved.
Source baseline `e6a04ad` adds and repairs the tenth bounded journey: master-data create/update/delete now exposes
pending, retained failure/retry, explicit destructive confirmation, and persistent completion state
without changing product capability or request contracts; destructive confirmations include the
selected immutable ID as well as the display name.
Source baseline `70f42c1` adds the eleventh bounded integrity slice: Public and Admin now consume one
browser Socket.IO transport/listener implementation while each retains its product-specific
validation, canonical, hydration, map, queue, Retry, and expiry behavior. Valid journey behavior is
unchanged; events with invalid required structure, coercive enum values, or Public source identity
fail before consumer use.
Application-source baseline `c72feb9` adds `T14-S13`, the twelfth accepted T14 slice by count: the
Admin Feedback page now keeps an unresolved `GET auth/me` session in one neutral verification state,
performs no privileged Feedback read before the server-returned role resolves, and then preserves
the existing privileged inbox or final role denial. The accepted ID set is `T14-S01` through
`T14-S11` plus `T14-S13`; `T14-S12` remains owner-deferred. No capability, role, permission,
endpoint, payload, Public UI, Login source, backend, or schema behavior changed.

T9 does not intentionally change a screen, role, or journey. It replaces the public/admin clients'
multiple fallback origins with one production same-origin-capable REST/Socket authority and adds a
checked-in university deployment handoff. This improves deterministic delivery of existing journeys
but supplies no deployed or human acceptance evidence.

## 2. Scope and Freshness

This re-audit covers the selected rider/Admin/research journeys, role and information boundaries,
approved decisions, exact T14 evidence, and remaining release capabilities. Discovery remains
current at `1eec866...`; the preceding affected Product application-source baseline was `70f42c1`.
The exact `70f42c1..c72feb9` application delta is
`shuttle-tracking-web/app/admin/feedback/page.tsx` and
`shuttle-tracking-web/tests/t14-admin-operations-support.spec.ts`. The exact handoff is
`docs/tasks/T14-admin-feedback-session-hydration-truth-state.md`, and completion record `9a9cf5c`
maps its measurement-first failure, acceptance checks, and evidence limits. Coordination baseline
`9ff7e85` additionally records the pending S14 decision correction; it does not expand the accepted
application delta. No external target, Mobile source, migration, backend/schema contract, role or
permission policy, rendered Public UI, Login source behavior, or Feedback lifecycle/status/delete/
restore policy changed.

This audit revalidates product roles, journeys, release promises, ownership, and roadmap impact. It
does not establish deployment, provider, physical-device, deployed browser-runtime, human, or field-
performance behavior.

The application journeys are unchanged by D-008. Its approved university handoff separates the
application team's deliverables from University Server/Network operations and permits isolated cloud
demo profiles, but it supplies no deployed rider/admin workflow or capacity evidence. No human or
ambient/deployed browser session, installed Android build, ESP32 firmware, TTN deployment, physical
source, or university runtime was observed; isolated Playwright browser evidence is recorded above.

Earlier T9 freshness evidence remains part of the predecessor chain. Its preceding evidence
baseline was `82f4d97...`, and its Product-relevant changed paths were
`docs/project-knowledge-base.md`, `docs/decision-queue.md`,
`docs/tasks/T9-production-topology-origin-handoff.md`,
`docs/operations/university-server-network-handoff.md`,
`shuttle-tracking-backend/tests/test_t9_runtime_config.js`,
`shuttle-tracking-web/components/admin/LiveMap.tsx`,
`shuttle-tracking-web/components/public/FeedbackModal.tsx`,
`shuttle-tracking-web/config/backend.ts`, `shuttle-tracking-web/hooks/useShuttleTracker.ts`,
`shuttle-tracking-web/hooks/useSocketConnection.ts`, `shuttle-tracking-web/package.json`,
`shuttle-tracking-web/services/api.ts`, `shuttle-tracking-web/services/publicApi.ts`, and
`shuttle-tracking-web/tests/t9-backend-origin.test.ts`. The client changes can affect journey reachability,
so they were inspected and the focused frontend T9 tests (5/5) were rerun. They preserve journey
semantics while removing fallback ambiguity. Backend/runtime and handoff evidence affects delivery
ownership only; no external target was operated.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence |
|---|---|---|
| Unresolved Admin session was projected as final Feedback role denial | **Resolved** | In the bounded S13 source/browser contract, held `GET auth/me` projects one neutral polite verification status, performs zero privileged Feedback reads, and exposes neither the inbox nor denial until the server-returned role resolves. |
| Route-stop management UI is missing | **Resolved** | The authenticated Routes page opens `RouteStopsModal`, which loads active/current stops and publishes the ordered list through the bounded replacement API. Deterministic backend and repository-CI evidence passed; no ambient browser/database workflow was run. |
| A supported driver/mobile workflow is missing | **Partially Resolved** | A pinned external native app plus Sender/trip/Socket.IO code now exists, but it implements the current static-secret path rather than T11 enrollment/QR/claim/recovery and has no release/device acceptance artifact. |
| Admin trip history is missing | **Still Present** | No protected list/detail controller, route, page, or exception surface is present. |
| Feedback workflow lacks triage | **Partially Resolved** | T12 implements the approved notice, receipt, Super Admin/Dev inbox, assignment/status flow, delete/restore, and source/test retention contract. T14 now browser-verifies truthful unresolved-session projection with no premature privileged read, final role denial, queue failure/retry, case actions, fresh-auth delete reason, payload-free restore, and sensitive-dialog focus. No staff/rider acceptance, migration, or retention-run evidence exists. |
| Public/Admin keyboard journeys met the release accessibility baseline | **Partially Resolved** | T14 corrects root/dialog/focus/form/Mobile navigation plus measured reduced-motion, touch targets, audited light-surface/route-badge contrast, operations-support actions, mutation confirmation/failure/receipt semantics, and the S13 neutral polite verification status. Broader assistive technology and human acceptance remain unverified. |
| Stale/offline operational visibility is missing | **Partially Resolved** | T8 keeps Marker/count/ETA coherent, and T14 gives Public Availability/StopInfo/ETA/preloader plus the map-first Admin Dashboard and Source Health/Feedback queues truthful connection/freshness/failure/retry states. A T11-backed operations exception/action view and unavailable route/dependency causal contract remain absent. |
| Device operations are incomplete | **Partially Resolved** | T12 provides an all-admin safe read-only source-health API/page; T14 browser-verifies its allowlisted ledger plus failure/retry/verified-empty projection. Credential, assignment, Mobile claim/recovery, revocation, and force-close operations remain absent from the supported UI. |
| Hard-coded public route choice | **No Longer Relevant** | The tracker loads active routes from the public API. Route authority and cache invalidation remain a separate T10 concern. |
| Controlled-demo scope was the release boundary | **No Longer Relevant** | D-001=C supersedes it; the required C-scope capabilities remain unimplemented and block a wider public-service claim. |
| Raw research diagnostics were absent | **Resolved** | T7 provides bounded, protected diagnostics/metrics/export APIs for its approved research scope; it does not create a researcher dashboard or field evidence. |
| Owner-selected Admin visual foundation was absent | **Resolved** | `c4fdc3a` remains the fixed-light white/gray Signal Lens authority; `e6a04ad` reuses its glass and opaque-content tiers. |
| Rejected Login errors could not remain inline | **Resolved** | Login source is unchanged; the exact rejected request, pending/inline error, protected redirect, and material regressions pass 5/5. |
| Native master-data mutation recovery was unsafe and non-semantic | **Resolved** | All three resources now share retained safe inline failure/retry, pending locks, persistent receipts, and a named focus-managed delete confirmation with visible/accessibly described immutable ID and exact requests regression-covered. |

## 4. Journey and Role Assessment

| Journey | State | Evidence-based assessment |
|---|---|---|
| Rider: choose route, inspect stops/vehicles, use ETA | Partial | Public REST, canonical Socket.IO projection, map, stops, and ETA components exist. T8 preserves expiry truth; T14 adds truthful state, canonical last-update age, state-specific recovery/ETA/slow-load guidance, scoped keyboard access, selected-route-only geometry, cancellable/reduced motion, measured 320 px control separation, and governed route-color display. Human/device comprehension and deployed recovery remain unverified. |
| Rider: submit feedback | Partial | `FeedbackModal` has truthful validation/load/retry/success/error, verified explicit vehicle association, programmatic category/form state, and a keyboard-contained/restoring dialog. T12 adds the staff inbox, but no assistive-technology/human acceptance or actual retention evidence exists. |
| ADMIN: maintain routes/stops/vehicles | Partial | The coherent Admin shell and semantic master-data pages expose truthful read state plus pending, retained narrowed failure/retry, named success receipts, and shared focus-managed CRUD/delete/route-stop dialogs on desktop and Mobile. Exact create/update/delete and ordered publish bodies are browser-verified; ambient database/cache published-read and human acceptance remain absent. |
| ADMIN: monitor/send/recover service | Partial | The map-first Dashboard preserves truthful canonical state and links to a safe read-only Source Health ledger with truthful failure/retry/verified-empty state. Active-trip history, timeout exception, Mobile claim/revocation, credential, and force-close journeys remain missing. |
| Driver: select vehicle, start, send, reconnect, end | Partial | The external native app can authenticate, start/end and foreground-send against the old static-secret contract. It cannot perform the approved enrollment/QR/claim/recovery journey and task removal can end tracking without authoritative acknowledgement. |
| SUPER_ADMIN/DEV: privileged data/research operation | Partial | Persisted hierarchy, current-role checks, feedback triage with recent-auth delete/restore, and protected T7 research reads/export are implemented. S13 keeps the unresolved session neutral with zero privileged Feedback reads before the server-returned role resolves. General account/source lifecycle, privileged Trip/GPSTrack controls, a research dashboard, and complete recovery remain gated. |
| Researcher: compare three physical sources | Partially Resolved | T7's protected research APIs and D-004 definitions exist. The Dev Dashboard, ESP32/TTN/mobile field evidence, and metric outcome evidence remain unavailable. |

## 5. Product Requirements and Ownership Gaps

| Required C-scope capability | Outcome/acceptance signal | Owner/policy state |
|---|---|---|
| Route-stop operations (T10) | Admin publishes valid ordered stops; next public read can obtain revised route data. | **Resolved for exact T10 handoff scope**; public cache invalidation is source/test-verified, while ambient runtime/browser evidence is unavailable. |
| Sender, timeout, history, exceptions (T11) | Supported Android/IoT operating paths, protected history, clear timeout/admin recovery. | Mobile source is now known, but coordinated Backend/Mobile implementation, concurrency/restart details, and the versioned Android acceptance artifact remain gates. |
| Feedback triage and device operations (T12) | Each feedback item has accountable handling; authorized staff can see source/device status. | Complete for the exact source/test handoff: persisted role enforcement, feedback lifecycle/retention/audit code, notice/inbox, and safe health page exist. T14 adds bounded browser evidence for session-hydration truth, no premature privileged reads, and role/state/action/dialog continuity; migration, retention execution, and human acceptance remain unavailable. |
| Public service-state communication | Riders distinguish fresh service, no service, stale/disconnected data, and recovery. | **Resolved by T14 for the bounded existing-state source/browser contract.** Availability, StopInfo, ETA, Retry, canonical age, and slow-load messaging now distinguish the states the clients can know. Human/assistive-technology acceptance, deployed recovery, and any future route/dependency causal contract remain release evidence rather than inferred UI facts. |

### Actionable recommendations

- Preserve the single T9 connection authority while later work adds truthful service/recovery
  presentation; do not restore per-consumer fallback behavior.
- Keep T11's Android/timeout/recovery acceptance and T12's runtime/human acceptance separate from
  static product evidence.
- Apply approved D-011 only through bounded T14 slices and preserve the Public visual identity.
  Apply D-012 only through later exact lifecycle tasks; do not absorb it into T11/T12/T14.

## 6. Roadmap Impact

- T9 is **Partially Complete**: its repository-side topology/origin/runtime/runbook handoff passed
  deterministic checks. It still cannot claim completion or deployment until the University
  Server/Network acceptance checklist and an approved target are available.
- T10 is complete for its exact handoff scope; changed evidence is now carried by this re-audit.
- T11 remains gated by a coordinated cross-repository exact handoff, technical lifecycle parameters,
  writable Mobile authority/Android build target, and external device acceptance evidence. D-012 is
  approved but remains outside T11's bounded shared-phone scope.
- T12 is complete for its D-009/D-010:A exact source/test scope. Its migration, retention, and
  staff/rider acceptance still require an approved runtime target before release evidence exists.
- T14 has twelve accepted source slices by count: stable IDs `T14-S01` through `T14-S11` plus
  `T14-S13`. S13 is complete for its bounded session-hydration truth-state contract at application-
  source baseline `c72feb9`, with completion provenance `9a9cf5c`; it preserves Public UI, Login,
  roles, permissions, endpoints, payloads, backend, and schema behavior. `T14-S12` remains owner-
  deferred. `T14-S14` is only Proposed and blocked on the pending D-011/Public-UI choice recorded at
  `9ff7e85`; it has no authorized source write.
- Roadmap synthesis must preserve these separate gates; D-001=C alone does not authorize any task.

## 7. Assumptions, Unknowns, and Confidence

The audit treats Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and LoRaWAN/Gateway/TTN/Webhook as separate
research/operational boundaries; simulators are only test tools. Static source evidence gives **High**
confidence for the missing product surfaces, approved policies, T9 connection contract, exact
mutation requests, shared browser transport ownership, and the bounded S13 no-premature-read
invariant, **Medium** confidence for local browser projection/recovery and fake-transport lifecycle
behavior because focused deterministic tests exist,
and **Low** confidence for user,
operator, mobile, hardware, provider, privacy, or production outcomes without runtime evidence.

## 8. Proposed Owner Decisions

No new owner decision is required for `T14-S13`: it preserves the approved role/capability contract
and changes only unresolved-session projection and read timing. The D-011 refinement for
`T14-S14` optional Public Feedback vehicle association remains Proposed and blocked on exact-
contract/Public-UI authority confirmation at `9ff7e85`; it authorizes no source write. D-012 remains
approved but unimplemented. T11's coordinated lifecycle contract and Android acceptance evidence,
and D-008's external Server/Network checklist remain unverified. Approved policy and local UI
evidence do not fabricate an operational result.

## 9. Handoff

Architecture and every downstream profile may consume coordination baseline `9ff7e85`, whose
accepted application-source baseline is `c72feb9`. The resulting Roadmap must preserve the selected
monolith and public/data boundaries, separate repository configuration from external deployment
evidence, and carry the accepted ID set `T14-S01` through `T14-S11` plus `T14-S13` without treating
deferred `T14-S12` as accepted. No new owner decision is required for S13; S14 remains blocked on
the pending D-011/Public-UI choice at `9ff7e85`. Public UI, T11, Research/T13, API/auth/schema,
Mobile, and external-runtime work remain outside this result. Admin Login source behavior is
unchanged; browser evidence remains limited to the rejected-request/inline-error and protected-
redirect/material regressions.

## 10. T12 Implementation Re-audit — 2026-08-01

**Finding: accountable anonymous feedback was absent — Partially Resolved.** The public form now
discloses anonymous, one-way, business-day, non-emergency handling and the approved 180-day message/
case and 30-day IP windows. `SUPER_ADMIN` (with `DEV` inheritance) receives a triage inbox with the
approved case transitions, bounded internal note, deletion reason selection, re-authentication prompt,
and 30-day restore view. This is source/build/CI evidence only; no rider or staff acceptance session,
actual business-day operation, legal review, or database retention run was observed.

**Finding: ordinary staff lacked safe source visibility — Resolved for the T12 UI scope.** `ADMIN` and
higher receive a clearly read-only source-health page showing only source type, assigned vehicle,
freshness, last-seen, status, and allowlisted error category. Sender recovery, credentials, source
assignment, raw data, and research remain absent from the page. T11 still owns shared-phone recovery.

T11 and T9 remain independent release blockers. No new owner decision is proposed.
