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

## 2026-08-11 T14 shared browser Socket.IO lifecycle re-audit — superseded by T14-S13

Discovery remains validated at the real ancestor
`1eec866b986b4cb4e802f7a48fac93e54e780699`. Product-relevant application evidence changes from
the accepted `e6a04ad` baseline only in `services/browserSocketLifecycle.ts`, the Public tracker
Socket hook, Admin LiveMap, the focused lifecycle test, and its package script. Completion record
`535ec73` maps the exact task, measurement-first failures, final checks, and evidence limits. Source
baseline `70f42c1` is **Complete for the eleventh T14 Product preservation/integrity contract**.

One shared implementation boundary now owns Socket.IO construction, Socket/Manager listener wiring,
connection-state signaling, first-versus-later connect behavior, and idempotent cleanup for the two
scoped browser consumers. It creates one lifecycle instance per consumer; it is not a global socket,
shared connection store, or canonical-state owner. Public/Admin consumers retain required-field
structural narrowing with strict string-enum checks, canonical version acceptance, snapshot/
hydration/queue/expiry policy, map behavior, and Retry. Valid canonical payload behavior and handling
order are preserved; payloads with invalid required structure, coercive enum values, or Public
source identity are now rejected before consumer use.

No product capability, permission, request, event name, valid payload, endpoint, authentication,
Login source, rendered DOM, copy, layout, theme, Public visual identity, or Admin journey changed.
The direct-owner measurement failed 1/1 against both incumbent consumers; a later strict-enum/
Public-source-identity guard failed 1/1 before repair; final focused coverage passes 4/4. T8 2/2,
T9 5/5, T14 pure 8/8, bounded surrounding browser regressions 16/16, scoped changed-target detector
`[]`, production build, full repository CI, and two independent finish reviews pass. Login evidence
remains limited to rejected-request/pending/inline-error, protected redirect, and material
regressions; no successful-session browser journey is added.

| Prior material finding | State | Current evidence |
|---|---|---|
| Route-stop management UI is missing | Resolved | T10 composition/invalidation remains unchanged. |
| A supported driver/mobile workflow is missing | Partially Resolved | The pinned native client remains partially compatible; enrollment/claim/recovery and Android acceptance are absent. |
| Admin trip history is missing | Still Present | No protected history/detail or timeout-exception surface was added. |
| Feedback workflow lacks triage | Partially Resolved | T12/T14 source/browser behavior remains; runtime retention and staff/rider acceptance are absent. |
| Public/Admin keyboard journeys meet the release accessibility baseline | Partially Resolved | Existing bounded browser evidence remains; human/assistive-technology acceptance is unavailable. |
| Stale/offline operational visibility is missing | Partially Resolved | Truthful projections and lifecycle ordering remain; T11-backed exception/action and causal contracts are absent. |
| Device operations are incomplete | Partially Resolved | Safe read-only health remains; credential, claim, revocation, force-close, and recovery operations are absent. |
| Hard-coded public route choice | No Longer Relevant | Dynamic Public route authority remains unchanged. |
| Controlled-demo scope is the release boundary | No Longer Relevant | D-001=C remains selected and blocked by the existing release gates. |
| Raw research diagnostics are absent | Resolved | T7 remains bounded/protected; no Research Dashboard or field evidence was added. |
| Owner-selected Admin visual foundation is absent | Resolved | Signal Lens and its bright-neutral material boundaries remain unchanged. |
| Rejected Login errors cannot remain inline | Resolved | Login source is unchanged; bounded rejection/redirect/material regressions pass. |
| Native master-data mutation recovery is unsafe and non-semantic | Resolved | The accepted mutation-feedback contract remains unchanged. |

No Product finding or owner decision is introduced. This evidence is local/source/synthetic: the
browser suites do not force a reconnect or zoom-time socket event, and no human, assistive-
technology, device, proxy, load, deployed, or release acceptance is inferred. Architecture and the
downstream affected profiles may consume this validated baseline. The unrelated dirty Feedback-role
migration is excluded from immutable `70f42c1` evidence.

## 2026-08-11 T14 Admin master-data mutation-feedback re-audit — superseded by Socket.IO lifecycle evidence

Discovery remains validated at `1eec866...`. Product-relevant evidence changed from `c4fdc3a` only
in the exact T14 task, Vehicles/Routes/Stops pages and CRUD modals, shared Admin modal/feedback
presentation, scoped CSS, and master-data browser tests; completion records `8ebdf9a` and `e5f6422`
map the final checks, bounded target-identity repair, and evidence limits. Source baseline `e6a04ad`
is **Complete for the exact Product source/browser contract**: the three existing Admin CRUD
journeys now expose explicit
pending state, retained inline failure and retry, a named success receipt, and one focus-managed
delete confirmation instead of native browser alerts/confirmations. Each delete dialog visibly
shows the immutable ID with its name and includes both in the accessible description.

No product capability, permission, field, validation rule, endpoint, request body, route-stop order,
Public journey, or Login source/behavior changed. Exact POST/PUT/DELETE bodies are browser-asserted
for all three resources, including retained immutable IDs after a failed update; failed mutations do
not discard entered values or selected delete targets, and pending actions cannot repeat. Admin
Login/material regressions pass 5/5, including the exact rejected request, protected rejection
redirect, inline Login rejection, and fixed-light theme/fallback boundaries. Successful session
behavior is unchanged by the source diff; it is not claimed as a browser journey in this slice.

Measurement-first mutation coverage failed 4/4 before source; the later target-identity assertion
failed 1/1 before its repair. Final master-data coverage passes 8/8 after repairing exact request
IDs, synchronous modal initialization, and unambiguous delete identity. Accessibility 4/4,
Dashboard 2/2, operations support 5/5, detector `[]`, visual finish review `PASS`, the 11-route build,
and full repository CI pass. This is local/synthetic evidence only; no staff usability, assistive-
technology, ambient database/cache, deployed runtime, Mobile/device, or release acceptance is
inferred.

| Prior material finding | State | Current evidence |
|---|---|---|
| Route-stop management UI is missing | Resolved | T10 composition/invalidation and exact ordered `{ stopIds: ["ST02", "ST01"] }` coverage remain unchanged. |
| A supported driver/mobile workflow is missing | Partially Resolved | The pinned native client remains only partially compatible; enrollment/claim/recovery and Android acceptance are absent. |
| Admin trip history is missing | Still Present | No protected history/detail or timeout-exception surface was added. |
| Feedback workflow lacks triage | Partially Resolved | T12/T14 source/browser behavior remains; runtime retention and staff/rider acceptance are absent. |
| Public/Admin keyboard journeys meet the release accessibility baseline | Partially Resolved | Shared form/delete focus, Escape/restoration, pending locks, semantic live regions, and 44 px Mobile evidence improve the bounded Admin journey; broader human/assistive-technology acceptance remains unavailable. |
| Stale/offline operational visibility is missing | Partially Resolved | Existing truthful states remain; T11-backed exception/action and causal contracts are still absent. |
| Device operations are incomplete | Partially Resolved | Safe read-only health remains; credential, claim, revocation, force-close, and recovery operations remain absent. |
| Hard-coded public route choice | No Longer Relevant | Public route authority remains dynamic and untouched. |
| Controlled-demo scope is the release boundary | No Longer Relevant | D-001=C remains the selected target and its blockers remain. |
| Raw research diagnostics are absent | Resolved | T7 remains bounded/protected; no Research Dashboard or field evidence was added. |
| Owner-selected Admin visual foundation is absent | Resolved | The fixed-light Signal Lens foundation remains intact; mutation feedback reuses its glass/opaque tiers. |
| Rejected Login errors cannot remain inline | Resolved | Login source is unchanged; exact rejected-request, inline-error, protected-route redirect, and material regressions pass 5/5. |
| Native master-data mutation recovery is unsafe and non-semantic | Resolved | `e6a04ad` replaces scoped native dialogs with retained narrowed string/fallback recovery, locked pending state, persistent receipts, and one named shared confirmation that exposes immutable target identity while preserving every request contract. |

No new owner decision is required. Architecture and the downstream affected profiles consume this
validated Product baseline; further source selection remains owned by the revalidated Roadmap.
The valid Discovery commit `1eec866b986b4cb4e802f7a48fac93e54e780699` is an ancestor of
`e6a04ad`; the bounded affected delta is `c4fdc3a..e6a04ad`. The unrelated dirty Feedback-role
migration is excluded from the immutable source evidence.

## 2026-08-10 T14 bright-neutral Admin Liquid Glass foundation re-audit — superseded by mutation-feedback evidence

Discovery remains current at `1eec866...`. This profile consumes source implementation `c4fdc3a`
and its immutable Level 3 completion record at `2b49fd8`. The ninth T14 slice is **Complete for its
exact Admin source/browser contract**: every authenticated Admin route and Admin Login now share the
owner-refined explicitly light white/gray Signal Lens material system. Public source, identity,
content, journeys, and behavior remain unchanged.

The foundation preserves existing Admin information, roles, fields, requests, successful Login/
session behavior, state projection, keyboard/focus, responsive, and 44 px contracts. It limits glass
to navigation/context/control/modal/Login layers and retains opaque operational content. The one
product-visible repair lets a rejected `auth/login` request reach the existing inline error instead
of being intercepted as a protected-route redirect; non-Login 401/403 behavior remains protected.
Focused browser evidence passes 5/5, earlier Admin suites pass, the production design seed survives,
the detector returns `[]`, the final finish verdict is `PASS`, and full local CI passes. This is not
operator, assistive-technology, deployed, Mobile, device, or release acceptance.

| Prior material finding | State | Current evidence |
|---|---|---|
| Route-stop management UI is missing | Resolved | T10 composition/invalidation evidence is unchanged by the presentation-only slice. |
| A supported driver/mobile workflow is missing | Partially Resolved | The pinned native client remains only partially compatible; enrollment/claim/recovery and Android acceptance are absent. |
| Admin trip history is missing | Still Present | No protected history/detail or timeout-exception surface was added. |
| Feedback workflow lacks triage | Partially Resolved | T12/T14 source/browser behavior remains; runtime retention and staff/rider acceptance are absent. |
| Public/Admin keyboard journeys meet the release accessibility baseline | Partially Resolved | Signal Lens adds Login and material-fallback evidence, but broader assistive-technology/human acceptance remains unavailable. |
| Stale/offline operational visibility is missing | Partially Resolved | Existing truthful states remain; T11-backed exception/action and causal contracts are still absent. |
| Device operations are incomplete | Partially Resolved | Safe read-only health remains; credential, claim, revocation, force-close, and recovery operations remain absent. |
| Hard-coded public route choice | No Longer Relevant | Public route authority remains dynamic and untouched. |
| Controlled-demo scope is the release boundary | No Longer Relevant | D-001=C remains the selected target and its blockers remain. |
| Raw research diagnostics are absent | Resolved | T7 remains bounded/protected; no Research Dashboard or field evidence was added. |
| Owner-selected Admin visual foundation is absent | Resolved | `c4fdc3a` implements the fixed-light Signal Lens foundation and converged Login without changing Public UI. |
| Rejected Login errors cannot remain inline | Resolved | The exact `auth/login` rejection bypasses hard navigation while every other protected 401/403 retains it. |

Master-data mutation feedback is now the next eligible bounded T14 finding, but only through a new
exact-path Level 3 handoff. It may replace native Vehicles/Routes/Stops `alert`/`confirm` recovery
with semantic inline feedback and the shared confirmation/focus contract; endpoints, payloads,
authorization, fields, T10 route-stop behavior, Public/Login, and all blocked lanes remain fixed.
No owner decision is required.

## 2026-08-10 D-011 Admin Liquid Glass direction re-audit — superseded by built foundation evidence

Discovery and the first eight T14 implementations remain current at their recorded baselines. Owner
refinement `a0a0ce1` changes only the target visual world for the remaining authenticated Admin web
experience: Admin shell, navigation, Login, modal/control material, and later page refinements should
use a premium iOS-inspired Liquid Glass direction. Public identity, information, journeys, roles,
API/auth/schema, T10/T12 behavior, Mobile, Research, and external gates are unchanged.

This direction is product-safe only when glass is a functional navigation/control/modal layer and
dense operational content stays more opaque. The accepted semantic hierarchy, truthful state,
keyboard/focus, 44 px, and desktop/Mobile contracts remain requirements rather than visual details.
Adaptive light/dark context, reduced transparency, increased/forced contrast, reduced motion, and
no-filter fallback are part of the foundation acceptance contract. No Apple asset or service claim
is introduced.

The owner choice creates one legitimate dependency before the previously selected master-data
mutation-feedback finding: establish a shared exact-path Admin Liquid Glass foundation first so
later feedback and page refinements consume one stable token/material system. This is a bounded
reordering inside T14, not an authorization for one unbounded redesign. No further owner decision is
needed for the foundation.

## 2026-08-10 T14 Admin operations-support convergence re-audit — superseded for Admin visual direction

Discovery remains current at `1eec866...`; this profile revalidates product journeys through
completion baseline `23b4d6f...` and implementation `06e0291`. T14's eighth D-011 slice is
**Complete for its bounded source/browser contract**. Source Health now presents only the existing
safe-field allowlist in a read-only operational ledger with explicit loading, failed read, verified
empty, Retry, and ready states. Feedback Inbox retains its `SUPER_ADMIN`/`DEV` boundary, anonymous/
one-way/non-emergency/business-day and 180/30-day wording, current status graph, internal note,
fresh-auth delete reason, and payload-free restore while gaining the same truthful state hierarchy,
responsive actions, and shared sensitive-confirmation focus lifecycle.

Focused operations-support browser journeys pass 5/5 at desktop and Mobile widths, including
ordinary-`ADMIN` denial, safe fields, failure-versus-empty recovery, 44 px controls, no horizontal
overflow, note/status/delete/restore request boundaries, and dialog focus/Escape/restoration. Every
prior frontend regression, the 11-route Turbopack build, scoped detector `[]`, visual trace review,
and full repository CI pass. Public/Login, Dashboard/master data, T11/Research, backend/API/auth/
schema, dependencies, migration, Mobile, and external targets are unchanged. This is synthetic local
evidence, not staff/human, assistive-technology, stateful retention, physical-device, deployed, or
release acceptance.

The broader Admin-theme and legacy recovery P2 findings are **Further narrowed, not closed**. The
scoped operations/support pages no longer use independent hard-coded palettes, sub-44 px actions, or
error-plus-empty projection, but the Admin shell remains forced-light with no approved theme switch,
and master-data mutations still use native browser alert/confirm recovery. The Research P1 remains
blocked on T13. No owner decision is needed for the next eligible bounded T14 unit: replace only the
existing Vehicles/Routes/Stops mutation alerts/confirms with semantic inline action feedback and the
shared Admin confirmation/focus contract while preserving endpoints, payloads, authorization,
Public/Login, T11, Research, backend/schema, Mobile, and external-runtime boundaries.

## 2026-08-10 T14 Admin master-data theme-convergence re-audit — superseded for operations-support findings

Discovery remains current at `1eec866...`; this profile revalidates product journeys through
completion baseline `4e609e3...` and implementation `7321a25`. T14's seventh D-011 slice is
**Complete for its bounded source/browser contract**. Vehicles, Routes, and Stops now share an
authenticated Admin hierarchy with explicit loading, failed read, verified empty, and populated
states. Failed initial reads provide inline Retry rather than a browser alert followed by an
empty-looking list. Desktop tables and Mobile cards retain the existing identifiers, names, route/
color, coordinates, status, CRUD actions, and ordered route-stop publish behavior.

The four existing master-data dialogs share the established focus lifecycle and a semantic Admin
shell without changing field requirements, authorization, endpoint, payload, or delete/save
behavior. Public/Login, Dashboard, Source Health, Feedback, Mobile, Research, backend, schema, and
external targets are unchanged. Focused master-data browser journeys pass 4/4 at desktop and Mobile
widths, including the unchanged reordered stop payload; every prior frontend regression, the
11-route build, scoped detector `[]`, and full repository CI pass. This is synthetic local evidence,
not staff/human, assistive-technology, physical-device, stateful database/cache, deployed, or release
acceptance.

The broader Admin-theme and legacy failure-state P2 findings are therefore **Narrowed, not closed**:
Source Health and Feedback still use hard-coded page palettes, sub-44 px actions, and error-plus-
empty rendering paths, and no theme switch/dark mode exists. The remaining Research P1 stays blocked
on T13. No owner decision is needed for the next eligible bounded T14 unit: converge only those two
existing Admin operations/support pages and the existing sensitive confirmation dialog while
preserving T12 role/privacy/retention/action policy and excluding Public/Login, T11, Research,
API/auth/schema, Mobile, and external-runtime work.

## 2026-08-10 T14 Public service explanation/recovery re-audit — superseded for Admin master-data findings

Discovery remains current at `1eec866...`; this profile revalidates the product journeys through
completion baseline `db72310...` and implementation `bf80308`. T14's sixth D-011 slice is
**Complete for its bounded source/browser contract**. Riders can now distinguish snapshot failure
from verified empty service, retry the failed snapshot, see canonical last-update age, receive
state-specific ETA text instead of a numeric estimate from non-authoritative state, and receive a
slow-load explanation before the existing map-release fallback. Availability, StopInfo, ETA, and
preloader messaging consume only already-known snapshot, connection, and canonical timing state.

The slice preserves the incumbent Public glass/map visual identity, palette, typography, component
order, and primary behavior. It does not claim a route- or dependency-specific root cause that the
current backend does not provide. Focused pure tests pass 8/8 and Public recovery browser journeys
pass 2/2 at 1280 and 320 CSS px; every prior frontend regression, the 11-route build, final detector
`[]`, and full repository CI pass. This is synthetic local evidence, not rider comprehension,
assistive-technology, physical-device, deployed recovery, or service-operations evidence.

The audited Public service-explanation P1 is therefore **Resolved for the bounded existing-state
source/browser contract**. The only remaining P1 is the Dev/Research Dashboard, which remains
ineligible until T13's physical/provider evidence is available. The next eligible non-blocked unit
is a bounded T14 P2 that extends the established Admin semantic theme to authenticated master-data
pages without changing Public UI, API/auth/schema behavior, or owner-controlled policy.

## 2026-08-10 T14 Admin Dashboard foundation re-audit — superseded for Public service findings

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
