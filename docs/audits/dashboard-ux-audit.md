# Dashboard & UX Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 70f42c15948bf09e71a3c91d594a4c21f52db23b
- Evidence scope: PRODUCT.md, docs/project-knowledge-base.md,
  Product/Architecture/Backend/Frontend/Infrastructure & Device audits,
  DESIGN.md, .impeccable/design.json, docs/decision-queue.md, docs/research/, docs/tasks/,
  docs/operations/university-server-network-handoff.md, shuttle-tracking-web/app/,
  shuttle-tracking-web/components/, shuttle-tracking-web/config/,
  shuttle-tracking-web/hooks/, shuttle-tracking-web/services/, shuttle-tracking-web/types/,
  shuttle-tracking-web/utils/, shuttle-tracking-web/tests/, full current frontend check evidence,
  and the current Impeccable technical audit/detector pass
- Reviewed at: 2026-08-11T19:35:00+07:00
- Validation state: Validated
- Predecessor baselines: docs/audits/product-audit.md and docs/audits/frontend-audit.md @
  70f42c15948bf09e71a3c91d594a4c21f52db23b; docs/audits/infrastructure-device-audit.md @
  1eec866b986b4cb4e802f7a48fac93e54e780699

## 2026-08-11 T14 shared browser Socket.IO lifecycle Dashboard & UX re-audit

Product and Frontend are validated against `70f42c1`; Infrastructure & Device remains current at
`1eec866...`. The eleventh T14 slice is **Complete for its exact Dashboard & UX source/unit/browser-
regression contract**. Public and Admin still render the same states, content, controls, hierarchy,
and bright-neutral/Public visual systems; only internal Socket.IO transport/listener ownership
changes. One shared implementation now replaces duplicated wiring while each surface retains its
own lifecycle instance, structural validation, canonical state, hydration/queue, map, Retry, and
expiry behavior.

The post-change Impeccable technical audit finds no rendered JSX/DOM, CSS, copy, layout, theme,
focus, or Login source delta. A fresh scoped detector on the changed LiveMap/hook/service returns
`[]`. Valid canonical event order is preserved; required-field structural narrowing rejects
coercive enum values and Public source identity before use. The direct-owner measurement failed 1/1
against both incumbent consumers, the later boundary guard failed 1/1 before repair, and final
lifecycle coverage passes 4/4. T8 2/2, T9 5/5, T14 pure 8/8, bounded browser 16/16, build/full CI,
and two finish reviews pass.

The score remains **15/20 — below the release baseline**: every dimension stays 3/4. The duplicated
Socket lifecycle P2 is **Resolved for bounded local source/unit/browser-regression evidence**,
leaving zero P0, one P1, five P2, and one P3 open; eight P1 and five P2 findings are resolved across
T14. Implementation Integrity stays 3/4 because remaining asset/external/runtime/system ceilings
persist.

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public/Admin Socket.IO lifecycle implementation was duplicated | Resolved | One shared implementation owns transport/listener mechanics; each surface retains its own instance and product-specific validation/canonical/UI authority. |
| Public expired/non-live Marker could overstate service | Resolved | T8 projection and expiry regressions remain unchanged. |
| Public rider state was fully explanatory | Resolved | Bounded existing-state behavior remains; human/deployed evidence is absent. |
| Admin live map had no state visibility | Partially Resolved | Snapshot/realtime/canonical/Retry behavior remains; T11-backed exception/actions are absent. |
| Admin dashboard was an accountable operations surface | Partially Resolved | Internal ownership improves, but no T11 exception summary/recovery is added. |
| Route-stop management journey existed | Resolved | Existing ordered payload/focus evidence remains. |
| Feedback capture had staff triage/privacy journey | Partially Resolved | T12/T14 behavior remains; human/runtime acceptance is absent. |
| Research data had an appropriate dashboard | Still Present | No research route/filter/metric/uncertainty/drill-down/export UI exists. |
| Role-specific UX enforced the hierarchy | Partially Resolved | Session/Sidebar behavior remains; general lifecycle/research navigation stay separate. |
| Dashboard public-theme direction had a bounded specification | Resolved | Signal Lens remains fixed-light and Admin-only; Public identity is unchanged. |
| Modal, focus, form, and document accessibility met release baseline | Partially Resolved | Existing bounded browser evidence remains; human/assistive-technology coverage is open. |
| Feedback vehicle association failed safely | Resolved | Existing fail-closed behavior is unchanged. |
| Rejected Admin Login errors recover inline | Resolved | Login source is unchanged; rejected request/inline error, protected redirect, and material regressions remain covered. |
| Native master-data mutation recovery was unsafe and non-semantic | Resolved | The accepted contextual mutation contract remains unchanged. |

Reconnect/disposal evidence is fake-transport/source based; the browser suite does not force a
reconnect or zoom-time socket event. No human, AT, real device, deployed/proxy, load/runtime, or
release acceptance is claimed. No new finding, owner decision, or UX redesign is required.
Production Readiness and Roadmap may consume this validated baseline. The pre-existing
`.impeccable/design.json` drift behind `DESIGN.md` remains outside this acceptance.

## 2026-08-11 T14 Admin master-data mutation-feedback re-audit — superseded by shared lifecycle evidence

Product and Frontend are validated against `e6a04ad`; Infrastructure & Device remains current at
its recorded `1eec866...` predecessor. The tenth T14 slice is **Complete for its exact Dashboard &
UX source/browser contract**. Vehicles, Routes, and Stops now communicate the selected record,
pending action, retained failure/retry, destructive intent, and completed outcome without native
browser alerts or confirmations. Each dialog exposes the immutable selected ID visually and in its
accessible description. This changes recovery clarity, not capability, field, request,
permission, or information architecture.

The compact opaque mutation receipt is the bounded signature element. Form and delete failures stay
inside their task context; confirmation uses the existing functional-glass modal with selected-
record identity and Cancel-first focus. Disabled/`aria-busy` controls mirror local in-flight state,
Escape/Cancel restore invoking focus before a request, and immutable IDs plus entered values remain
visible after failure. Success appears only after the mutation resolves and remains visible while the
incumbent read refresh runs.

Post-repair desktop receipt/error and 390 x 844 Mobile delete captures were inspected. The error
capture visibly retains `VH001` and edited values; white/gray opaque content remains legible inside
bright Signal Lens glass, controls are at least 44 px, and browser checks cover initial focus,
Cancel/Escape, and restoration with no horizontal clipping or dark/navy theme. Measurement-first
coverage failed 4/4 before source; target-identity coverage also failed 1/1 before repair. Final
master-data coverage passes 8/8 after exact request-ID, modal-session, and confirmation-identity
repairs. Accessibility 4/4, Admin Login/material 5/5, Dashboard 2/2, operations support 5/5, scoped
changed-target detector `[]`, finish review `PASS`, build, frontend check, and repository CI pass.

The Impeccable score remains **15/20 — below the release baseline**: every dimension remains 3/4.
The native mutation-recovery P2 is **Resolved for bounded local source/browser evidence**, leaving
zero P0, one P1, six P2, and one P3 open; eight P1 and four P2 findings are resolved across T14.
No new finding is introduced. The sole P1 remains the T13-blocked Dev/Research Dashboard; T11-backed
exceptions, broader live-region/touch/device/human evidence, external/global assets, OSM attribution,
and duplicated Socket lifecycle remain open.

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public expired/non-live Marker could overstate service | Resolved | T8 truth projection and regressions remain unchanged. |
| Public rider state was fully explanatory | Resolved | Bounded existing-state behavior remains; human/deployed evidence is absent. |
| Admin live map had no state visibility | Partially Resolved | Existing truthful state remains; T11-backed exception/actions remain absent. |
| Admin dashboard was an accountable operations surface | Partially Resolved | Master-data recovery improves, but exception summary/recovery still requires T11. |
| Route-stop management journey existed | Resolved | Existing ordered payload/focus evidence remains; no stateful target was operated. |
| Feedback capture had staff triage/privacy journey | Partially Resolved | T12/T14 coverage remains; human/runtime acceptance is absent. |
| Research data had an appropriate dashboard | Still Present | No research route/filter/metric/uncertainty/drill-down/export UI exists. |
| Role-specific UX enforced the hierarchy | Partially Resolved | Session/Sidebar behavior remains; general lifecycle and research navigation remain separate. |
| Dashboard public-theme direction had a bounded specification | Resolved | Signal Lens remains the owner-refined Admin-only fixed-light system; Public identity stays separate. |
| Modal, focus, form, and document accessibility met release baseline | Partially Resolved | Mutation live regions, focus/Escape/restoration, pending locks, and 44 px Mobile evidence narrow the gap; human/assistive-technology coverage remains open. |
| Feedback vehicle association failed safely | Resolved | Existing fail-closed selection/submission evidence is unchanged. |
| Rejected Admin Login errors recover inline | Resolved | Login source is unchanged; rejected request/inline error and protected-route redirect remain covered. |
| Native master-data mutation recovery was unsafe and non-semantic | Resolved | Shared contextual feedback, persistent receipts, pending locks, and a named confirmation with visible/accessibly described immutable target ID replace all three native paths with exact requests retained. |

No new owner decision or UX redesign is required. Production Readiness and Roadmap consume this
baseline before further source selection. Evidence
remains local/synthetic, not operator/human, assistive-technology, physical-device, stateful target,
deployed, or release acceptance.
Impeccable context also reports pre-existing `.impeccable/design.json` drift behind `DESIGN.md`.
That documentation-side drift was not introduced by this slice and is not a source/readiness
blocker; `$impeccable document` can be considered separately if design-record synchronization is
requested.

## 2026-08-10 T14 bright-neutral Admin Liquid Glass foundation re-audit — superseded by mutation-feedback evidence

Product and Frontend are validated against `c4fdc3a`; Infrastructure & Device remains current at
`1eec866...`. The ninth T14 slice is **Complete for its exact Dashboard/Login source/browser UX
contract**. Signal Lens Workbench now presents a bright white/porcelain/soft-gray Admin field with
graphite content, blue reserved for functional action/current/focus semantics, restrained glass on
navigation/context/control/modal/Login layers, and opaque operational maps/tables/ledgers/forms.
There is no automatic dark theme, matching the owner's final direction. Public visual identity and
behavior are untouched.

Desktop Dashboard, Mobile drawer, desktop Login, and Mobile Login captures were inspected. The
final finish reviewer reports `PASS` with no P1/P2/P3 finish finding; the detector returns `[]`.
Focused browser evidence passes 5/5 and confirms 44 px actions, focus/Escape/restoration, no Mobile
overflow, stable content opacity, bright lock, accessibility fallbacks, exact Login request, inline
invalid-login alert, pending-submit protection, and protected-route redirect. Prior Admin suites,
build, and full local CI pass. This is synthetic visual/interaction evidence, not operator, human,
assistive-technology, physical-device, deployed, or release acceptance.

The Impeccable score remains **15/20 — below the release baseline**: all dimensions remain 3/4.
The material-system P2 is **Resolved for bounded source/browser evidence**, leaving zero P0, one P1,
seven P2, and one P3 open; eight P1 and three P2 findings are resolved across T14. Native master-data
mutation recovery, exception-first T11 operations, broader live-region/touch/device/human evidence,
external/global assets, OSM attribution, duplicated Socket lifecycle, and the Research Dashboard
remain open.

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public expired/non-live Marker could overstate service | Resolved | T8 truth projection and regressions remain unchanged. |
| Public rider state was fully explanatory | Resolved | Bounded existing-state behavior remains; human/deployed evidence is absent. |
| Admin live map had no state visibility | Partially Resolved | Signal Lens preserves truthful state; T11-backed exception/actions remain absent. |
| Admin dashboard was an accountable operations surface | Partially Resolved | Hierarchy/material clarity improves, but exception summary/recovery still requires T11. |
| Route-stop management journey existed | Resolved | Existing ordered payload/focus evidence remains; no stateful target was operated. |
| Feedback capture had staff triage/privacy journey | Partially Resolved | T12/T14 coverage remains; human/runtime acceptance is absent. |
| Research data had an appropriate dashboard | Still Present | No research route/filter/metric/uncertainty/drill-down/export UI exists. |
| Role-specific UX enforced the hierarchy | Partially Resolved | Session/Sidebar behavior remains; general lifecycle and research navigation remain separate. |
| Dashboard public-theme direction had a bounded specification | Resolved | `c4fdc3a` implements the owner-refined Admin-only Signal Lens foundation and documents it. |
| Modal, focus, form, and document accessibility met release baseline | Partially Resolved | Login/material fallbacks add evidence; broader assistive-technology/human coverage remains open. |
| Feedback vehicle association failed safely | Resolved | Existing fail-closed selection/submission evidence is unchanged. |
| Rejected Admin Login errors recover inline | Resolved | Exact rejection stays in the form; non-Login 401/403 still redirects. |

The next eligible finding is master-data mutation feedback, not another theme pass. Its exact handoff
may replace only native Vehicles/Routes/Stops mutation alerts/confirms with semantic inline feedback
and the shared confirmation/focus contract while preserving Public/Login, content, actions, fields,
request/role behavior, T10 route-stop semantics, and all blocked lanes.

## 2026-08-10 D-011 Admin Liquid Glass direction re-audit — superseded by built foundation evidence

Product and Frontend are revalidated at `a0a0ce1`; Infrastructure & Device and the first eight T14
implementations remain current at their recorded baselines. The owner now selects a premium
iOS-inspired Liquid Glass / glassmorphism world for authenticated Admin, including Login, while
retaining the Public identity and every accepted product/behavior boundary.

The required Impeccable baseline audit returns detector `[]` and retains **15/20 — below the release
baseline**: all five dimensions remain 3/4, with one open P1, eight P2, one P3, eight resolved P1,
and two resolved P2. The owner-selected world changes the target, not the measured source score.
Current strengths are semantic hierarchy, truthful states, keyboard/focus behavior, 44 px targets,
and responsive tables/ledgers. The concrete theme gap is forced-light opaque shell styling plus an
independent Login glass implementation with no shared adaptive/fallback material system.

The committed direction is **Signal Lens Workbench** (Operate mode): a restrained glass functional
layer for navigation, contextual controls, and modals above more opaque operational content. A soft
campus-sky/cobalt field provides depth; white/graphite standard materials keep maps, tables, ledgers,
forms, and long text stable. Light/dark context, reduced transparency, increased/forced contrast,
reduced motion, and unsupported-filter behavior are first-class variants. Glass never carries state
or hierarchy by itself.

The next exact unit is the shared Admin Liquid Glass foundation; it precedes master-data mutation
feedback so later notices/confirmation consume stable tokens and materials. This is a bounded
foundation, not permission for an unbounded page redesign. Public source/identity, APIs, roles,
data, dependencies, T11/Research, backend/Mobile, and external targets remain excluded.

## 2026-08-10 T14 Admin operations-support convergence re-audit — superseded for Admin visual direction

Product and Frontend are revalidated at `23b4d6f...`; Infrastructure & Device remains current at
`1eec866...`. T14's eighth D-011 slice is **Complete for its bounded source/browser contract**.
Source Health and Feedback Inbox share the scan-first `RSU Operations` hierarchy, binding read-only/
privacy notices, mutually exclusive loading/failure/verified-empty/ready states, text-labelled status
rails, named 44 px controls, and responsive operational ledgers. The sensitive Feedback confirmation
uses the existing solid Admin dialog and keyboard-contained/restoring focus lifecycle while retaining
role denial, reason/password labels, status/note graph, fresh authentication, and exact delete/
restore request semantics.

Focused operations-support journeys pass 5/5 at 1280 and 390 CSS px, including safe-field absence,
ordinary-`ADMIN` denial, failure/Retry/verified-empty state, no horizontal overflow, measured actions,
note/status/delete/restore requests, and dialog focus/Escape/restoration. The fresh re-audit repeat
passes 5/5; all earlier frontend checks, the 11-route Turbopack build, visual trace review, detector
`[]`, and full CI pass. Public/Login, Dashboard/master data, APIs/auth/schema, T11/Research, backend/
Mobile, dependencies, migration, and external targets are unchanged. No staff/human or assistive-
technology session, physical-device/dark-theme matrix, stateful retention target, deployed runtime,
or field acceptance occurred.

The technical score remains **15/20 — below the release baseline**: all five dimensions remain 3/4,
with one open P1, eight P2, one P3, eight resolved P1, and two resolved P2 findings. The theme P2 is
further narrowed because every scoped Admin operations/master-data page now uses one semantic system;
forced light/no switch remains. The legacy failure-state P2 is further narrowed because every scoped
initial list read now separates error from empty; native master-data mutation alerts/confirms remain.
Broader asset/device/human evidence, T11 exceptions, and Research also remain. P1 #9 (Dev/Research
Dashboard) remains blocked on T13.

The next eligible finding is bounded Admin master-data mutation-feedback convergence. It may replace
only native save/delete alert/confirm flows with semantic inline action state and the existing Admin
confirmation/focus contract while preserving endpoints, payloads, fields, authorization, and T10
route-stop behavior. It must exclude Public/Login, T11, Research/T13, API/auth/schema, backend/
Mobile, dependencies, and external-runtime work.

## 2026-08-10 T14 Admin master-data theme-convergence re-audit — superseded for operations-support findings

Product and Frontend are revalidated at `4e609e3...`; Infrastructure & Device remains current at
`1eec866...`. T14's seventh D-011 slice is **Complete for its bounded source/browser contract**.
Vehicles, Routes, and Stops share a scan-first page hierarchy, explicit initial loading/failure/
empty/ready states, named 44 px row actions, desktop tables, and Mobile cards. Their CRUD and route-
stop dialogs share the existing keyboard-contained/restoring focus lifecycle, semantic controls,
and solid `RSU Operations` surfaces while retaining labels, values, status, coordinates, route color,
active-stop selection, ordering, and publish behavior.

Focused master-data journeys pass 4/4 at 1280 and 390 CSS px, including no horizontal overflow,
44 px measured controls, inline failure/Retry, dialog focus/Escape/restoration, and the unchanged
route-order payload. The fresh re-audit repeat passes 4/4; all earlier frontend checks, the 11-route
build, visual trace review, detector `[]`, and full CI pass. Public/Login, Dashboard, Source Health,
Feedback, APIs/auth/schema, T11/Research, backend/Mobile, and external targets are unchanged. No
staff/human or assistive-technology session, physical-device/dark-theme matrix, stateful database/
cache, deployed runtime, or field acceptance occurred.

The technical score remains **15/20 — below the release baseline**: all five dimensions remain 3/4,
with one open P1, eight P2, one P3, eight resolved P1, and two resolved P2 findings. The theme P2 and
legacy failure-state P2 are further narrowed but remain open because Source Health and Feedback still
use hard-coded palettes, sub-44 px actions, and error-plus-empty rendering; forced light/no switch,
broader device/human evidence, T11 exceptions, and Research also remain. P1 #9 (Dev/Research
Dashboard) remains blocked on T13.

The next eligible finding is the bounded Admin operations/support convergence P2 for existing Source
Health and Feedback surfaces. It may improve hierarchy, state distinction, responsive actions, and
the existing sensitive dialog without changing T12 policy/authorization/action semantics or
crossing into Public/Login, T11, Research, API/auth/schema, Mobile, or runtime work.

## 2026-08-10 T14 Public service explanation/recovery re-audit — superseded for Admin master-data findings

Product and Frontend are revalidated at `db72310...`; Infrastructure & Device remains current at
`1eec866...`. T14's sixth D-011 slice is **Complete for its bounded source/browser contract**.
Availability now separates verified empty service from snapshot failure and offers an explicit
44 px Retry; canonical accepted time drives last-update age; StopInfo and ETA withhold numeric ETA
outside connected authoritative-live state; and the preloader explains unusual delay before the
existing safety release. Status semantics cover Availability, ETA, and slow loading.

Public palette, typography, component order, glass/map identity, and primary interaction remain
substantially unchanged. The 320 px status width is narrowed only enough to prevent a measured
branding collision. Pure truth tests pass 8/8, focused Public recovery journeys pass 2/2 at 1280
and 320 CSS px, the final scoped detector returns `[]`, and every prior frontend/full-CI gate passes.
No rider/human or assistive-technology session, physical-device matrix, deployed runtime, causal
dependency contract, or service-operations acceptance occurred.

P1 #5 is **Resolved for the bounded existing-state source/browser contract**. The technical score
remains **15/20 — below the release baseline**: all five dimensions remain 3/4, with one open P1,
eight P2, one P3, eight resolved P1, and two resolved P2 findings. P1 #9 (Dev/Research Dashboard)
remains blocked on T13 physical/provider evidence. The next eligible finding is the narrowed Admin
theme P2 through a bounded authenticated master-data page convergence slice.

## 2026-08-10 T14 Admin Dashboard foundation re-audit — superseded for Public service findings

Product and Frontend are revalidated at `0a0fe58...`; Infrastructure & Device remains current at
`1eec866...`. T14's fifth D-011 slice is **Complete for its bounded source/browser contract**. The
Dashboard now presents verified/unavailable configured data first, then a map-first canonical-state
workspace, then explicitly labelled master-data inventory and links only to existing Source Health/
Vehicles destinations. The responsive status surface no longer competes with Leaflet's top-left
controls. No T11 exception/recovery or Research data is fabricated.

The `RSU Operations` semantic extension gives the Admin shell/Dashboard a coherent light control-
room hierarchy while keeping Login, Public UI, and broader Admin page bodies unchanged. The
technical score is **15/20 — below the release baseline**: Theming improves to 3/4 and every other
dimension remains 3/4. Two P1, eight P2, and one P3 remain; the theme P2 is narrowed because broader
Admin/legacy pages and the forced-light/no-switch posture remain. Public explanation and the absent
Dev/Research Dashboard remain the two P1s.

Focused Admin journeys pass 2/2 at 1280 x 900 and 390 x 844 for semantic-token contrast, source/
visual order, primary-column width, no overflow, map-overlay bounds/control separation, existing
links, and drawer focus continuity. Truth 2/2, accessibility 4/4, map-quality 2/2, contrast 2/2,
every unit suite, build, final scoped detector `[]`, and full CI pass. Visual QA inspected synthetic
desktop/Mobile captures. No operator/human or assistive-technology session, physical-device/dark-
theme matrix, deployed runtime, or field acceptance occurred.

The next eligible P1 is a bounded Public service-explanation/recovery handoff using existing
truthful state. It must preserve Public visual identity, avoid guessed dependency causes, and remain
separate from T11, Research, broader Admin pages, and external-runtime work.

## 2026-08-09 T14 contrast/color-governance re-audit — superseded for Admin Dashboard findings

Product and Frontend are revalidated at `f42a2bb...`; Infrastructure & Device remains current at
`1eec866...`. T14 resolves P1 #8 for bounded source/browser evidence. Audited Public Feedback/Tour
and Admin light-surface foregrounds move from 2.60–2.63:1 to the scoped `#45556c` token; browser-
computed Public text and close-control budgets pass. One shared route badge preserves valid light/
dark route backgrounds and chooses >=4.5:1 black/white text; invalid display values use the incumbent
blue fallback. No Public layout, copy, type, order, glass/map identity, or behavior changed.

The technical score is **14/20 — below the release baseline**: Accessibility improves to 3/4;
Performance/Responsive/Integrity remain 3/4 and Theming 2/4. Two P1, eight P2, and one P3 remain;
seven P1 and two P2 findings are resolved by T14. Contrast 4/4, browser 2/2, every prior T8/T14
suite, build, and full CI pass. No assistive-technology/human session, physical-device/dark-theme
matrix, deployed runtime, or operator acceptance occurred.

## 2026-08-09 measured Public map-quality re-audit — superseded for contrast findings

Product and Frontend are revalidated at `7aae795...`; Infrastructure & Device remains current at
`1eec866...`. T14 resolves the eager route-geometry/uncancelled marker-motion P2 findings and narrows
the responsive/touch finding with direct browser measurements. Initial R01 readiness makes one
stops/geometry attempt; first R02 selection adds one; repeated switching adds none. Reduced motion
schedules no marker frames, disables repeated camera/scroll motion, and limits known CSS animations.
At 320 by 568, the Stop dock is 240 px and does not intersect the control stack; controls expose 44 px
targets around the same 36 px glass visuals. The three audited route-order actions are also 44 px.

The technical score is **13/20 — below the release baseline**: Performance and Responsive Design
improve to 3/4; Accessibility/Theming remain 2/4 and Integrity 3/4. Three P1, eight P2, and one P3
remain; six P1 and two P2 findings are resolved by T14. Motion 4/4, map-quality 2/2, T8 1/1, truth
2/2, accessibility 4/4, build, and full CI pass. No measured contrast, assistive-technology/human
session, real device/network budget, deployed runtime, or operator acceptance occurred.

## 2026-08-09 accessibility/navigation re-audit — superseded for map-quality findings

Product and Frontend are revalidated at `378818f...`; Infrastructure & Device remains current at
`1eec866...`. T14's second D-011 slice resolves P1 #1–#4 for the exact audited surfaces: root
zoom/language, named modal/focus/Escape/restoration behavior, form/category programmatic state, and
the off-screen Mobile Admin drawer. The drawer is inert only while closed on Mobile, remains
interactive on desktop, and exposes the active page. The Public Feedback/image geometry and visual
identity remain substantially unchanged.

The technical score is now **11/20 — below the release baseline**: Accessibility improves to 2/4;
three P1, ten P2, and one P3 remain open; six P1s are resolved across both T14 slices. Browser
journeys pass 4/4 across Public, Mobile/Desktop Admin, CRUD/route-stop, and sensitive Feedback;
truth passes 2/2, T8 passes 1/1, detector returns `[]`, and full CI passes. No axe/screen-reader,
measured contrast, reduced-motion/touch-target, human comprehension, or deployed/operator
acceptance occurred. The unrelated dirty Feedback-role migration remains excluded.

## 2026-08-09 truth-slice re-audit — superseded for accessibility findings

Product and Frontend are revalidated at `bd34552...`; Infrastructure & Device remains current at
`1eec866...`. T14's first D-011 slice closes P1 #6 and #7: Admin failure no longer becomes zero or an
unconditional live claim, its map distinguishes snapshot/realtime/local-expiry state, and Public
Feedback cannot invent or auto-select a vehicle. P1 #5 is narrowed because the incumbent Public
availability card now distinguishes connected live, stale, no-service, unknown, reconnecting,
disconnected, unavailable, and empty states without a redesign. Route/dependency-specific guidance
and last-update age remain open.

The post-slice technical score is **10/20 — below the release baseline**: Implementation Integrity
improves from 2/4 to 3/4; seven P1, ten P2, and one P3 remain open. Focused pure tests passed 5/5,
mobile/desktop journeys passed 2/2 and the Socket.IO repair repeat passed 4/4, T8 browser regression
passed, final scoped detector output is `[]`, and full CI passed. No keyboard, screen-reader,
measured contrast, human comprehension, deployed transport, or operator acceptance was performed.
The unrelated dirty Feedback-role migration is excluded.

## 2026-08-08 D-011 pre-implementation snapshot — superseded by the T14 re-audit

Product, Frontend, and Infrastructure & Device are current at `1eec866...`; web source is unchanged.
D-011 approves the first T14 slice as fail-closed Feedback vehicle association plus truthful
Public/Admin connection and freshness state. The Public surface must retain its current visual
identity and layout as far as practical; copy/state/semantics may change only as required for truth,
accessibility, and recoverability. Admin pages may later receive a substantial but separately
bounded complementary Dashboard theme.

At that pre-implementation baseline, the 9/20 score remained authoritative because no finding had
been implemented. The first-slice acceptance contract required Feedback and Admin failure/recovery
browser evidence without fabricated vehicles, zeroes, or “Live System Active”; the 2026-08-09
section above records that result. Accessibility/navigation and broader Admin visual work remain
separate slices.

## 1. Executive Summary

The repository has three deliberately separate UI audiences: a canonical-only public rider map, an authenticated but limited admin/master-data dashboard, and no current research dashboard. T8 is resolved for the limited rider projection: the map will not present a locally expired/non-live vehicle as live, and tests cover expiry, route switch, and newer-live restoration.

D-001=C requires more than that projection. T14 now gives riders truthful snapshot/connection/
service explanation, canonical age, state-aware ETA, Retry, and slow-load recovery, and gives Admin
explicit load/error/retry/snapshot/realtime/last-known states. T10
supplies Admin route-stop composition; T12 adds source health, feedback triage, and limited
role-specific navigation. Admins still lack trip/history/timeout exceptions and Mobile recovery.
The research scope remains a future authenticated developer surface and must not be exposed through
public/admin operations pages.

The owner approves substantial Admin Dashboard improvement but does not own the Public visual
surface. T14 must therefore preserve Public identity and split Admin restructuring into bounded
slices. T10 and T12 provide their exact bounded operations/data-policy surfaces; T11 remains
independently blocked. This audit does not authorize an unbounded redesign.

The required Impeccable re-audit scores the current frontend **15/20 — below the release baseline**
with no P0, one open P1, five P2, one P3, eight resolved P1, and five resolved P2 findings. Product-
specific truth/recovery/keyboard behavior, measured motion/request/viewport/contrast budgets, and
the bright-neutral Admin shell/Dashboard/Login/master-data/operations-support system are stronger,
`e6a04ad` resolves native master-data mutation recovery, and `70f42c1` resolves duplicated browser
transport/listener ownership for their bounded local evidence.
Exception-first operations and the missing Research surface still constrain release. Owner
refinement `a0a0ce1` remains implemented at `c4fdc3a`; the accepted hierarchy, content, state, focus,
responsive, and request contracts remain binding.

T9 changed how existing REST/Socket consumers select their backend, not what any surface displayed
or allowed. At that T9-only baseline, the UI score and all twenty technical findings were unchanged;
the T14 result above supersedes the two resolved and one narrowed truth findings.

## 2. Scope and Freshness

This profile reviews information architecture, truthfulness, separation of public/operations/research surfaces, loading/error/accessibility states, and task placement. It is not a browser usability study, accessibility certification, user research, device/pilot, or production service test.

Product and Frontend are revalidated at `70f42c1`; Infrastructure & Device remains current at
`1eec866...`. Changed evidence is the exact shared lifecycle task/service/consumers/focused test,
completion record `535ec73`, fresh detector `[]`, and retained build/CI evidence at `70f42c1`.
Browser evidence uses isolated fixtures, not a
university proxy, real service, assistive
technology, physical mobile device, user research, production traffic, or runtime retention; it is
not accessibility certification.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public/Admin Socket.IO lifecycle implementation was duplicated | Resolved | One shared implementation owns scoped transport/listener mechanics; each surface retains a separate instance and product-specific validation/canonical/UI authority. |
| Public expired/non-live Marker could overstate service | Resolved | T8 canonical projection and synthetic tests remove Marker/count/ETA at expiry and prevent route-switch recurrence until newer live state. |
| Public rider state was fully explanatory | Resolved | Availability, StopInfo, ETA, Retry, canonical age, and slow-load messaging distinguish the bounded snapshot/connection/canonical states the client can know without inventing causes. Human/assistive-technology comprehension and deployed recovery remain release evidence. |
| Admin live map had no state visibility | Partially Resolved | LiveMap exposes one responsive snapshot/realtime/canonical summary, retry, queued-version reconciliation, snapshot absence, and locally expired last-known state. T11-backed exception/action paths remain absent. |
| Admin dashboard was an accountable operations surface | Partially Resolved | Explicit loading/error/retry/updated master-data state, a primary canonical map, labelled inventory, and existing safe shortcuts replace false/flat hierarchy. No T11-backed exception summary or recovery actions exist. |
| Route-stop management journey existed | Resolved | The Routes page presents a shared semantic route-detail dialog for ordered active-stop add/remove/reorder and publish. The exact reordered payload is browser-verified; no stateful database/cache/public-read confirmation was run. |
| Feedback capture had staff triage/privacy journey | Partially Resolved | T12 implements notice/receipt, Super Admin/Dev triage, selected reason delete/restore, and safe health fields. T14 browser-verifies role denial, truthful queue recovery, case actions/requests, and the scoped form/dialog/sensitive-confirmation keyboard semantics; no human assistive-technology or runtime acceptance exists. |
| Research data had an appropriate dashboard | Still Present | No research route/UI has session/source/time filters, metric definitions, sample counts, uncertainty labels, drill-down or bounded export. Existing absence preserves the no-raw-public invariant. |
| Role-specific UX enforced the new hierarchy | Partially Resolved | T12 session hydration and Sidebar hide the feedback inbox from `ADMIN` while the server remains authoritative. General capability rendering, account lifecycle, research navigation, and role-denial acceptance remain absent. |
| Dashboard public-theme direction had a bounded specification | Resolved | The owner-refined fixed-light Signal Lens shell/navigation/Login/modal/control foundation and accessibility fallbacks are implemented; Public identity remains separate. |
| Modal, focus, form, and document accessibility met a release baseline | Partially Resolved | Root/dialog/form/Mobile behavior plus mutation alert/status semantics, pending locks, focus restoration, reduced motion, audited 44 px targets, and scoped contrast evidence now exist. Broader assistive technology and human acceptance remain open. |
| Feedback vehicle association failed safely | Resolved | Public Feedback exposes loading/error/empty/retry, creates no fallback vehicles or selection, and only submits an explicitly chosen ID returned by a successful list. Pure and mobile-browser evidence cover failure, recovery, selection, and posted ID. |
| Rejected Admin Login errors recover inline | Resolved | Login source is unchanged; rejected-request inline handling and protected-request redirection remain covered. |
| Native master-data mutation recovery was unsafe and non-semantic | Resolved | All three resources now retain values/target on failure, block repeat pending actions, expose named contextual recovery and receipts, and use one focus-managed delete confirmation. |

## 4. Audience and Information Boundary

| Audience | Allowed present/future information | Prohibited/required separation |
|---|---|---|
| Public rider | Canonical route/stops/live state, neutral ETA, feedback and truthful service messaging. | No source identity, raw telemetry, credentials, research comparison, unrestricted history or admin actions. |
| ADMIN operations | Authorized route publishing, source/device/trip exception and feedback workflow data. | Must be server-authorized; not raw research diagnostic data or higher-privilege deletion/export by default. |
| SUPER_ADMIN/DEV | Approved privileged actions and separate research surfaces. | T12's bounded Feedback/fresh-auth actions exist; D-012 policy is approved but unimplemented, and no UI grants implicit authority. |
| Research developer | Session-scoped metrics/aggregates, data definitions, limitations, bounded exports. | Separate route/auth; displayed route conformance and reported accuracy must not be labeled ground truth. |

## 5. Required UX Task Placement

- T10 is complete for its route-detail management scope. Keep the post-save public-read confirmation as an approved-target validation need, not a claim based on modal source alone.
- T11 needs compact authenticated operations paths for active/auto-closed trips, protected history/detail, stale/silent exception, Mobile claim/revoke and audited emergency recovery only after backend APIs and Android acceptance evidence exist. Do not place driver runtime or sender secret entry in Admin UI.
- T12's Feedback inbox/status/assignment and read-only source-health views implement their bounded
  source/test contract. Preserve server-authorized actions and clear privacy/retention/delete/restore
  controls; runtime/human acceptance remains separate.
- T14's first ten journeys remain accepted. The eleventh shared browser lifecycle slice is complete
  for this Dashboard & UX source/unit/browser-regression contract at `70f42c1`; Production
  Readiness and Roadmap may consume it. Admin Login, Public visual/product identity, DOM/copy/layout
  and valid observable behavior,
  page data/fields, T11 exceptions, Research/T13, API/auth/schema, Mobile, dependencies, and external
  runtime remain separate.

## 6. Impeccable Technical Audit

### 6.1 Audit health score

| Dimension | Score | Key finding |
|---|---:|---|
| Accessibility | 3/4 | Root/dialog/form/sidebar plus mutation/operations-support named actions, alert/status semantics, scoped motion/touch/contrast, and Availability/ETA/preloader status evidence exist; broader assistive-technology and human evidence remain. |
| Performance | 3/4 | Selected-route/deduplicated geometry, owned marker cancellation, and bounded functional-layer blur are tested; raw/external/global assets and deployed budgets remain. |
| Responsive Design | 3/4 | The measured 320 px Public collision plus 390 px master-data forms/confirmations and operations-support ledgers/dialogs with audited 44 px targets are corrected; broader device/content/human coverage remains. |
| Theming | 3/4 | One documented fixed-light Signal Lens Admin/Login system and its accessibility fallbacks are implemented; broader cross-surface/platform evidence remains below a full release baseline. |
| Implementation Integrity | 3/4 | Product-specific separation, fail-closed truth projections, shared browser transport mechanics, exact Login rejection handling, and shared Admin mutation ownership are tested; remaining system ceilings persist. |
| **Total** | **15/20 — Below release baseline** | **0 P0; 1 open P1; 5 P2; 1 P3; 8 P1 and 5 P2 resolved by T14.** |

Implementation integrity verdict: **Improved but not release-ready.** The rider map, source health,
feedback, and route operations are product-specific, and T14 removes the known false live/zero/
vehicle claims. Missing exception-first operations, human/assistive-technology evidence, deployed
recovery, broader live/touch coverage, and human/device evidence keep Dashboard/UX below the
release baseline.

### 6.2 P1 findings

1. **Root document accessibility — Resolved for source/browser scope.** User zoom is unrestricted,
   the Public root is Thai, and Admin declares its English content boundary.
2. **Systemic dialog/focus failure — Resolved for listed surfaces.** One typed focus hook supplies
   named modal semantics, initial/wrapped focus, safe Escape, and restoration across every listed
   Public/Admin dialog; focused browser journeys cover the representative flows.
3. **Form naming and selected state — Resolved for listed controls.** Feedback category state,
   Login/CRUD/route-stop controls, internal note, deletion reason, and password have programmatic
   names/associations; browser locators verify the primary flows.
4. **Off-screen Mobile navigation — Resolved.** Breakpoint-aware `inert`/`aria-hidden`, modal focus,
   Escape/restoration, `aria-current`, and focus-visible styles pass Mobile and Desktop browser checks.
5. **Public service explanation — Resolved for bounded existing-state source/browser scope.**
   Availability, StopInfo, ETA, canonical age, Retry, and slow-load messaging now distinguish the
   snapshot/connection/canonical states the client can know. A route/dependency causal diagnosis is
   unavailable server data and must not be guessed; human/assistive-technology comprehension and
   deployed recovery remain release evidence.
6. **Admin operational truth — Resolved for T14 first slice.** Counts preserve loading/error/ready
   truth and the map reconciles snapshot/event/local-expiry state. Exception-first summaries and
   actions remain a separate product gap, not a false-state regression.
7. **False Feedback vehicle — Resolved.** Failure/empty responses create no option or selection;
   recovery requires a verified response and explicit selection before submit.
8. **Contrast governance — Resolved for audited source/browser scope.** One semantic light-surface
   foreground removes the enumerated non-disabled 400-level failures; one shared badge preserves
   valid route backgrounds and chooses >=4.5:1 text. Pure 4/4 and browser 2/2 pass. This is not
   human, assistive-technology, physical-device, dark-theme, or deployed acceptance.
9. **The Dev/Research Dashboard is absent.** There is no protected route/navigation for session,
   source, device, firmware, time, sample count, missingness, metric definitions, uncertainty,
   drill-down, or bounded export.

### 6.3 P2 and systemic findings

- **Narrowed:** Availability, ETA, and preloader changes now expose scoped status announcements;
  loading/error/success/connection changes elsewhere still lack consistent `aria-live`/`role=status`.
- **Resolved for scoped source/browser evidence:** known pulse/preloader, marker, map fly/pan, and
  station-list motion now honor `prefers-reduced-motion`; no human vestibular acceptance occurred.
- **Resolved:** initial geometry is selected-route-only/deduplicated and one owned marker animation
  cancels on replacement/removal/cleanup, with 4/4 unit and 2/2 browser evidence.
- **Resolved for bounded source/unit/browser-regression evidence:** Public/Admin Socket.IO
  construction, listener, connection-signal, and cleanup mechanics now have one implementation;
  each consumer retains its separate canonical/UI policy.
- Public stop images use raw `<img>` without dimensions/lazy/error handling; the Admin map icon is
  externally hosted; Material Symbols load globally for a deferred tour.
- **Resolved for bounded source/browser evidence:** Signal Lens supplies the shared fixed-light Admin/
  Login functional-glass layer and reduced-transparency/forced-contrast/no-filter fallbacks. The
  Dashboard update label is explicitly Bangkok time, while broader timestamp policy remains.
- OSM attribution remains disabled/hidden. The measured controls/collision portion is resolved:
  Public targets are 44 px around retained 36 px visuals, route-order targets are 44 px, and the
  240 px dock does not collide at 320 px.
- The scoped stop thumbnail is now a semantic button; raw image sizing/loading/error behavior remains.
  **Narrowed:** Vehicles/Routes/Stops/Source Health/Feedback initial failures are inline, distinct
  from empty, and retryable. **Resolved for bounded source/browser evidence:** master-data save/delete
  paths now expose semantic retained recovery and shared destructive confirmation.

### 6.4 Detector verification and positive evidence

The final Signal Lens detector and fresh Level 1 repeat return `[]`; the finish reviewer reports
`PASS`. The broader contrast pass retains one reviewed advisory for the pre-existing tiled `map-bg`
fallback, an actual map surface rather than a new decorative grid. Detector/reviewer output is not
accessibility or human acceptance evidence.

Positive evidence to preserve: public map/tour/feedback code splitting, memoized public components,
deterministic canonical expiry/route tests, explicit device-health privacy text, shared Admin
resource/dialog ownership, named actions, accessible ordered-list/alert semantics in
RouteStopsModal, responsive Admin card/table splits, and lint with zero errors.

No new Impeccable fix command is recommended by this bounded re-audit. Preserve the verified
mutation contract; existing open findings remain governed by their Roadmap dependencies and evidence
gates rather than an unscoped polish pass.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff under D-008. T10/T12 are complete for exact
scopes. T11 needs backend/role/lifecycle and external Android evidence. T12 human/runtime acceptance
remains unverified. T14's first ten slices remain accepted and the eleventh shared lifecycle slice
is complete for this Dashboard & UX source/unit/browser-regression scope at `70f42c1`; Production
Readiness and Roadmap may consume it.
Research stays blocked on T13. No new owner decision is required.

Confidence is High for source-visible separation/ownership, Medium for synthetic request/motion/
viewport/contrast/material evidence, and Low for assistive technology, user comprehension, real
operations, devices, and deployed outcomes.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed. D-011's shared bright-neutral Admin Liquid Glass foundation,
bounded CRUD mutation feedback, and internal browser transport refactor are accepted for their exact
scopes while preserving Public identity and all Login/page contracts.

Dashboard & UX is validated at `70f42c1` with current predecessors and the technical audit.
Production Readiness and Roadmap may consume these results; Security/DevOps/Observability remains
independently current at `1eec866...`.

## 9. T12 Implementation Re-audit — 2026-08-01

**Finding: accountable feedback triage and safe source operations were absent from the admin journey
— Partially Resolved.** The admin sidebar now distinguishes a Super Admin/Dev feedback inbox from an
all-admin, read-only source-health surface. The inbox exposes case status, responsible actor, bounded
note, selected deletion reason, restore deadline, and a recent-password confirmation. The health page
has explicit empty/loading/error text and explains that recovery/credential actions do not belong
there. These pages are separate from the existing dashboard, so the static dashboard label and lack of
an exception-first summary remain **Still Present**.

At the T12 checkpoint no browser usability, keyboard/focus, screen-reader, role-denial, or staff
acceptance run was authorized. T14 now supplies scoped keyboard evidence and the later bounded
Admin hierarchy foundation, but human/assistive-technology acceptance and T11-backed operations
remain independent findings.

## 10. M-20260807-02/03 Predecessor Re-audit — 2026-08-07

The simulator and generated-test-artifact maintenance changes no rider/admin component, route, state
model, styling, or browser behavior. Infrastructure & Device is current again and retains the rule
that simulator output is test evidence only. The technical audit above newly makes existing
accessibility and integrity defects explicit; it does not authorize a redesign or claim browser/user
acceptance.
