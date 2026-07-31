# Dashboard & UX Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `9b7ff7325169a8bfa67d29ced94588edd3dbf28a`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`, `docs/audits/backend-audit.md`, `docs/audits/frontend-audit.md`, `docs/audits/infrastructure-device-audit.md`, `docs/audits/README.md`, `docs/audits/lead-audit-summary.md`, `docs/decision-queue.md`, `docs/roadmap/master-refactoring-roadmap.md`, `docs/tasks/T8-truthful-map-live-count.md`, `scripts/ci-checks.sh`, `shuttle-tracking-web/package.json`, `shuttle-tracking-web/playwright.config.ts`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/public/AvailabilityCard.tsx`, `shuttle-tracking-web/hooks/useShuttleTracker.ts`, `shuttle-tracking-web/hooks/useVehicleTracking.ts`, `shuttle-tracking-web/hooks/useRouteGeometry.ts`, `shuttle-tracking-web/types/canonical-state.ts`, `shuttle-tracking-web/utils/canonical-public-state.ts`, `shuttle-tracking-web/tests/t8-local-server.mjs`, and `shuttle-tracking-web/tests/t8-route-switch.spec.ts`.
- Reviewed at: `2026-08-01T00:49:55+07:00`
- Validation state: **Validated**
- Predecessor baselines: Product, Infrastructure & Device, Architecture, and Backend `@ d94abb3a4d80c2174d87df4d006dfbe7c814a6bc`; Frontend `@ 9b7ff7325169a8bfa67d29ced94588edd3dbf28a` plus its 2026-08-01 local T8 evidence refresh

## T8 Automated Evidence Re-audit — 2026-08-01

The isolated Playwright run verifies the actual rider page against synthetic localhost route, stop,
canonical REST, and Socket.IO data. It observes the neutral `Active Trams` count and Marker disappear
on local expiry, remain absent when the rider changes from R01 to R02 and back, then return only on a
newer canonical live event. No raw source, connection, or operational terminology is added to the
public UX. The prior T8 route-switch **New Finding** and runtime-evidence gap are **Resolved** for
this bounded public journey. Accessibility, error/retry, operations, and research-dashboard findings
remain unchanged.

## T8 Corrective Re-audit — 2026-07-31

This update supersedes the 2026-07-29 route-switch conclusions. The current comparison from
`4d5a456a6d73ef5a58d674426ba889f43102a9d2` contains one UI application change,
`shuttle-tracking-web/hooks/useShuttleTracker.ts`; it neither changes public vocabulary nor adds raw
source, research, connection, or operational information to the rider surface. The revalidated
Frontend predecessor is Validated at this report's baseline.

The route selector now consults the latest accepted canonical state and local-expiry registry before
adding a stored Marker. It presents a Marker only for a current `live` state on its known authoritative
selected route. All non-live, locally expired, missing, unknown-route, and route-mismatch states
remove only that vehicle Marker. The earlier **New Finding** that route selection could make a
stale/expired public Marker recur is **Resolved** by source inspection. Marker/count/ETA remain
canonical-only and neutral, and the route/stop layers remain intact.

This is not runtime closure: no focused timer/route-switch fixture, browser, Socket.IO-interruption,
accessibility, or rider-session evidence exists. `bash scripts/ci-checks.sh` passes with the two
documented frontend lint warnings. T8 is still **Partially Resolved** because source-visible behavior
is not independently exercised; existing UX, operations, accessibility, and research-dashboard gaps
remain **Still Present** or **Partially Resolved** as recorded below. No owner decision is proposed.

## T7 Re-audit Addendum — 2026-07-29

T7 makes protected research data available to a future developer surface, but it deliberately adds no
dashboard or public UX. The public tracker remains canonical-only, and the authenticated admin map
remains the only repository-visible operational surface. The missing Dev Dashboard with reproducible
session/source/time filters, metric definitions, uncertainty labels, and bounded export feedback is
**Still Present**. The public live-count expiry inconsistency is **Still Present** and remains T8's
first acceptance target; no new UI claim or usability result is inferred from API-only research reads.
- Previous report baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`

## T8 Re-audit Addendum — 2026-07-29

The T8 evidence comparison from `d94abb3` to `4d5a456` changes only the two public tracker hooks.
Its `refreshVehicleStateCounts` projection now makes `AvailabilityCard` exclude locally expired live
vehicles at the same time their Marker is removed and ETA recalculated. The public state remains a
canonical-only, neutral presentation; no raw device/source, connection, or operational wording was
introduced. For a canonical `stale`, `no_service`, or `unknown` update, `useVehicleTracking` removes
the vehicle Marker and clears ETA without touching selected route or stop layers.

This is **Partially Resolved**, not closure. `handleRouteChange` still re-adds a stored Marker based
solely on its route when the rider returns to that route. It does not first exclude stale or locally
expired canonical state, so a stale/expired Marker can reappear without a newer canonical `live`
event. That is a **New Finding** against T8's truthful restoration criterion. No timer/route-switch
fixture or browser/socket-interruption session is available to verify the interaction at runtime.

## 1. Executive Summary

The public tracker consumes T6 canonical state through initial REST hydration and Socket.IO updates
with epoch/version guards. T8 makes local freshness expiry remove a vehicle Marker, suppress its ETA,
and decrease the live-only `Active Trams` count in the same state projection. `stale`,
`no_service`, and `unknown` updates remove the vehicle Marker while preserving selected route/stop
layers. The public surface intentionally remains neutral under D-005 rather than exposing operational
source-health vocabulary.

The admin live map now hydrates the canonical snapshot, displays connected/reconnecting/disconnected
state, and summarizes live/stale/no-service/unknown counts. Admin CRUD and the public feedback flow
remain useful controlled-MVP surfaces.

The UX is not yet a daily-operations or research dashboard. The admin dashboard still shows a static
“Live System Active” badge and database counts without visible readiness/error/retry context. There is
no source-health/failover, trip exception, feedback triage, history, or protected research surface.
Public ETA remains a client estimate without visible age/confidence. Although local expiry now updates
the public count correctly at source level, a route toggle can restore a stale/expired Marker before a
newer canonical `live` event. No browser, screen-reader, or field user session was observed.

## 2. Scope, Freshness, and Predecessor Gate

Product, Architecture, Backend, Infrastructure & Device, and the just-revalidated Frontend profile
are Validated, so the Dashboard & UX predecessor gate passes. The T8 evidence comparison from
`d94abb3a4d80c2174d87df4d006dfbe7c814a6bc..HEAD` identifies the two tracker hooks and their task and
coordination evidence. It does not change public vocabulary, admin/research authorization, or the
route/stop layer owner.

This review covers rider map/count/ETA truthfulness and the separation of public, operations, and
research UX. It does not substitute source inspection for a browser, screen-reader, usability, or
formal WCAG study.

`bash scripts/ci-checks.sh` and `node scripts/validate-agent-workflow.js` passed. CI includes frontend
lint/build; lint has the two pre-existing warnings in `app/layout.tsx` and `utils/IconHelpers.ts`.
No timer/route-switch fixture or runtime/browser session was used as a substitute for the missing
interaction evidence.

## 3. Prior-Finding Revalidation

| Prior finding | State | Current evidence and implication |
|---|---|---|
| Live data had no user-visible freshness model | **Partially Resolved** | Admin `LiveMap` exposes connection state and live/stale/no-service/unknown counts; public marker and ETA behavior follows canonical freshness but intentionally hides operational labels under D-005. Public has no last-update age or retry panel. |
| Public local expiry could leave `Active Trams` high | **Partially Resolved** | The public count excludes the locally expired canonical vehicle as its Marker and ETA are removed. The source-visible route selector also excludes non-live/expired state; focused runtime evidence remains absent. |
| Non-live public Markers must not recur before a newer live state | **Resolved** | Route selection now requires current canonical `live`, a known authoritative matching route, and no local expiry before adding the stored Marker. Only that vehicle Marker is removed otherwise. |
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
| Rider vehicle/ETA | Canonical REST/Socket state, route-authority filtering, live marker, non-live Marker removal, client speed/geometry ETA | Local expiry now removes the Marker/count/ETA together, but a route switch can incorrectly restore a stale/expired stored Marker. ETA remains a client estimate without visible freshness/uncertainty framing. |
| Rider feedback | Modal fetches active vehicles, submits public feedback, shows success/error | Recoverable pilot capture; fallback vehicle list can be stale, and there is no receipt ID, privacy/retention notice, or support expectation. |
| Admin sign-in | Cookie-presence proxy, client JWT expiry check, backend API authentication | Backend remains authority; UI can briefly render from stale/present cookie state and no role distinction for research exists. |
| Admin service check | DB count cards plus canonical live map and connection/state summary | Better than the prior map-only surface, but still not exception-first or readiness-backed. |
| Admin master data | Vehicle, route, stop pages with responsive list/table and modal CRUD | Adequate MVP master-data workflow; no route-stop composition or trip/history workflow. |
| Developer/researcher | No dedicated route, filters, metrics, protected history, or export | D-004 research dashboard is not implemented and must remain separate from public/operations UX. |

## 5. Truthful State and Information Hierarchy

Public `AvailabilityCard` receives `vehicleStateCounts.live`, now refreshed from the canonical
registry in `scheduleLocalExpiry`. When a matching live state expires locally, the projection treats it
as non-live, removes its Marker, and recalculates ETA, so the prior stale `Active Trams` number is
**Partially Resolved** at source level. The active-route selection path does not apply that same state
projection before re-adding markers, leaving a **New Finding**: returning to a route can display a
stale/expired vehicle before a newer canonical `live` state.

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
- Local expiry now updates the public live count, Marker visibility, and ETA from the same canonical
  projection; non-live updates remove only the vehicle Marker and do not remove route or stop layers.
- Feedback has loading, validation, error, and success states; the route geometry cache validates a
  stop signature and falls back to bundled data.

Gaps:

- No public “updated X ago”, reconnect, or retry context; neutral presentation is not the same as
  explicit freshness evidence.
- Route selection can re-add a stale or locally expired vehicle Marker before a newer canonical
  `live` state; no test fixture proves the required restoration behavior.
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
| Public live-count correctness | Local freshness expiry updates marker visibility, live count, and ETA together | Frontend | Source review and CI support this; add expiry fixture without a new server event | Canonical projection only | T8 |
| Public truthful state | A stale/expired Marker cannot return on route change; newer canonical `live` alone restores it | Frontend + Backend | Fixture covers initial live, expiry/stale, route switch, reconnect, and newer live | Neutral public vocabulary; no raw source display | T8 |
| Admin exception view | Operator sees API/socket status, stale/silent count, source exceptions, and retry action | Dashboard + Backend | Fixture produces each exception and UI links to detail | Authenticated operations data | Before daily operations |
| Route-authority presentation | Marker/ETA is never silently attributed to selected route when backend route is unknown | Backend + Frontend | Multi-route fixture and route-switch test | No raw source display publicly | T6/T8 |
| Feedback recovery | Submission provides receipt/retention notice and approved admin path | Product + Dashboard + Backend | Intake-to-case acceptance test with privacy/deletion rules | IP/message access and retention owner required | D-001 C / T12 |
| Research dashboard | Authenticated users reproduce bounded filtered metrics and redacted export | Dashboard + Backend + Database | Role, filter, metric-definition, count, timezone, export, and deletion tests pass | Separate research role; no public raw telemetry | D-004 / T7/T15 |
| Accessible onboarding/controls | Tour targets rendered controls; keyboard users can close modal and understand status text | Frontend | Browser keyboard/focus and target-found checks pass | No additional data exposure | T14 |

These are audit handoffs, not implementation authorization. Level 2 is only needed for narrow research
access/retention, feedback privacy, or metric-definition decisions.

## 11. Roadmap and Decision Impact

This audit revalidates UX inputs for T6, T8, T10, T11, T12, T14, and T15. T8 has repaired the local
expiry count projection but remains **Partially Resolved** because its stale/expired Marker restoration
criterion fails on route selection. T10–T12 remain deferred by D-001=A. D-002/B, D-004, and D-006
gate raw comparison and research UX; they do not authorize raw data in the public tracker.

No new owner decision is proposed. Existing D-001 through D-006 remain the source of truth.

## 12. Assumptions, Unknowns, and Confidence

- No browser, touch device, screen reader, live socket, rider, administrator, or user-research session
  was observed during this re-audit.
- No focused local-expiry/route-switch test proves the source-visible non-live Marker recurrence path.
- Tour target correctness is source-verified against current class names, but runtime sequencing is
  unverified.
- Backend read contracts for source-health detail, trip exceptions, feedback triage, and research data
  remain incomplete.
- Confidence is **high** for source-visible UX presence/absence and static vocabulary, **medium** for
  effective usability/resilience, and **low** for user preference or field comprehension.

## 13. Audit Limitations and Handoff

No dashboard or UX code change is authorized by this report. Dashboard & UX is **Complete / Validated**
at `9b7ff7325169a8bfa67d29ced94588edd3dbf28a` as an audit profile. Security's trust-boundary evidence
is unaffected by this public rendering-only change and remains current. Production Readiness is the
next eligible profile; it must carry forward T8's Partially Resolved runtime-evidence gap, not the
now-resolved route-switch recurrence, and must not treat this re-audit as T8 closure.
