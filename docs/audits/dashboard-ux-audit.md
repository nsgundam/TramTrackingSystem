# Dashboard & UX Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/research/T7-owner-input-questionnaire.md`, `docs/tasks/T7-raw-research-observations.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/audits/product-audit.md`, `docs/audits/frontend-audit.md`, `docs/audits/infrastructure-device-audit.md`, `shuttle-tracking-web/app/page.tsx`, `shuttle-tracking-web/app/admin/dashboard/page.tsx`, `shuttle-tracking-web/app/admin/layout.tsx`, `shuttle-tracking-web/app/admin/login/page.tsx`, `shuttle-tracking-web/app/admin/routes/page.tsx`, `shuttle-tracking-web/app/admin/stops/page.tsx`, `shuttle-tracking-web/app/admin/vehicles/page.tsx`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/public/AppTour.tsx`, `shuttle-tracking-web/components/public/AvailabilityCard.tsx`, `shuttle-tracking-web/components/public/StopInfoCard.tsx`, `shuttle-tracking-web/components/public/VehicleInfoCard.tsx`, `shuttle-tracking-web/components/public/FeedbackModal.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/components/admin/Sidebar.tsx`, `shuttle-tracking-web/contexts/AuthContext.tsx`, `shuttle-tracking-web/hooks/useShuttleTracker.ts`, `shuttle-tracking-web/hooks/useSocketConnection.ts`, `shuttle-tracking-web/hooks/useVehicleTracking.ts`, `shuttle-tracking-web/hooks/useRouteGeometry.ts`, `shuttle-tracking-web/services/publicApi.ts`, `shuttle-tracking-web/types/canonical-state.ts`, and `shuttle-tracking-web/proxy.ts`
- Reviewed at: `2026-07-29T11:15:14+07:00`
- Validation state: **Validated**
- Predecessor baselines: Product `@ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`; Frontend and Infrastructure & Device `@ fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`; Architecture and Backend `@ fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`
- Previous report baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`

## 1. Executive Summary

The public tracker now consumes the T6 canonical state through initial REST hydration and Socket.IO
updates with epoch/version guards. It filters markers by backend route authority, shows last-known
locations dimmed for stale state, removes markers for `no_service`/`unknown`, suppresses ETA for
non-live states, and presents the public `Active Trams` count from canonical live states. The public
surface intentionally remains neutral under D-005 rather than exposing operational source-health
vocabulary.

The admin live map now hydrates the canonical snapshot, displays connected/reconnecting/disconnected
state, and summarizes live/stale/no-service/unknown counts. Admin CRUD and the public feedback flow
remain useful controlled-MVP surfaces.

The UX is not yet a daily-operations or research dashboard. The admin dashboard still shows a static
“Live System Active” badge and database counts without visible readiness/error/retry context. There is
no source-health/failover, trip exception, feedback triage, history, or protected research surface.
Public ETA remains a client estimate without visible age/confidence, and the public live count can
become stale after the local freshness timer removes a marker because the count state is not
recalculated in that expiry callback. No browser, screen-reader, or field user session was observed
in this re-audit.

## 2. Scope, Freshness, and Predecessor Gate

The previous Dashboard & UX report was based at `847a18c...`. Product remains validated at that
baseline, while Frontend and Infrastructure & Device are now validated at `fa9441b...`; the
predecessor gate passes.

The evidence comparison from the previous baseline to the current commit included the T6 public
component/hook split, canonical types/API, route-geometry cache, admin live map, public neutral
presentation, onboarding/feedback components, and current research/decision documentation. Current
uncommitted D-006 changes are treated as coordination evidence only, not as an implemented research
UI or export.

This review covers rider and admin journeys, truthful status vocabulary, map/ETA information
hierarchy, loading/empty/error states, feedback capture, navigation, onboarding, visible accessibility
affordances, and separation of public/operations/research surfaces. It is not a browser, screen-reader,
usability study, or formal WCAG audit.

Frontend lint, TypeScript, and production webpack build passed in the current Frontend re-audit, with
the two existing non-blocking lint warnings. No runtime/browser session was used as a substitute for
those missing interaction checks.

## 3. Prior-Finding Revalidation

| Prior finding | State | Current evidence and implication |
|---|---|---|
| Live data had no user-visible freshness model | **Partially Resolved** | Admin `LiveMap` exposes connection state and live/stale/no-service/unknown counts; public marker and ETA behavior follows canonical freshness but intentionally hides operational labels under D-005. Public has no last-update age or retry panel. |
| Admin dashboard was not an operations dashboard | **Still Present** | The live map has canonical state summaries, but the dashboard retains database count cards and a static “Live System Active” badge; it has no readiness/error state, source exceptions, trip exceptions, feedback queue, or actionable retry. |
| Public route selection/ETA could overstate certainty | **Partially Resolved** | Backend route authority now controls marker visibility and unknown route removes the marker; non-live ETA is suppressed. Live ETA is still a browser estimate with no visible data age/confidence or service guarantee. |
| Public no-vehicle/no-data state was unclear | **Partially Resolved** | Canonical `no_service`/`unknown` states remove markers and null ETA; public copy still collapses null ETA into “ยังไม่มีรถในสายนี้” and does not distinguish zero service, stale, dependency failure, or unavailable route. This neutral behavior is intentional but not fully explanatory. |
| Error and empty states were inconsistent | **Partially Resolved** | Public/admin canonical hydration has fallback origins and admin connection labels; feedback and CRUD have loading/error states. Dashboard failures remain console-only, mutations use browser alerts/confirm, and route-geometry failure has no persistent retry UI. |
| Public feedback entry was missing | **Resolved** | Feedback button/modal supports type, vehicle, message, loading, validation, API error, and success states. Staff triage, receipt, privacy, and retention remain absent. |
| Onboarding selectors appeared stale | **Resolved** | Current tour targets match rendered ETA, next-stop, route-selector, and feedback classes; runtime target sequencing and automatic marker selection remain browser-unverified. |
| Operational source-health/device visibility was absent | **Partially Resolved** | Admin sees canonical service-state counts and connection state, but no source-level health, priority/failover outcome, last-seen age, or device analytics surface is navigable. |
| Keyboard/accessibility affordances were incomplete | **Still Present** | Native buttons and labels cover many controls, but stop imagery is activated by a clickable `div`, icon-only controls rely on titles in places, modal close buttons lack explicit accessible names, and no keyboard/screen-reader evidence exists. |

## 4. Consumer and Journey Review

| Consumer/journey | Current path | UX result |
|---|---|---|
| Rider first visit | Branding, map, route menu, live-only count, feedback, AppTour | Understandable controlled demo; public status vocabulary is intentionally minimal and browser recovery is unverified. |
| Rider route/stop | Active routes/stops from API, versioned route geometry cache, OSRM then bundled fallback, selected stop card | Useful map flow; geometry/API failure remains a console/log condition rather than a persistent user-facing retry state. |
| Rider vehicle/ETA | Canonical REST/Socket state, route-authority filtering, live marker, dimmed stale last-known marker, client speed/geometry ETA | Marker truthfulness is improved; ETA is still a client estimate and has no visible freshness/uncertainty framing. |
| Rider feedback | Modal fetches active vehicles, submits public feedback, shows success/error | Recoverable pilot capture; fallback vehicle list can be stale, and there is no receipt ID, privacy/retention notice, or support expectation. |
| Admin sign-in | Cookie-presence proxy, client JWT expiry check, backend API authentication | Backend remains authority; UI can briefly render from stale/present cookie state and no role distinction for research exists. |
| Admin service check | DB count cards plus canonical live map and connection/state summary | Better than the prior map-only surface, but still not exception-first or readiness-backed. |
| Admin master data | Vehicle, route, stop pages with responsive list/table and modal CRUD | Adequate MVP master-data workflow; no route-stop composition or trip/history workflow. |
| Developer/researcher | No dedicated route, filters, metrics, protected history, or export | D-004 research dashboard is not implemented and must remain separate from public/operations UX. |

## 5. Truthful State and Information Hierarchy

Public `AvailabilityCard` now receives `vehicleStateCounts.live`, which is materially better than
counting visible Leaflet markers. However, `scheduleLocalExpiry` removes an expired live marker and
recalculates ETA without recomputing `vehicleStateCounts`; the public Active Trams number can therefore
remain high until a newer canonical state arrives. This is a **New Finding** and should be fixed before
using that number as a rider-facing availability summary.

The public state design follows D-005: stale/no-service/unknown labels and source-health wording are
not shown publicly. That choice is acceptable only while marker removal, stale last-known behavior,
and ETA suppression remain truthful. The public surface should not imply that the live-only count is a
backend service guarantee until the expiry count gap is closed.

The admin map's state summary is based on the latest accepted canonical state per vehicle and receives
server transitions from the health sweep. It does not independently show last-update age or a retry
action, and the dashboard header remains a static green label. API readiness and Socket.IO connection
state are therefore still split across hidden fetch behavior and the map widget.

ETA is calculated in the browser from route geometry, position, recent client speed samples, a speed
floor, route-stop order, and dwell assumptions. It is an estimate, not measured accuracy or a service
guarantee. It should remain null for non-live/unknown route states and should be qualified in any future
operations or research surface with its data age and metric definition.

## 6. Public UX Review

Strengths:

- Map-first hierarchy is appropriate for a rider tracking a shuttle.
- Dynamic route names/colors and ordered stop data use current API boundaries.
- Canonical route authority prevents a selected viewer route from inventing a vehicle assignment.
- Stale last-known markers are visually dimmed, while no-service/unknown states do not show a false
  current location or ETA.
- Feedback has loading, validation, error, and success states; the route geometry cache validates a
  stop signature and falls back to bundled data.

Gaps:

- No public “updated X ago”, reconnect, or retry context; neutral presentation is not the same as
  explicit freshness evidence.
- Local expiry can leave the Active Trams count stale until the next canonical state.
- No persistent user-facing route/stop/geometry failure panel; preload completion can leave incomplete
  map data without a recovery action.
- Browser geolocation denial uses `alert` only; nearest-stop has no inline recovery explanation.
- Feedback auto-closes after success and provides no receipt/reference or retention notice.
- Stop imagery is a clickable `div`, and some icon-only controls rely on `title` rather than explicit
  accessible names.

## 7. Admin and Operations UX Review

The admin shell has Dashboard, Vehicles, Routes, and Stops. CRUD pages provide loading and empty
states, responsive layouts, modal add/edit, and delete confirmation. The live map adds a canonical
connection pill and service-state counts, and uses stale last-known markers with lower opacity.

The dashboard still does not expose:

- API readiness or a dashboard-level fetch error/retry state;
- source-level online/stale/disabled/never-seen status, priority, or failover outcome;
- last update age, stale/silent vehicle exceptions, or active-trip exceptions;
- trip/history/sample reads and route-stop composition;
- feedback intake/ownership/triage; or
- recent operational signals, deployment readiness, or failure exceptions.

For D-001=A this gap is consistent with a controlled demonstration. It is not consistent with a daily
campus operations claim. The first operational increment should be a compact exception panel backed by
stable backend read contracts, not a broad analytics dashboard.

## 8. Research Dashboard Boundary

The approved D-004 surface must be a separate authenticated developer/research route. It should
compare Mobile/Socket.IO, ESP32/Wi-Fi/HTTP, and LoRaWAN/Gateway/TTN facts with experiment/session
filters, event/receive times, latency/cadence/missingness, selection/failover, reported accuracy,
route-conformance distance, pairwise disagreement, ground-truth error when available, and bounded
redacted export.

Nothing in the current UI provides those filters, typed metric definitions, sample counts, p50/p95
rules, timezone/retention boundaries, excluded-observation visibility, drill-down, or export. D-006
now specifies an isolated target and safer session/time-scoped CSV defaults, but does not authorize a
public or ordinary-admin research surface. The public tracker must not expose raw source comparison,
credentials, or unrestricted history. Route distance remains a conformance proxy and reported device
accuracy remains uncertainty, not measured error.

## 9. Loading, Error, and Accessibility Review

| State | Current behavior | Required improvement |
|---|---|---|
| Loading | Public preloader, feedback/dashboard loaders, dynamic map, and CRUD lists show spinners/placeholders | Keep visible until the relevant read succeeds; do not let a preloader hide a failed route. |
| Empty | CRUD pages explain how to add data; selected stop reports no vehicle; canonical non-live markers disappear | Add explicit public neutral explanation where appropriate and admin no-exception/unknown states. |
| Error | Feedback/login are inline; dashboard stats are console-only; CRUD uses alert/confirm; geolocation uses alert | Use shared inline error with cause, retry/refetch, and affected resource. |
| Destructive action | Native confirmation before route/stop/vehicle deletion | Preserve confirmation but identify entity and downstream impact. |
| Keyboard/screen reader | Many native controls and labels; image click, icon titles, modal close, map interactions incomplete | Add accessible names/focus management and verify with browser tooling; this is not a formal WCAG result. |

## 10. Actionable UX Handoffs

| Capability | Measurable outcome | Owner | Acceptance signal | Privacy/data boundary | Stage |
|---|---|---|---|---|---|
| Public live-count correctness | Local freshness expiry updates both marker visibility and live count; ETA recalculates consistently | Frontend | Expiry fixture proves marker/count/ETA transition without a new server event | Canonical projection only | T6/T8 |
| Public truthful state | Rider behavior remains truthful for live, stale, no-service, unknown, reconnect, and route-unknown cases | Frontend + Backend | Browser/runtime cases cover initial load, expiry, reconnect, no route, and no service | Neutral public vocabulary; no raw source display | T8 |
| Admin exception view | Operator sees API/socket status, stale/silent count, source exceptions, and retry action | Dashboard + Backend | Fixture produces each exception and UI links to detail | Authenticated operations data | Before daily operations |
| Route-authority presentation | Marker/ETA is never silently attributed to selected route when backend route is unknown | Backend + Frontend | Multi-route fixture and route-switch test | No raw source display publicly | T6/T8 |
| Feedback recovery | Submission provides receipt/retention notice and approved admin path | Product + Dashboard + Backend | Intake-to-case acceptance test with privacy/deletion rules | IP/message access and retention owner required | D-001 C / T12 |
| Research dashboard | Authenticated users reproduce bounded filtered metrics and redacted export | Dashboard + Backend + Database | Role, filter, metric-definition, count, timezone, export, and deletion tests pass | Separate research role; no public raw telemetry | D-004 / T7/T15 |
| Accessible onboarding/controls | Tour targets rendered controls; keyboard users can close modal and understand status text | Frontend | Browser keyboard/focus and target-found checks pass | No additional data exposure | T14 |

These are audit handoffs, not implementation authorization. Level 2 is only needed for narrow research
access/retention, feedback privacy, or metric-definition decisions.

## 11. Roadmap and Decision Impact

This audit revalidates UX inputs for T6, T8, T10, T11, T12, T14, and T15. T6 canonical state,
route authority, and non-live ETA behavior are reflected in current consumers; the public live-count
expiry gap is now a frontend handoff. T10–T12 remain deferred by D-001=A unless scope expands.
D-002/B, D-004, and D-006 gate raw comparison and research UX; they do not authorize raw data in the
public tracker.

No new owner decision is proposed. Existing D-001 through D-006 remain the source of truth.

## 12. Assumptions, Unknowns, and Confidence

- No browser, touch device, screen reader, live socket, rider, administrator, or user-research session
  was observed during this re-audit.
- Tour target correctness is source-verified against current class names, but runtime sequencing is
  unverified.
- Backend read contracts for source-health detail, trip exceptions, feedback triage, and research data
  remain incomplete.
- Confidence is **high** for source-visible UX presence/absence and static vocabulary, **medium** for
  effective usability/resilience, and **low** for user preference or field comprehension.

## 13. Audit Limitations and Handoff

No dashboard or UX code change is authorized by this report. Dashboard & UX is **Complete / Validated**
at the current evidence baseline. Security, DevOps & Observability is the next sequential profile and
must consume the current Backend, Frontend, Database, Infrastructure & Device, and Dashboard & UX
reports. Production Readiness and Roadmap remain gated in the registered order.
