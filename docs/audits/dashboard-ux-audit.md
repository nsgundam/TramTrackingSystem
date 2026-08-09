# Dashboard & UX Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: bd34552c09eea59ad9e2adee160483b2be433744
- Evidence scope: docs/project-knowledge-base.md,
  Product/Architecture/Backend/Frontend/Infrastructure & Device audits,
  docs/decision-queue.md, docs/research/, docs/tasks/,
  docs/operations/university-server-network-handoff.md, shuttle-tracking-web/app/,
  shuttle-tracking-web/components/, shuttle-tracking-web/config/,
  shuttle-tracking-web/hooks/, shuttle-tracking-web/services/, shuttle-tracking-web/types/,
  shuttle-tracking-web/utils/, shuttle-tracking-web/tests/, full current frontend check evidence,
  and the current Impeccable technical audit/detector pass
- Reviewed at: 2026-08-09T21:17:05+07:00
- Validation state: Validated
- Predecessor baselines: docs/audits/product-audit.md and docs/audits/frontend-audit.md @
  bd34552c09eea59ad9e2adee160483b2be433744; docs/audits/infrastructure-device-audit.md @
  1eec86602c40c859d50dd9d369f636b103b6896f

## 2026-08-09 T14 first-slice re-audit

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

D-001=C requires more than that projection. T14 now gives riders a basic truthful service/connection
explanation and gives Admin explicit load/error/retry/snapshot/realtime/last-known states. T10
supplies Admin route-stop composition; T12 adds source health, feedback triage, and limited
role-specific navigation. Admins still lack trip/history/timeout exceptions and Mobile recovery.
The research scope remains a future authenticated developer surface and must not be exposed through
public/admin operations pages.

The owner approves substantial Admin Dashboard improvement but does not own the Public visual
surface. T14 must therefore preserve Public identity and split Admin restructuring into bounded
slices. T10 and T12 provide their exact bounded operations/data-policy surfaces; T11 remains
independently blocked. This audit does not authorize an unbounded redesign.

The required Impeccable re-audit scores the current frontend **10/20 — below the release baseline**
with no P0, seven open P1, ten P2, one P3, and two resolved P1 findings. Product-specific separation
and truth projections are now stronger, while modal/focus/form/navigation accessibility, the
narrowed Public explanation gap, responsive touch targets, performance/theming, exception-first
operations, and the missing research surface still constrain T14 and release evidence.

T9 changed how existing REST/Socket consumers select their backend, not what any surface displayed
or allowed. At that T9-only baseline, the UI score and all twenty technical findings were unchanged;
the T14 result above supersedes the two resolved and one narrowed truth findings.

## 2. Scope and Freshness

This profile reviews information architecture, truthfulness, separation of public/operations/research surfaces, loading/error/accessibility states, and task placement. It is not a browser usability study, accessibility certification, user research, device/pilot, or production service test.

Product and Frontend are revalidated at `bd34552...`; Infrastructure & Device remains current at
`1eec866...`. The preceding Dashboard & UX baseline was `1eec866...`. Exact T14 paths and checks are
recorded in `docs/tasks/T14-truthful-feedback-and-live-state.md`. Browser evidence uses isolated
mobile/desktop fixtures, not a university proxy, real service, assistive technology, physical mobile
device, user research, production traffic, or runtime retention; it is not accessibility
certification.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public expired/non-live Marker could overstate service | Resolved | T8 canonical projection and synthetic tests remove Marker/count/ETA at expiry and prevent route-switch recurrence until newer live state. |
| Public rider state was fully explanatory | Partially Resolved | The availability card identifies connected live, stale, no service, unknown, reconnecting, disconnected, unavailable, and empty state. Dependency-specific guidance, last-update age, and human comprehension remain absent. |
| Admin live map had no state visibility | Partially Resolved | LiveMap exposes separate snapshot/realtime status, retry, queued-version reconciliation, snapshot absence, and locally expired last-known state. It is not exception-first and has no operational action path. |
| Admin dashboard was an accountable operations surface | Partially Resolved | Explicit loading/error/retry/updated master-data state replaces false zeros and unconditional liveness. No dashboard-level exception summary or recovery actions exist; source health and feedback triage remain separate pages. |
| Route-stop management journey existed | Resolved | The Routes page presents a route-detail modal for ordered active-stop add/remove/reorder and publish. Build/lint/CI evidence passes; no stateful browser/cache confirmation was run. |
| Feedback capture had staff triage/privacy journey | Partially Resolved | T12 implements notice/receipt, Super Admin/Dev triage, selected reason delete/restore, and safe health fields. No usability/accessibility/human acceptance evidence exists. |
| Research data had an appropriate dashboard | Still Present | No research route/UI has session/source/time filters, metric definitions, sample counts, uncertainty labels, drill-down or bounded export. Existing absence preserves the no-raw-public invariant. |
| Role-specific UX enforced the new hierarchy | Partially Resolved | T12 session hydration and Sidebar hide the feedback inbox from `ADMIN` while the server remains authoritative. General capability rendering, account lifecycle, research navigation, and role-denial acceptance remain absent. |
| Dashboard public-theme direction had a bounded specification | Partially Resolved | D-011 fixes order and visual authority; the first truth/integrity slice is complete with exact paths/browser evidence. Accessibility/navigation is now the next eligible bounded slice; later Admin theme work still needs its own handoff. |
| Modal, focus, form, and document accessibility met a release baseline | Still Present | Root zoom/language settings, systemic dialog/focus omissions, unassociated labels/selection state, and an off-screen focusable Mobile sidebar create source-visible WCAG risks. No automated or human accessibility acceptance exists. |
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
- T14's first truth/integrity journey is complete. The next exact slice owns dialog/form/focus/
  keyboard behavior and the Mobile Admin sidebar while preserving Public identity. Later Admin
  hierarchy/theme work must identify questions/actions, states, responsive criteria, and research/
  operations separation before styling.

## 6. Impeccable Technical Audit

### 6.1 Audit health score

| Dimension | Score | Key finding |
|---|---:|---|
| Accessibility | 1/4 | Root zoom/language, dialog/focus, form naming, sidebar keyboard, and live-region gaps. |
| Performance | 2/4 | Useful code splitting exists, but route geometry is eager and map animation work is not consistently cancelled. |
| Responsive Design | 2/4 | Admin card/table breakpoints exist; small touch targets and 320px overlay collisions remain. |
| Theming | 2/4 | Public tokens exist, while admin/legacy colors and forced light mode remain inconsistent. |
| Implementation Integrity | 3/4 | Product-specific separation and fail-closed truth projections are tested; duplicated Public/Admin socket lifecycle and broader recovery surfaces remain. |
| **Total** | **10/20 — Below release baseline** | **0 P0; 7 open P1; 10 P2; 1 P3; 2 P1 resolved by T14.** |

Implementation integrity verdict: **Improved but not release-ready.** The rider map, source health,
feedback, and route operations are product-specific, and T14 removes the known false live/zero/
vehicle claims. Missing exception-first operations, accessibility, human evidence, and deployed
recovery keep the full Dashboard/UX below the release baseline.

### 6.2 P1 findings

1. **Root document accessibility.** `app/layout.tsx:9-14` disables user scaling and line 22 declares
   English for a primarily Thai public journey (WCAG 1.4.4 and 3.1.1 risk).
2. **Systemic dialog/focus failure.** `components/public/FeedbackModal.tsx:128-227`,
   `components/public/StopInfoCard.tsx:55-78`, Admin Route/Stop/Vehicle/RouteStops modals, and
   `app/admin/feedback/page.tsx:186-195` lack a consistent labelled `dialog`, modal semantics,
   initial/trapped focus, Escape handling, and focus restoration.
3. **Form naming and selected state.** Public Feedback, Login, Admin CRUD, and internal-note controls
   have visual labels/placeholders without consistent `id`/`htmlFor`, group semantics, or
   `aria-pressed`/radio state (WCAG 1.3.1, 3.3.2, and 4.1.2 risk).
4. **Off-screen Mobile navigation remains keyboard-active.** `components/admin/Sidebar.tsx:73-129`
   translates the closed drawer off screen without `inert`, focus containment, Escape, restoration,
   or `aria-current`; `app/admin/layout.tsx:26-30` and Sidebar close controls suppress the focus
   outline without an equivalent replacement.
5. **Public service explanation — Partially Resolved.** Connection and canonical service states are
   now explicit in Availability, but route/dependency-specific failure, last-update age, StopInfo,
   preloader recovery, and human comprehension remain incomplete.
6. **Admin operational truth — Resolved for T14 first slice.** Counts preserve loading/error/ready
   truth and the map reconciles snapshot/event/local-expiry state. Exception-first summaries and
   actions remain a separate product gap, not a false-state regression.
7. **False Feedback vehicle — Resolved.** Failure/empty responses create no option or selection;
   recovery requires a verified response and explicit selection before submit.
8. **Contrast is not governed end to end.** Low-emphasis slate labels appear on white surfaces, and
   arbitrary Route colors become backgrounds under small white text without a contrast constraint.
9. **The Dev/Research Dashboard is absent.** There is no protected route/navigation for session,
   source, device, firmware, time, sample count, missingness, metric definitions, uncertainty,
   drill-down, or bounded export.

### 6.3 P2 and systemic findings

- Loading/error/success/connection changes lack consistent `aria-live`/`role=status` announcements.
- Infinite pulse/preloader and repeated map fly/pan animation have no intentional
  `prefers-reduced-motion` alternative.
- `useShuttleTracker.ts:429-525` loads geometry for every active route before completion and can call
  OSRM per route; marker animation can start another `requestAnimationFrame` without cancelling the
  prior one.
- Public stop images use raw `<img>` without dimensions/lazy/error handling; the Admin map icon is
  externally hosted; Material Symbols load globally for a deferred tour.
- Public/admin/legacy styling mixes tokens and hard-coded palettes with no theme switch; timestamps
  use the viewer locale without an explicit operational timezone or last-refresh timestamp.
- OSM attribution is disabled/hidden; 36px map controls and roughly 33px route-order controls miss a
  44px touch target; the 280px BottomDock can collide with right-side controls at 320px.
- Stop thumbnails use a clickable `div` without keyboard activation; legacy CRUD pages use alerts
  and can turn fetch failure into an empty-looking state.

### 6.4 Detector verification and positive evidence

The pre-T14 full-web detector produced two non-actionable advisory results after context review. The
post-change scoped detector returned `[]`; it still has material false negatives and is not
accessibility acceptance evidence.

Positive evidence to preserve: public map/tour/feedback code splitting, memoized public components,
deterministic canonical expiry/route tests, explicit device-health loading/error/empty/privacy text,
accessible names/ordered-list/alert semantics in RouteStopsModal, responsive Admin card/table splits,
and lint with zero errors.

Recommended evidence-to-work sequence is `$impeccable harden`, `$impeccable adapt`,
`$impeccable optimize`, `$impeccable document`, then `$impeccable polish`, followed by another
technical audit. These are T14 handoff inputs, not implementation authorization.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff under D-008. T10/T12 are complete for exact
scopes. T11 needs backend/role/lifecycle and external Android evidence. T12 usability/accessibility
acceptance remains unverified. T14's first slice is complete; the next eligible exact slice is
accessibility/navigation, followed separately by measured responsive/performance and Admin
hierarchy/theme work. No new owner decision is required or approved by this audit.

Confidence is High for source-visible UI separation and technical implementation gaps, Medium for T8 synthetic journey evidence and static severity ranking, and Low for measured contrast, assistive technology, user comprehension, real operations, devices, and deployed service behavior.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed. D-011 binds the next T14 accessibility/navigation slice and the
same Public/Admin visual limits; this audit does not authorize a broad redesign.

Dashboard & UX is validated at `bd34552...` with current predecessors and the technical audit.
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

No browser usability, keyboard/focus, screen-reader, role-denial, or staff acceptance run was
authorized. Public service/no-service/recovery communication and the later T14 information hierarchy
remain independent findings.

## 10. M-20260807-02/03 Predecessor Re-audit — 2026-08-07

The simulator and generated-test-artifact maintenance changes no rider/admin component, route, state
model, styling, or browser behavior. Infrastructure & Device is current again and retains the rule
that simulator output is test evidence only. The technical audit above newly makes existing
accessibility and integrity defects explicit; it does not authorize a redesign or claim browser/user
acceptance.
