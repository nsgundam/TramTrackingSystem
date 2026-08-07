# Product Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `cdedcc2fd82ab264e2176716ac23a74c948e1a28`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/`,
  `docs/tasks/T9-production-topology-origin-handoff.md`,
  `docs/operations/university-server-network-handoff.md`, `README.md`,
  `shuttle-tracking-web/app/`, `shuttle-tracking-web/components/`,
  `shuttle-tracking-web/config/`, `shuttle-tracking-web/services/`,
  `shuttle-tracking-web/contexts/`, `shuttle-tracking-web/hooks/`,
  `shuttle-tracking-web/utils/`, `shuttle-tracking-web/tests/`,
  `shuttle-tracking-web/package.json`, `shuttle-tracking-web/simulate.js`,
  `shuttle-tracking-web/simulate-manual.js`, `shuttle-tracking-backend/src/routes/`,
  `shuttle-tracking-backend/src/controllers/`, `shuttle-tracking-backend/src/services/`,
  `shuttle-tracking-backend/prisma/`, and `shuttle-tracking-backend/tests/`
- Reviewed at: `2026-08-07T19:47:47+07:00`
- Validation state: `Validated`
- Predecessor baselines: `docs/project-knowledge-base.md @ cdedcc2fd82ab264e2176716ac23a74c948e1a28`

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
submission. It does not show a driver application, trip/history or exception UI, public service-state
explanation, or Dev Dashboard. T12 now adds the bounded feedback inbox, privacy notice, and safe
read-only source-health view; it is not a device recovery/operations implementation. The
T8 public-map correction is retained as
**Resolved for its limited truthful-local-state scope**; it does not supply the C-scope operational state
model.

T9 does not intentionally change a screen, role, or journey. It replaces the public/admin clients'
multiple fallback origins with one production same-origin-capable REST/Socket authority and adds a
checked-in university deployment handoff. This improves deterministic delivery of existing journeys
but supplies no deployed or human acceptance evidence.

## 2. Scope and Freshness

This audit revalidates product roles, journeys, release promises, ownership, and roadmap impact. It does
not establish deployment, provider, physical-device, browser-runtime, or field-performance behavior.

The application journeys are unchanged by D-008. Its approved university handoff separates the
application team's deliverables from University Server/Network operations and permits isolated cloud
demo profiles, but it supplies no deployed rider/admin workflow or capacity evidence. No browser
session, real rider/operator, native Android sender, ESP32 firmware, TTN deployment, physical source,
or university runtime was observed.

The preceding evidence baseline was `82f4d97...`. Product-relevant changed paths are
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
| Route-stop management UI is missing | **Resolved** | The authenticated Routes page opens `RouteStopsModal`, which loads active/current stops and publishes the ordered list through the bounded replacement API. Deterministic backend and repository-CI evidence passed; no ambient browser/database workflow was run. |
| A supported driver/mobile workflow is missing | **Partially Resolved** | Sender/trip/HTTP/Socket.IO contracts and simulators exist. D-007/D-005 now constrain the separate Android workflow, but no application or its acceptance evidence is in this repository. |
| Admin trip history is missing | **Still Present** | No protected list/detail controller, route, page, or exception surface is present. |
| Feedback workflow lacks triage | **Partially Resolved** | T12 implements the approved notice, receipt, Super Admin/Dev inbox, assignment/status flow, delete/restore, and source/test retention contract. No staff/rider acceptance, migration, or retention-run evidence exists. |
| Stale/offline operational visibility is missing | **Partially Resolved** | T8 keeps public Marker/live-count/ETA projection internally coherent after local expiry and route change. Public/admin UI still lacks an accountable fresh/stale/no-service/recovery explanation or an operations exception view. |
| Device operations are incomplete | **Partially Resolved** | T12 provides an all-admin safe read-only source-health API/page. Credential, assignment, Mobile claim/recovery, revocation, and force-close operations remain absent from the supported UI. |
| Hard-coded public route choice | **No Longer Relevant** | The tracker loads active routes from the public API. Route authority and cache invalidation remain a separate T10 concern. |
| Controlled-demo scope was the release boundary | **No Longer Relevant** | D-001=C supersedes it; the required C-scope capabilities remain unimplemented and block a wider public-service claim. |
| Raw research diagnostics were absent | **Resolved** | T7 provides bounded, protected diagnostics/metrics/export APIs for its approved research scope; it does not create a researcher dashboard or field evidence. |

## 4. Journey and Role Assessment

| Journey | State | Evidence-based assessment |
|---|---|---|
| Rider: choose route, inspect stops/vehicles, use ETA | Partial | Public REST, canonical Socket.IO projection, map, stops, and ETA components exist. T8 prevents locally expired non-live vehicles from remaining visible, but riders do not receive a service-state/recovery explanation. |
| Rider: submit feedback | Partial | `FeedbackModal` has validation/loading/success/error plus the approved anonymous/no-reply/privacy/business-day notice. T12 adds the staff inbox, but no human acceptance or actual retention evidence exists. |
| ADMIN: maintain routes/stops/vehicles | Partial | CRUD pages and an authenticated route-stop composition/reorder/publish journey exist. The expected public-cache transition has source/test evidence but no ambient browser/database workflow evidence. |
| ADMIN: monitor/send/recover service | Partial | The safe read-only Source Health page exposes bounded freshness/status fields. Active-trip history, timeout exception, Mobile claim/revocation, credential, and force-close journeys remain missing. |
| Driver: select vehicle, start, send, reconnect, end | Missing | D-007/T11 define a native, internally installed application using an enrolled shared phone and non-secret vehicle QR. The repository contains only backend technical contracts/simulators, not that supported product. |
| SUPER_ADMIN/DEV: privileged data/research operation | Partial | Persisted hierarchy, current-role checks, feedback triage with recent-auth delete/restore, and protected T7 research reads/export are implemented. General account/source lifecycle, privileged Trip/GPSTrack controls, a research dashboard, and complete recovery remain gated. |
| Researcher: compare three physical sources | Partially Resolved | T7's protected research APIs and D-004 definitions exist. The Dev Dashboard, ESP32/TTN/mobile field evidence, and metric outcome evidence remain unavailable. |

## 5. Product Requirements and Ownership Gaps

| Required C-scope capability | Outcome/acceptance signal | Owner/policy state |
|---|---|---|
| Route-stop operations (T10) | Admin publishes valid ordered stops; next public read can obtain revised route data. | **Resolved for exact T10 handoff scope**; public cache invalidation is source/test-verified, while ambient runtime/browser evidence is unavailable. |
| Sender, timeout, history, exceptions (T11) | Supported Android/IoT operating paths, protected history, clear timeout/admin recovery. | Mobile/timeout policy is approved; account lifecycle, technical concurrency/restart details, external Android acceptance, and fresh evidence remain gates. |
| Feedback triage and device operations (T12) | Each feedback item has accountable handling; authorized staff can see source/device status. | Complete for the exact source/test handoff: persisted role enforcement, feedback lifecycle/retention/audit code, notice/inbox, and safe health page exist. Migration, retention execution, and human acceptance remain unavailable. |
| Public service-state communication | Riders distinguish fresh service, no service, stale/disconnected data, and recovery. | Required by D-001=C; precise public wording/operations ownership must be incorporated by the affected work. |

### Actionable recommendations

- Preserve the single T9 connection authority while later work adds truthful service/recovery
  presentation; do not restore per-consumer fallback behavior.
- Keep T11's Android/timeout/recovery acceptance and T12's runtime/human acceptance separate from
  static product evidence.
- Carry D-011 and D-012 as explicit owner gates; do not expand T14 or general account/source
  lifecycle work inside another task.

## 6. Roadmap Impact

- T9 is **Partially Complete**: its repository-side topology/origin/runtime/runbook handoff passed
  deterministic checks. It still cannot claim completion or deployment until the University
  Server/Network acceptance checklist and an approved target are available.
- T10 is complete for its exact handoff scope; changed evidence is now carried by this re-audit.
- T11 remains gated by its downstream fresh audits, the unapproved general role/account-lifecycle
  controls where its implementation touches them, technical lifecycle parameters, and external Android
  acceptance evidence. Do not treat its policy brief as Android implementation evidence.
- T12 is complete for its D-009/D-010:A exact source/test scope. Its migration, retention, and
  staff/rider acceptance still require an approved runtime target before release evidence exists.
- Roadmap synthesis must preserve these separate gates; D-001=C alone does not authorize any task.

## 7. Assumptions, Unknowns, and Confidence

The audit treats Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and LoRaWAN/Gateway/TTN/Webhook as separate
research/operational boundaries; simulators are only test tools. Static source evidence gives **High**
confidence for the missing product surfaces, approved policies, and T9 connection contract,
**Medium** confidence for local T8 projection behavior because focused deterministic tests exist, and **Low** confidence for user,
operator, mobile, hardware, provider, privacy, or production outcomes without runtime evidence.

## 8. Proposed Owner Decisions

No new owner decision is proposed. The following remain outside this product revalidation: general `ADMIN`/`SUPER_ADMIN` provisioning
and credential lifecycle, T11's remaining lifecycle contract, external Android acceptance evidence,
and D-008's external Server/Network checklist. D-008 resolves the application-owner deployment
policy; it does not fabricate an operational acceptance result.

## 9. Handoff

Architecture and every downstream profile have now consumed this Product baseline. The resulting
Roadmap preserves the selected monolith and public/data boundaries, separates repository
configuration from external deployment evidence, and exposes no currently eligible implementation
unit.

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
