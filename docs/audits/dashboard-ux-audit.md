# Dashboard & UX Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: db723107e024fb293f75dc2268ba7a3c4f6f3bbe
- Evidence scope: docs/project-knowledge-base.md,
  Product/Architecture/Backend/Frontend/Infrastructure & Device audits,
  docs/decision-queue.md, docs/research/, docs/tasks/,
  docs/operations/university-server-network-handoff.md, shuttle-tracking-web/app/,
  shuttle-tracking-web/components/, shuttle-tracking-web/config/,
  shuttle-tracking-web/hooks/, shuttle-tracking-web/services/, shuttle-tracking-web/types/,
  shuttle-tracking-web/utils/, shuttle-tracking-web/tests/, full current frontend check evidence,
  and the current Impeccable technical audit/detector pass
- Reviewed at: 2026-08-10T01:49:03+07:00
- Validation state: Validated
- Predecessor baselines: docs/audits/product-audit.md and docs/audits/frontend-audit.md @
  db723107e024fb293f75dc2268ba7a3c4f6f3bbe; docs/audits/infrastructure-device-audit.md @
  1eec86602c40c859d50dd9d369f636b103b6896f

## 2026-08-10 T14 Public service explanation/recovery re-audit

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
with no P0, one open P1, eight P2, one P3, eight resolved P1, and two resolved P2 findings. Product-
specific truth/recovery/keyboard behavior, measured motion/request/viewport/contrast budgets, and
the Admin theme/hierarchy foundation are stronger, while broader Admin/legacy theming, exception-
first operations, and the missing Research surface still constrain release.

T9 changed how existing REST/Socket consumers select their backend, not what any surface displayed
or allowed. At that T9-only baseline, the UI score and all twenty technical findings were unchanged;
the T14 result above supersedes the two resolved and one narrowed truth findings.

## 2. Scope and Freshness

This profile reviews information architecture, truthfulness, separation of public/operations/research surfaces, loading/error/accessibility states, and task placement. It is not a browser usability study, accessibility certification, user research, device/pilot, or production service test.

Product and Frontend are revalidated at `db72310...`; Infrastructure & Device remains current at
`1eec866...`. Exact T14 paths/checks are recorded in all six T14 task specifications. Browser evidence
uses isolated mobile/desktop fixtures, not a university proxy, real service, assistive technology,
physical mobile device, user research, production traffic, or runtime retention; it is not
accessibility certification.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public expired/non-live Marker could overstate service | Resolved | T8 canonical projection and synthetic tests remove Marker/count/ETA at expiry and prevent route-switch recurrence until newer live state. |
| Public rider state was fully explanatory | Resolved for bounded source/browser scope | Availability, StopInfo, ETA, Retry, canonical age, and slow-load messaging distinguish the snapshot/connection/canonical states the client can know without inventing causes. Human/assistive-technology comprehension and deployed recovery remain release evidence. |
| Admin live map had no state visibility | Partially Resolved | LiveMap exposes one responsive snapshot/realtime/canonical summary, retry, queued-version reconciliation, snapshot absence, and locally expired last-known state. T11-backed exception/action paths remain absent. |
| Admin dashboard was an accountable operations surface | Partially Resolved | Explicit loading/error/retry/updated master-data state, a primary canonical map, labelled inventory, and existing safe shortcuts replace false/flat hierarchy. No T11-backed exception summary or recovery actions exist. |
| Route-stop management journey existed | Resolved | The Routes page presents a route-detail modal for ordered active-stop add/remove/reorder and publish. Build/lint/CI evidence passes; no stateful browser/cache confirmation was run. |
| Feedback capture had staff triage/privacy journey | Partially Resolved | T12 implements notice/receipt, Super Admin/Dev triage, selected reason delete/restore, and safe health fields. T14 browser-verifies the scoped Feedback form/dialog/sensitive-confirmation keyboard semantics; no human assistive-technology or runtime acceptance exists. |
| Research data had an appropriate dashboard | Still Present | No research route/UI has session/source/time filters, metric definitions, sample counts, uncertainty labels, drill-down or bounded export. Existing absence preserves the no-raw-public invariant. |
| Role-specific UX enforced the new hierarchy | Partially Resolved | T12 session hydration and Sidebar hide the feedback inbox from `ADMIN` while the server remains authoritative. General capability rendering, account lifecycle, research navigation, and role-denial acceptance remain absent. |
| Dashboard public-theme direction had a bounded specification | Resolved for bounded foundation | D-011's Admin authority is implemented through scoped semantic tokens and an exact map-first shell/Dashboard contract; Public identity and broader Admin pages remain separate. |
| Modal, focus, form, and document accessibility met a release baseline | Partially Resolved | Root/dialog/form/Mobile behavior plus reduced-motion, audited 44 px targets, and scoped light-surface/route-badge contrast evidence now exist. Broader live/touch coverage, assistive technology, and human acceptance remain open. |
| Feedback vehicle association failed safely | Resolved | Public Feedback exposes loading/error/empty/retry, creates no fallback vehicles or selection, and only submits an explicitly chosen ID returned by a successful list. Pure and mobile-browser evidence cover failure, recovery, selection, and posted ID. |

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
- T14's first six journeys are complete. The Public explanation P1 is closed for bounded source/
  browser evidence. The next exact slice is bounded Admin master-data theme convergence. It must
  exclude Public/Login, T11 exceptions, Research/T13, API/auth/schema, and external-runtime work.

## 6. Impeccable Technical Audit

### 6.1 Audit health score

| Dimension | Score | Key finding |
|---|---:|---|
| Accessibility | 3/4 | Root/dialog/form/sidebar plus scoped motion/touch/contrast and Availability/ETA/preloader status evidence exist; broader live/touch, assistive-technology, and human evidence remain. |
| Performance | 3/4 | Selected-route/deduplicated geometry and owned marker cancellation are tested; raw/external/global assets and deployed budgets remain. |
| Responsive Design | 3/4 | The measured 320 px collision and audited 44 px targets are corrected while retaining Public visuals; broader device/content/human coverage remains. |
| Theming | 3/4 | Public tokens plus a scoped Admin shell/Dashboard semantic extension exist; broader Admin/legacy colors and forced light/no-switch behavior remain. |
| Implementation Integrity | 3/4 | Product-specific separation, fail-closed truth projections, and bounded Public recovery are tested; duplicated Public/Admin socket lifecycle and broader recovery surfaces remain. |
| **Total** | **15/20 — Below release baseline** | **0 P0; 1 open P1; 8 P2; 1 P3; 8 P1 and 2 P2 resolved by T14; the theme P2 is narrowed.** |

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
- Public stop images use raw `<img>` without dimensions/lazy/error handling; the Admin map icon is
  externally hosted; Material Symbols load globally for a deferred tour.
- **Narrowed:** Public tokens and an Admin-only shell/Dashboard semantic extension now coexist;
  broader Admin/legacy bodies still use hard-coded palettes and no theme switch/dark mode exists.
  The Dashboard update label is explicitly Bangkok time, while broader timestamp policy remains.
- OSM attribution remains disabled/hidden. The measured controls/collision portion is resolved:
  Public targets are 44 px around retained 36 px visuals, route-order targets are 44 px, and the
  240 px dock does not collide at 320 px.
- The scoped stop thumbnail is now a semantic button; raw image sizing/loading/error behavior and
  legacy CRUD alert/empty-looking fetch failure remain open.

### 6.4 Detector verification and positive evidence

The final Public-recovery detector returns `[]`. The broader contrast pass retains one reviewed
advisory for the pre-existing tiled `map-bg` fallback, an actual map surface rather than a new
decorative grid. Detector output is not accessibility or human acceptance evidence.

Positive evidence to preserve: public map/tour/feedback code splitting, memoized public components,
deterministic canonical expiry/route tests, explicit device-health loading/error/empty/privacy text,
accessible names/ordered-list/alert semantics in RouteStopsModal, responsive Admin card/table splits,
and lint with zero errors.

Recommended evidence-to-work sequence is `$impeccable harden`, `$impeccable adapt`,
`$impeccable optimize`, `$impeccable document`, then `$impeccable polish`, followed by another
technical audit. These are T14 handoff inputs, not implementation authorization.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff under D-008. T10/T12 are complete for exact
scopes. T11 needs backend/role/lifecycle and external Android evidence. T12 human/runtime acceptance
remains unverified. T14's first six slices are complete; bounded Admin master-data theme convergence
is next. Research remains blocked on T13. No new owner decision is required.

Confidence is High for source-visible separation/ownership, Medium for synthetic request/motion/
viewport/contrast evidence, and Low for assistive technology, user comprehension, real operations,
devices, dark-theme behavior, and deployed outcomes.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed. D-011 permits a bounded Admin master-data theme-convergence
slice; the exact handoff must preserve Public/Login identity and exclude T11 exceptions, Research/
T13 data, API/auth/schema changes, and external-runtime work.

Dashboard & UX is validated at `db72310...` with current predecessors and the technical audit.
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
