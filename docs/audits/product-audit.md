# Product Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `0a0fe58a59dbdcfc1a4cc59c7d71cb9b4b74639d`
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
  `shuttle-tracking-backend/prisma/`, `shuttle-tracking-backend/tests/`, and
  `docs/audits/specialized/T11-mobile-repository-compatibility-v3.md`
- Reviewed at: `2026-08-10T00:41:42+07:00`
- Validation state: `Validated`
- Predecessor baselines: `docs/project-knowledge-base.md @ 1eec86602c40c859d50dd9d369f636b103b6896f`

## 2026-08-10 T14 Admin Dashboard foundation re-audit

Discovery remains current at `1eec866...`; this profile revalidates the product journeys through
completion baseline `0a0fe58...` and implementation `9411e36`. T14's fifth D-011 slice is
**Complete for its bounded source/browser contract**. The authenticated Dashboard now asks whether
its configured data is verified, presents the canonical map as the primary workspace, and labels
vehicles/routes/stops as supporting master-data inventory. Existing Source Health and Vehicles
destinations are visible without inventing trip/history/timeout exceptions, recovery promises, or
Research data.

The `RSU Operations` direction is limited to the Admin shell and Dashboard. Public files, layout,
copy, palette, component order, and behavior are unchanged. Loading/error/retry/updated counts,
snapshot/realtime/canonical state, local expiry, role-filtered navigation, and Mobile drawer focus
behavior remain. Focused Admin browser journeys pass 2/2 at 1280 and 390 CSS px; every prior
frontend regression, the 11-route build, final detector `[]`, and full repository CI pass. This is
synthetic local evidence, not staff/human or assistive-technology acceptance, physical-device/dark-
theme coverage, exception operations, or deployed readiness.

The remaining eligible product P1 is the narrowed Public service explanation. D-011 permits a
separately exact source/UX recovery handoff that preserves Public visual identity and consumes only
existing truthful state. It must stop rather than fabricate dependency causes or absorb T11,
Research, broader Admin pages, or external-runtime work.

## 2026-08-09 T14 contrast/color-governance re-audit — superseded for Admin Dashboard findings

Discovery remains current at `1eec866...`; this profile revalidates the product journeys at
`f42a2bb...`. T14's fourth D-011 slice is **Complete for its bounded source/browser contract**.
One display-only boundary normalizes route colors and selects a black/white badge foreground at
>=4.5:1 while preserving valid route backgrounds. One scoped token raises audited non-disabled
Public Feedback/Tour and Admin light-surface foregrounds from 2.60–2.63:1 to compliant source/
computed-style budgets without changing Public layout, copy, type, order, glass/map identity, or
behavior. Invalid display colors use the incumbent blue fallback without mutating stored data.

Pure contrast tests pass 4/4; focused browser journeys pass 2/2; every prior T8/T14 suite, the
11-page build, and full repository CI pass. This is synthetic local evidence, not human or
assistive-technology acceptance, a physical-device/dark-theme matrix, or deployed readiness. The
remaining Public explanation P1 is not bundled. D-011 now permits a separately bounded Admin shell/
Dashboard hierarchy and complementary-theme foundation using only existing truthful data; T11 and
the Research Dashboard remain independently blocked.

## 2026-08-09 measured Public map-quality re-audit — superseded for contrast findings

Discovery remains current at `1eec866...`; this profile revalidates the product journeys at
`7aae795...`. T14's third D-011 slice is **Complete for its bounded source/browser contract**.
Initial readiness now loads only the selected route's geometry; first selection loads another route
once and later switches reuse it. Marker/camera/scroll motion honors reduced-motion preference and
owned marker frames are cancelled on replacement/removal/cleanup. At 320 CSS px the existing Public
Stop card retains a 240 px measured width without intersecting three 44 px control targets whose
visible glass panels remain 36 px. Admin route-order actions also expose 44 px targets.

Pure motion tests pass 4/4; focused map-quality browser journeys pass 2/2; T8 1/1, truth 2/2,
accessibility 4/4, production build, and full repository CI pass. Public palette, type, copy, order,
desktop/tablet geometry, and canonical/ETA/Feedback behavior remain intact. This is synthetic local
evidence, not field/device performance, assistive-technology/human acceptance, measured contrast, or
deployed readiness. Contrast/visual-system governance is the next eligible bounded T14 lane; Admin
theme remains separate.

## 2026-08-09 accessibility/navigation re-audit — superseded for map-quality findings

Discovery remains current at `1eec866...`; this profile revalidates the product journeys at
`378818f...`. T14's second D-011 slice is **Complete for its bounded source/browser contract**. The
primarily Thai Public document no longer blocks zoom, Public Feedback/image dialogs are named and
keyboard-contained/restoring, Feedback selected state and scoped form labels are programmatic, and
the Mobile Admin drawer is absent from the tab/accessibility order while closed and predictable
while open. The incumbent Public visual identity and all truth/fail-closed behavior are preserved.

Four focused browser journeys pass across Public, Mobile/Desktop Admin, CRUD/route-stop, and
sensitive Feedback flows; truth 2/2, T8 1/1, production build, detector `[]`, and full CI also pass.
This is not assistive-technology, measured contrast, rider/staff comprehension, deployed runtime, or
public release evidence. The next T14 work may only be selected from measured responsive/
performance/visual-system evidence; Admin theme remains a separate later slice.

## 2026-08-09 truth-slice re-audit — superseded for accessibility findings

Discovery remains current at `1eec866...`; this profile revalidates the product journey at immutable
baseline `bd34552...`. T14's first D-011 slice is **Complete for its bounded source/test contract**.
Public Feedback now fails closed when the active-vehicle list fails or is empty, never fabricates or
auto-selects a vehicle, and offers a retry. The existing Public availability card now distinguishes
connected live, stale, no-service, unknown, reconnecting, disconnected, and unavailable states while
preserving its visual identity. Admin count/map surfaces now distinguish loading, error, snapshot,
realtime, and locally expired last-known state instead of turning failure into zero or an unconditional
live claim.

Pure tests passed 5/5, focused mobile/desktop browser journeys passed 2/2 and the Socket.IO Service
Worker repair repeat passed 4/4, the T8 route/expiry journey passed, and full repository CI passed on
2026-08-09. This is not a rider/staff usability study, assistive-technology acceptance, deployed
Socket.IO observation, or service-operations proof. T11, T12 runtime, accessibility/navigation,
exception handling, and release gates remain independent.

## 2026-08-08 decision/Mobile snapshot — superseded for T14 findings

Discovery is validated at `1eec866...`. D-011 approves the first T14 product outcome as truthful
data association/state without a Public redesign; Admin surfaces may receive a separately bounded
visual restructure. D-012 resolves the policy question for later account, non-Mobile Sender,
recoverable Trip/GPS deletion, backup/export, and out-of-band `DEV` lifecycle work, but none of
those controls is implemented by the decision.

The owner-supplied Android revision changes “no driver application is available” to **Partially
Resolved**: a real native app has foreground location, Socket.IO acknowledgement, and Trip start/end
paths. It is not a supported T11 workflow because it requires Source ID/static secret entry, stores
credentials in ordinary preferences with backup/cleartext enabled, ends tracking on task removal,
and lacks enrollment, QR claim, revoke/replacement, timeout, force-close, release, and device/OS
acceptance evidence. Product release status is unchanged: T11 remains a C-scope blocker.

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

T9 does not intentionally change a screen, role, or journey. It replaces the public/admin clients'
multiple fallback origins with one production same-origin-capable REST/Socket authority and adds a
checked-in university deployment handoff. This improves deterministic delivery of existing journeys
but supplies no deployed or human acceptance evidence.

## 2. Scope and Freshness

This re-audit covers the selected rider/Admin/research journeys, role and information boundaries,
approved decisions, exact T14 task evidence, and remaining release capabilities. Discovery remains
current at `1eec866...`; the preceding affected Product baseline was `f42a2bb...`. Changed evidence
is limited to the fifth T14 Admin shell/Dashboard handoff, implementation, browser/full-CI result,
and completion coordination at `0a0fe58...`. No external target, Mobile source, migration, backend/
schema behavior, or Public file changed.

This audit revalidates product roles, journeys, release promises, ownership, and roadmap impact. It does
not establish deployment, provider, physical-device, browser-runtime, or field-performance behavior.

The application journeys are unchanged by D-008. Its approved university handoff separates the
application team's deliverables from University Server/Network operations and permits isolated cloud
demo profiles, but it supplies no deployed rider/admin workflow or capacity evidence. No browser
session, installed Android build, ESP32 firmware, TTN deployment, physical source, or university
runtime was observed.

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
| A supported driver/mobile workflow is missing | **Partially Resolved** | A pinned external native app plus Sender/trip/Socket.IO code now exists, but it implements the current static-secret path rather than T11 enrollment/QR/claim/recovery and has no release/device acceptance artifact. |
| Admin trip history is missing | **Still Present** | No protected list/detail controller, route, page, or exception surface is present. |
| Feedback workflow lacks triage | **Partially Resolved** | T12 implements the approved notice, receipt, Super Admin/Dev inbox, assignment/status flow, delete/restore, and source/test retention contract. No staff/rider acceptance, migration, or retention-run evidence exists. |
| Public/Admin keyboard journeys met the release accessibility baseline | **Partially Resolved** | T14 corrects root/dialog/focus/form/Mobile navigation plus measured reduced-motion, touch targets, and audited light-surface/route-badge contrast. Broader live-region/touch coverage, assistive technology, and human acceptance remain unverified. |
| Stale/offline operational visibility is missing | **Partially Resolved** | T8 keeps Marker/count/ETA coherent, and T14 gives the Public availability card and map-first Admin Dashboard truthful connection, freshness, failure, retry, and last-known states. Public last-update age/dependency-specific recovery guidance and a T11-backed operations exception/action view remain absent. |
| Device operations are incomplete | **Partially Resolved** | T12 provides an all-admin safe read-only source-health API/page. Credential, assignment, Mobile claim/recovery, revocation, and force-close operations remain absent from the supported UI. |
| Hard-coded public route choice | **No Longer Relevant** | The tracker loads active routes from the public API. Route authority and cache invalidation remain a separate T10 concern. |
| Controlled-demo scope was the release boundary | **No Longer Relevant** | D-001=C supersedes it; the required C-scope capabilities remain unimplemented and block a wider public-service claim. |
| Raw research diagnostics were absent | **Resolved** | T7 provides bounded, protected diagnostics/metrics/export APIs for its approved research scope; it does not create a researcher dashboard or field evidence. |

## 4. Journey and Role Assessment

| Journey | State | Evidence-based assessment |
|---|---|---|
| Rider: choose route, inspect stops/vehicles, use ETA | Partial | Public REST, canonical Socket.IO projection, map, stops, and ETA components exist. T8 preserves expiry truth; T14 adds truthful state, scoped keyboard access, selected-route-only geometry, cancellable/reduced motion, measured 320 px control separation, and governed route-color display. Last-update age, dependency guidance, and human/device comprehension remain unverified. |
| Rider: submit feedback | Partial | `FeedbackModal` has truthful validation/load/retry/success/error, verified explicit vehicle association, programmatic category/form state, and a keyboard-contained/restoring dialog. T12 adds the staff inbox, but no assistive-technology/human acceptance or actual retention evidence exists. |
| ADMIN: maintain routes/stops/vehicles | Partial | The coherent Admin shell links to CRUD and route-stop composition dialogs with programmatic labels/focus behavior; the three measured order controls meet 44 px targets. Broader page theming and ambient browser/database published-read evidence remain absent. |
| ADMIN: monitor/send/recover service | Partial | The map-first Dashboard preserves truthful canonical state and links to the safe read-only Source Health page. Active-trip history, timeout exception, Mobile claim/revocation, credential, and force-close journeys remain missing. |
| Driver: select vehicle, start, send, reconnect, end | Partial | The external native app can authenticate, start/end and foreground-send against the old static-secret contract. It cannot perform the approved enrollment/QR/claim/recovery journey and task removal can end tracking without authoritative acknowledgement. |
| SUPER_ADMIN/DEV: privileged data/research operation | Partial | Persisted hierarchy, current-role checks, feedback triage with recent-auth delete/restore, and protected T7 research reads/export are implemented. General account/source lifecycle, privileged Trip/GPSTrack controls, a research dashboard, and complete recovery remain gated. |
| Researcher: compare three physical sources | Partially Resolved | T7's protected research APIs and D-004 definitions exist. The Dev Dashboard, ESP32/TTN/mobile field evidence, and metric outcome evidence remain unavailable. |

## 5. Product Requirements and Ownership Gaps

| Required C-scope capability | Outcome/acceptance signal | Owner/policy state |
|---|---|---|
| Route-stop operations (T10) | Admin publishes valid ordered stops; next public read can obtain revised route data. | **Resolved for exact T10 handoff scope**; public cache invalidation is source/test-verified, while ambient runtime/browser evidence is unavailable. |
| Sender, timeout, history, exceptions (T11) | Supported Android/IoT operating paths, protected history, clear timeout/admin recovery. | Mobile source is now known, but coordinated Backend/Mobile implementation, concurrency/restart details, and the versioned Android acceptance artifact remain gates. |
| Feedback triage and device operations (T12) | Each feedback item has accountable handling; authorized staff can see source/device status. | Complete for the exact source/test handoff: persisted role enforcement, feedback lifecycle/retention/audit code, notice/inbox, and safe health page exist. Migration, retention execution, and human acceptance remain unavailable. |
| Public service-state communication | Riders distinguish fresh service, no service, stale/disconnected data, and recovery. | **Partially Resolved by T14** for the existing availability card and Socket.IO connection boundary. Last-update age, dependency-specific guidance, human acceptance, and deployed recovery behavior remain required before a service claim. |

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
- T14's first five slices are complete and revalidated at `0a0fe58...`. The next eligible work is a
  bounded Public service-explanation/recovery handoff using only existing truthful state while
  preserving visual identity; it must not fabricate dependency causes or absorb T11, Research,
  broader Admin pages, or external-runtime work.
- Roadmap synthesis must preserve these separate gates; D-001=C alone does not authorize any task.

## 7. Assumptions, Unknowns, and Confidence

The audit treats Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and LoRaWAN/Gateway/TTN/Webhook as separate
research/operational boundaries; simulators are only test tools. Static source evidence gives **High**
confidence for the missing product surfaces, approved policies, and T9 connection contract,
**Medium** confidence for local T8 projection behavior because focused deterministic tests exist, and **Low** confidence for user,
operator, mobile, hardware, provider, privacy, or production outcomes without runtime evidence.

## 8. Proposed Owner Decisions

No new owner decision is proposed. D-011/D-012 are approved. Their exact implementations, T11's
coordinated lifecycle contract and Android acceptance evidence, and D-008's external Server/Network
checklist remain unverified. Approved policy does not fabricate an operational result.

## 9. Handoff

Architecture and every downstream profile may consume this Product baseline. The resulting Roadmap
must preserve the selected monolith and public/data boundaries, separate repository configuration
from external deployment evidence, and may select only a bounded T14 Public service-explanation/
recovery handoff next. No new owner decision is required; broader Admin pages remain later slices.

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
