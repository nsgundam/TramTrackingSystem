# Dashboard & UX Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/audits/product-audit.md`, `docs/audits/frontend-audit.md`, `docs/audits/infrastructure-device-audit.md`, `shuttle-tracking-web/app/page.tsx`, `shuttle-tracking-web/app/admin/dashboard/page.tsx`, `shuttle-tracking-web/app/admin/layout.tsx`, `shuttle-tracking-web/app/admin/login/page.tsx`, `shuttle-tracking-web/app/admin/routes/page.tsx`, `shuttle-tracking-web/app/admin/stops/page.tsx`, `shuttle-tracking-web/app/admin/vehicles/page.tsx`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/public/AppTour.tsx`, `shuttle-tracking-web/components/public/AvailabilityCard.tsx`, `shuttle-tracking-web/components/public/StopInfoCard.tsx`, `shuttle-tracking-web/components/public/VehicleInfoCard.tsx`, `shuttle-tracking-web/components/public/FeedbackModal.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/components/admin/Sidebar.tsx`, `shuttle-tracking-web/contexts/AuthContext.tsx`, and `shuttle-tracking-web/proxy.ts`.
- Reviewed at: `2026-07-22T21:46:17+07:00`
- Validation state: **Validated**
- Predecessor baselines: Product, Frontend, and Infrastructure & Device, each `@ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Legacy report commit: `b3682fc`

## 1. Executive Summary

The public tracker is a credible controlled-demo experience: it presents a full-screen map, active routes and stops, vehicle cards, client-side ETA/next-stop estimates, nearest-stop location, feedback capture, and a guided tour. The admin shell provides login, responsive navigation, vehicle/route/stop CRUD, aggregate counts, and a live map. These surfaces are suitable for supervised pilot presentation under D-001=A.

The trust boundary is not yet suitable for daily operations. Public and admin maps listen for canonical `location-update` events but do not show connection, reconnect, last-update age, stale/offline, or no-service state. The admin dashboard labels the system “Live System Active” without checking API or Socket.IO health. Public availability counts visible client markers, ETA is a client estimate without freshness/confidence framing, and route identity is inferred from the selected route when the canonical event lacks one. No source-health, trip-history, feedback-triage, route-stop, or authenticated research dashboard exists.

The prior onboarding-selector finding is materially improved: current tour targets match current rendered classes, although no browser runtime was observed. The next UX work is a small truthful-state and exception-first layer, not a broad redesign.

## 2. Scope, Freshness, and Predecessor Gate

This review covers rider and admin journeys, truthful status vocabulary, map/ETA information hierarchy, loading/empty/error states, feedback capture, navigation, onboarding, accessibility-visible affordances, and separation of public/operations/research surfaces. It is not a browser, screen-reader, usability study, or formal WCAG audit.

Product, Frontend, and Infrastructure & Device are Complete and Validated at the same baseline, so the Dashboard & UX predecessor gate passes. Current evidence includes approved D-001/D-002/D-004 scope, current frontend/backend boundaries, and the absence of deployed/physical runtime evidence. The current uncommitted changes are audit documentation only.

## 3. Prior-Finding Revalidation

| Prior finding | State | Current evidence and implication |
|---|---|---|
| Live data had no user-visible freshness model | **Still Present** | Public `ShuttleTracker` and admin `LiveMap` subscribe to `location-update` only; neither shows connection, last event age, stale, offline, or recorded-time state. |
| Admin dashboard was not an operations dashboard | **Still Present** | Dashboard has three database count cards, a Socket.IO-only map, and a fixed “Live System Active” badge; no exceptions, source health, trips, feedback queue, or recent failures are exposed. |
| Public route selection/ETA could overstate certainty | **Partially Resolved** | Routes and names now load dynamically from active API data, but ETA remains a client-side numeric estimate without freshness/confidence framing and route authority is still inferred when absent from the event. |
| Public no-vehicle/no-data state was unclear | **Partially Resolved** | Selected stop shows “ยังไม่มีรถในสายนี้,” but the overall map/availability state does not distinguish zero service, stale data, disconnected socket, failed geometry, or no active route. |
| Error and empty states were inconsistent | **Partially Resolved** | Feedback and CRUD loading/empty states exist; dashboard failures are console-only and CRUD mutations still use browser alerts/confirm without consistent retry or inline context. |
| Public feedback entry was missing | **Resolved** | Feedback button/modal now supports type, vehicle, message, loading, validation, API error, and success states. Staff triage remains absent as a separate product capability. |
| Onboarding tour selectors appeared stale | **Resolved** | Current tour targets `.rsu-stop-eta-box`, `.rsu-vehicle-next-stop`, `.route-selector-menu`, and `.rsu-feedback-btn`, which are rendered by the current UI; marker-dependent auto-click behavior still needs browser verification. |
| Operational source-health/device visibility was absent | **Still Present** | Backend has source freshness/selection facts and an authenticated device analytics endpoint, but no admin navigation or UX surface exposes source state, failover, or device exceptions. |
| Keyboard/accessibility affordances were incomplete | **Still Present** | Many actions are native buttons, but image enlargement is a clickable `div`, several icon-only buttons rely on `title`, modal close lacks an accessible name, and no formal keyboard/screen-reader evidence exists. |

## 4. Consumer and Journey Review

| Consumer/journey | Current path | UX result |
|---|---|---|
| Rider first visit | Branding, map, route menu, active-marker count, feedback, AppTour | Understandable controlled demo; no visible data age and no browser-verified tour/runtime recovery. |
| Rider route/stop | Dynamic active route and ordered stops, OSRM/local/bundled geometry, selected stop card | Useful map flow; route geometry/API failure is not a persistent user-facing state. |
| Rider vehicle/ETA | Socket marker, vehicle card, polyline index, client speed history and dwell estimate | Estimate is useful as a presentation aid but looks more authoritative than its freshness/route inputs justify. |
| Rider feedback | Modal loads active vehicles, falls back to static IDs, submits public feedback | Recoverable pilot capture; no receipt ID, privacy/retention notice, or support expectation. |
| Admin sign-in | Cookie-presence proxy, client JWT expiry check, backend API authentication | Backend is authority; UI can briefly render from stale/present cookie state. |
| Admin service check | DB counts plus Socket.IO-only map and static green badge | Not an exception-first operations view; cannot distinguish healthy, stale, empty, or disconnected. |
| Admin master data | Vehicle, route, stop pages with responsive list/table and modal CRUD | Adequate MVP master-data workflow; no route-stop composition screen. |
| Developer/researcher | No dedicated route, filters, metrics, history, or export | D-004 Dev Dashboard is not implemented and must remain separate from public/operations UX. |

## 5. Truthful State and Information Hierarchy

The public `AvailabilityCard` counts markers currently visible in the Leaflet map and labels them “Active Trams.” That is a client-observed marker count, not a backend availability or service-health measurement. A vehicle marker persists until the component removes it, and the client has no expiry timer. `StopInfoCard` maps `eta === null` to no vehicle but cannot identify why the value is null. These labels should be changed only after the T6 canonical-state contract defines freshness and availability semantics.

The admin dashboard calculates active vehicles from database `status === 'active'`, while its live map starts empty and fills only from Socket.IO events. The static green “Live System Active” badge is therefore not evidence-based. An operator needs a compact state summary first: API/socket status, stale/silent vehicle count, source-health exceptions, and actionable failures. Totals and map remain useful secondary information.

ETA is calculated in the browser from route geometry, raw position, recent client speed samples, a fixed speed floor, route-stop order, and dwell assumptions. The UI labels it as estimated waiting time but does not show the source data age or uncertainty. Do not call it measured accuracy or service guarantee; suppress or qualify it when canonical freshness/route authority is unknown.

## 6. Public UX Review

Strengths:

- Map-first hierarchy is appropriate for a rider tracking a shuttle.
- Dynamic route names/colors and ordered stop data are available from current API boundaries.
- Selected stop includes text plus color for status, rather than relying on color alone.
- Feedback has visible loading, validation, error, submit, and success states.
- Responsive public layout includes map controls, route menu, vehicle/stop cards, and nearest-stop interaction.

Gaps:

- No compact connected/reconnecting/stale/offline state or “updated X ago” label.
- No persistent retry panel for route/stop/geometry failure; a five-second preloader can end while data is incomplete.
- Browser geolocation denial is reported through `alert` only; the nearest-stop action has no inline recovery explanation.
- Route authority is client-inferred when missing from the canonical event, which can hide a vehicle on the wrong selected route.
- Feedback auto-closes after success and provides no receipt/reference or retention notice.
- Clickable stop imagery is a non-button `div`, and some icon-only controls rely on titles rather than explicit accessible labels.

## 7. Admin and Operations UX Review

The admin shell has four navigation entries: Dashboard, Vehicles, Routes, and Stops. Vehicle/route/stop pages provide loading and empty states, responsive card/table layouts, modal add/edit, and delete confirmation. Mutation errors use browser alerts, and dashboard fetch errors go to the console without a visible retry state.

The dashboard does not expose:

- API readiness or Socket.IO connection/reconnect status;
- last update age, stale/silent vehicles, or source online/stale/disabled state;
- active-trip state, trip history, or GPS sample history;
- ordered route-stop composition and cache freshness;
- feedback intake/ownership/triage;
- device-selection/failover analytics in a user-facing view; or
- recent operational signals, deployment readiness, or failure exceptions.

For D-001=A this gap is consistent with controlled demonstration scope. It is not consistent with a daily campus operations claim. The first operational UX increment should be an exception panel backed by stable backend read contracts, not a large analytics dashboard.

## 8. Research Dashboard Boundary

The approved D-004 surface must be a separate authenticated developer/research route. It should compare Mobile/Socket.IO, ESP32/Wi-Fi/HTTP, and LoRaWAN/Gateway/TTN live and historical facts with experiment/session filters, event/receive times, latency/cadence/missingness, selection/failover, reported accuracy, route-conformance distance, pairwise disagreement, ground-truth error when available, and bounded redacted export.

Nothing in the current UI provides these filters, charts, definitions, sample counts, p50/p95 rules, timezone/retention boundaries, excluded-observation visibility, or drill-down. The public tracker must not be extended to show raw source comparison, credentials, or unrestricted location history. Route distance remains a conformance proxy and reported device accuracy remains uncertainty, not measured error.

## 9. Loading, Error, and Accessibility Review

| State | Current behavior | Required improvement |
|---|---|---|
| Loading | Feedback, dashboard cards, dynamic map, and CRUD lists show spinners/placeholders | Keep visible until the relevant read succeeds; do not let a preloader hide a failed route. |
| Empty | CRUD pages explain how to add data; selected stop says no vehicle | Add explicit public no-service/stale and admin no-exception/unknown states. |
| Error | Feedback/login are inline; dashboard is console-only; CRUD uses alert/confirm; geolocation uses alert | Use shared inline error with cause, retry/refetch, and affected resource. |
| Destructive action | Native confirm before route/stop/vehicle deletion | Preserve confirmation but identify entity and downstream impact. |
| Keyboard/screen reader | Native buttons and labels exist in many areas; image click, icon titles, modal close, and map interactions are incomplete | Add accessible names/focus management and verify with browser tooling; this is not yet a formal WCAG result. |

## 10. Actionable UX Handoffs

| Capability | Measurable outcome | Owner | Acceptance signal | Privacy/data boundary | Stage |
|---|---|---|---|---|---|
| Public truthful state | Rider sees connected/reconnecting, last-update age, stale/offline/no-service, and ETA suppression/qualification | Frontend + Backend | Browser/runtime cases cover initial load, stale transition, reconnect, no route, and no service | Canonical projection only | Phase 2 / T6/T8 |
| Admin exception view | Operator sees API/socket status, stale/silent count, source exceptions, and retry action | Dashboard + Backend | Fixture produces each exception and UI links to its detail | Authenticated operations data | Before daily operations |
| Route-authority presentation | Marker/ETA is never silently attributed to selected route when backend route is unknown | Backend + Frontend | Multi-route fixture and route switch test | No raw source display publicly | Phase 2 / T6 |
| Feedback recovery | Submission gives receipt/clear retention notice and admin path when triage is approved | Product + Dashboard + Backend | Intake-to-case acceptance test with privacy/deletion rules | IP/message access and retention owner required | D-001 C / T12 |
| Research Dev Dashboard | Authenticated users can reproduce bounded filtered metrics and redacted export | Dashboard + Backend + Database | Filter, metric definition, sample count, percentile, timezone, export-limit, and deletion tests | Separate research role; no public raw telemetry | D-004 / T7/T15 |
| Accessible onboarding/controls | Tour targets rendered controls; keyboard users can close modal, activate image/control actions, and understand status text | Frontend | Browser keyboard/focus and target-found checks pass | No additional data exposure | Phase 4 / T14 |

These handoffs are not implementation authorization. Level 2 is only needed for narrow decisions on research access/retention, feedback privacy, or metric definitions.

## 11. Roadmap and Decision Impact

This audit revalidates UX inputs for T6, T8, T10, T11, T12, T14, and T15. T6 must define freshness/version/route authority before truthful map changes. T10–T12 remain deferred by D-001=A unless the owner expands scope. D-002/B and D-004 gate raw comparison and research UX; they do not authorize raw data in the public tracker.

No new owner decision is proposed. Existing D-001 through D-004 remain the source of truth.

## 12. Assumptions, Unknowns, and Confidence

- No browser, touch device, screen reader, live socket, rider, administrator, or user research session was observed.
- Tour target correctness is source-verified against current class names but runtime target sequencing is unverified.
- Backend read contracts for freshness, source health, trips, feedback triage, and research data remain incomplete.
- Confidence is **high** for source-visible UX presence/absence and static vocabulary, **medium** for effective usability/resilience, and **low** for user preference or field comprehension.

## 13. Audit Limitations and Handoff

No dashboard or UX code changes are authorized by this report. Dashboard & UX is now Complete and Validated. The next eligible profile is Security, DevOps & Observability, after which Production Readiness can synthesize all validated domain evidence; Roadmap remains last.
