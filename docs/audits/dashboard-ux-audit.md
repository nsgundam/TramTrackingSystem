# Dashboard & UX Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: acada7f618ca74d32e7b5b76f3c75e69e4aa3354
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture/Backend/Frontend/Infrastructure & Device audits, docs/decision-queue.md, docs/research/, roadmap/task records, shuttle-tracking-web/app/, shuttle-tracking-web/components/, shuttle-tracking-web/hooks/, shuttle-tracking-web/services/, shuttle-tracking-web/types/, shuttle-tracking-web/utils/, shuttle-tracking-web/tests/, full frontend lint/build evidence, and the 2026-08-07 Impeccable technical audit/detector pass
- Reviewed at: 2026-08-07T15:48:28+07:00
- Validation state: Validated
- Predecessor baselines: Product and Frontend at their recorded 6697acbd62c740039722769588b1c464231e5ce1 plus T12 addenda committed at 4e0dfaa9faa1ca3e3b490d310ecf5dad54b913ba; Infrastructure & Device revalidated with M-20260807-02/03 on 2026-08-07

## 1. Executive Summary

The repository has three deliberately separate UI audiences: a canonical-only public rider map, an authenticated but limited admin/master-data dashboard, and no current research dashboard. T8 is resolved for the limited rider projection: the map will not present a locally expired/non-live vehicle as live, and tests cover expiry, route switch, and newer-live restoration.

D-001=C requires more than that projection. Riders still do not receive a clear service/no-service/
recovery explanation. T10 supplies Admin route-stop composition; T12 adds source health, feedback
triage, and limited role-specific navigation. Admins still lack trip/history/timeout exceptions and
Mobile recovery.
The research scope remains a future authenticated developer surface and must not be exposed through
public/admin operations pages.

The owner has requested a public-theme Dashboard redesign, but its information hierarchy and visual
acceptance belong to T14 after a bounded dashboard brief. T10 and T12 provide their exact bounded
operations/data-policy surfaces; T11 remains independently blocked. This audit does not authorize an
unbounded redesign.

The required Impeccable technical audit scores the current frontend **9/20 (Poor)** with no P0,
nine P1, ten P2, and one P3 finding. The product-specific public/admin separation is visible, but
production-quality implementation integrity fails on truthful live state, modal/focus/form
accessibility, false feedback association fallback, responsive touch targets, and missing research
surface. These findings constrain T14 and release evidence; this profile does not implement them.

## 2. Scope and Freshness

This profile reviews information architecture, truthfulness, separation of public/operations/research surfaces, loading/error/accessibility states, and task placement. It is not a browser usability study, accessibility certification, user research, device/pilot, or production service test.

Product and Frontend remain validated for the committed T12 scope. Infrastructure & Device was
revalidated after M-20260807-02/03; those changes affect simulator/test tooling only and do not alter
application UI. This run inspected frontend source, lint/build/test evidence, and one full Impeccable
detector pass. It did not run axe, contrast measurement, keyboard/screen-reader sessions, mobile
devices, user research, production traffic, or runtime retention; static findings are not an
accessibility certification.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public expired/non-live Marker could overstate service | Resolved | T8 canonical projection and synthetic tests remove Marker/count/ETA at expiry and prevent route-switch recurrence until newer live state. |
| Public rider state was fully explanatory | Still Present | Neutral marker/count/ETA behavior does not identify disconnected, stale, no service, dependency failure, last update age, or recovery. |
| Admin live map had no state visibility | Partially Resolved | LiveMap displays connection and live/stale/no-service/unknown counts, including stale last-known visualization. It is not exception-first and has no readiness/action path. |
| Admin dashboard was an accountable operations surface | Still Present | Static green label and master-data counts coexist with no dashboard-level exception summary or recovery actions. Source health and feedback triage now exist as separate pages; route publishing remains separate. |
| Route-stop management journey existed | Resolved | The Routes page presents a route-detail modal for ordered active-stop add/remove/reorder and publish. Build/lint/CI evidence passes; no stateful browser/cache confirmation was run. |
| Feedback capture had staff triage/privacy journey | Partially Resolved | T12 implements notice/receipt, Super Admin/Dev triage, selected reason delete/restore, and safe health fields. No usability/accessibility/human acceptance evidence exists. |
| Research data had an appropriate dashboard | Still Present | No research route/UI has session/source/time filters, metric definitions, sample counts, uncertainty labels, drill-down or bounded export. Existing absence preserves the no-raw-public invariant. |
| Role-specific UX enforced the new hierarchy | Partially Resolved | T12 session hydration and Sidebar hide the feedback inbox from `ADMIN` while the server remains authoritative. General capability rendering, account lifecycle, research navigation, and role-denial acceptance remain absent. |
| Dashboard public-theme direction had a bounded specification | Still Present | Direction is recorded, but exact target screens, priority questions/actions, shared tokens and accessible visual acceptance remain unbounded. T14 owns it. |
| Modal, focus, form, and document accessibility met a release baseline | New Finding | Root zoom/language settings, systemic dialog/focus omissions, unassociated labels/selection state, and an off-screen focusable Mobile sidebar create source-visible WCAG risks. No automated or human accessibility acceptance exists. |
| Feedback vehicle association failed safely | New Finding | Public Feedback substitutes and auto-selects hard-coded vehicles when the active-vehicle fetch fails, so a real complaint can be attached to the wrong vehicle without disclosure. |

## 4. Audience and Information Boundary

| Audience | Allowed present/future information | Prohibited/required separation |
|---|---|---|
| Public rider | Canonical route/stops/live state, neutral ETA, feedback and truthful service messaging. | No source identity, raw telemetry, credentials, research comparison, unrestricted history or admin actions. |
| ADMIN operations | Authorized route publishing, source/device/trip exception and feedback workflow data. | Must be server-authorized; not raw research diagnostic data or higher-privilege deletion/export by default. |
| SUPER_ADMIN/DEV | Approved privileged actions and separate research surfaces. | Controls depend on D-007 pending lifecycle/re-auth/audit/restore policy; no implicit UI authority. |
| Research developer | Session-scoped metrics/aggregates, data definitions, limitations, bounded exports. | Separate route/auth; displayed route conformance and reported accuracy must not be labeled ground truth. |

## 5. Required UX Task Placement

- T10 is complete for its route-detail management scope. Keep the post-save public-read confirmation as an approved-target validation need, not a claim based on modal source alone.
- T11 needs compact authenticated operations paths for active/auto-closed trips, protected history/detail, stale/silent exception, Mobile claim/revoke and audited emergency recovery only after backend APIs and Android acceptance evidence exist. Do not place driver runtime or sender secret entry in Admin UI.
- T12 has D-009 policy. Its feedback inbox/status/assignment and read-only source/device views must render only server-authorized approved actions and clear privacy/retention/deletion/restore controls.
- T14 owns the public-theme Dashboard visual system and hierarchy: its brief must identify questions/actions, system/error states, responsive/accessibility criteria, and research/operations separation before styling work.

## 6. Impeccable Technical Audit

### 6.1 Audit health score

| Dimension | Score | Key finding |
|---|---:|---|
| Accessibility | 1/4 | Root zoom/language, dialog/focus, form naming, sidebar keyboard, and live-region gaps. |
| Performance | 2/4 | Useful code splitting exists, but route geometry is eager and map animation work is not consistently cancelled. |
| Responsive Design | 2/4 | Admin card/table breakpoints exist; small touch targets and 320px overlay collisions remain. |
| Theming | 2/4 | Public tokens exist, while admin/legacy colors and forced light mode remain inconsistent. |
| Implementation Integrity | 2/4 | Product-specific separation exists, but operational/feedback fallback states can mislead. |
| **Total** | **9/20 — Poor** | **0 P0; 9 P1; 10 P2; 1 P3.** |

Implementation integrity verdict: **Fail for production-quality Dashboard/UX.** The implementation is
not generic—its rider map, source health, feedback, and route operations are product-specific—but a
green dashboard badge, stale live-map state, and hard-coded feedback fallback can communicate facts
the system has not established.

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
5. **Public service state is not explanatory.** `hooks/useSocketConnection.ts:32-56` does not expose
   reconnect/error state; Availability and StopInfo can turn dependency/geometry failure into a
   neutral live count or “no vehicle” state; the preloader can reveal an empty map after timeout.
6. **Admin operational truth is overstated.** `app/admin/dashboard/page.tsx:26-49,64-88` counts active
   master data as “active & tracking,” turns API failure into zeroes, and always renders “Live System
   Active.” `components/admin/LiveMap.tsx:28-137` does not locally expire a last live state after
   disconnect or remove every vehicle absent from a later hydration snapshot.
7. **Feedback can acquire a false vehicle.** `components/public/FeedbackModal.tsx:50-104` substitutes
   `VH001`/`VH002` after an API failure, auto-selects one, and submits that association without
   disclosing degraded data.
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

The full-web detector produced two advisory results. The grid-background warning in
`app/globals.css:91-95` is a map-surface false positive; the gray-on-color warning in
`components/admin/StopModal.tsx:146-147` targets an empty element. Actionable detector findings after
context review are zero, but the detector has material false negatives and is not accessibility
acceptance evidence.

Positive evidence to preserve: public map/tour/feedback code splitting, memoized public components,
deterministic canonical expiry/route tests, explicit device-health loading/error/empty/privacy text,
accessible names/ordered-list/alert semantics in RouteStopsModal, responsive Admin card/table splits,
and lint with zero errors.

Recommended evidence-to-work sequence is `$impeccable harden`, `$impeccable adapt`,
`$impeccable optimize`, `$impeccable document`, then `$impeccable polish`, followed by another
technical audit. These are T14 handoff inputs, not implementation authorization.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 remains blocked by D-008. T10/T12 are complete for exact scopes. T11 needs backend/role/lifecycle
and external Android evidence. T12 usability/accessibility acceptance remains unverified. T14 must
consume the P1/P2 audit evidence, define exact target screens, priority operational questions/actions,
role views, responsive/accessibility acceptance, and the incumbent identity to preserve before any
implementation. No new owner decision is approved by this audit.

Confidence is High for source-visible UI separation and technical implementation gaps, Medium for T8 synthetic journey evidence and static severity ranking, and Low for measured contrast, assistive technology, user comprehension, real operations, devices, and deployed service behavior.

## 8. Handoff

Dashboard & UX is validated against 4e0dfaa plus the M-20260807-02/03 Infrastructure predecessor and
the 2026-08-07 technical audit. Security/DevOps/Observability, Production Readiness, and Roadmap were
subsequently revalidated on 2026-08-07 and carry these truthfulness/accessibility findings without
treating them as fixed.

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
