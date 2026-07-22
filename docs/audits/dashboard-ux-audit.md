# Dashboard & UX Audit: Tram Tracking System

Validation status: **Needs Re-audit**. This legacy report lacks the evidence-baseline and
predecessor metadata required by the current audit contract.

Re-audited: 2026-07-19

## 1. Executive Summary

The public tracker remains a strong controlled-MVP experience: a full-screen responsive map, route toggles, stops, vehicle cards, ETA, nearest-stop location control, and an accessible-in-flow public feedback modal. The feedback submission gap from the prior UX audit is partially resolved because users now receive loading, validation, error, and success states.

The main trust failure remains unchanged: neither public nor admin UI communicates realtime connection state, data freshness, or stale/offline vehicles. The admin landing page can display “Live System Active” while its data fetch or socket has failed. It is a master-data dashboard with a live map, not an operational exception dashboard.

Before daily operations, surface explicit freshness/no-service state and replace the fixed healthy indicator. Fix the stale onboarding targets and inconsistent admin alerts now; those are small changes that make the existing UI more reliable without redesigning it.

## Scope, Evidence, and Re-audit Status

Reviewed the Knowledge Base; Product, Frontend, Backend, and Infrastructure reports; prior Dashboard & UX report; public tracker/cards/tour/feedback components; admin dashboard, map, sidebar, login, and CRUD UI. Frontend lint completed with zero errors and six non-blocking warnings. No browser session, real device, live socket, or user research was available.

| Prior finding | Re-audit status | Current evidence |
|---|---|---|
| Live data had no user-visible freshness model | **Still Present** | Public and admin maps listen only for location updates; neither presents connection, stale, offline, or recorded-time state. |
| Admin dashboard was not an operations dashboard | **Still Present** | It shows three static count cards and live map, but no exceptions, stale vehicles, trip, source health, feedback, or system status. |
| Public route selection/ETA could overstate certainty | **Still Present** | Toggles are hard-coded as R01/R02 without route names; ETA is shown as a numeric waiting time without freshness/confidence framing. |
| Public no-vehicle/no-data state was unclear | **Partially Resolved** | A selected stop says “ยังไม่มีรถในสายนี้”; the overall map/availability card still does not explain no service or stale data. |
| Error and empty states were inconsistent | **Partially Resolved** | Feedback modal has inline states and CRUD lists have loading/empty views; dashboard errors are console-only and CRUD still uses browser alerts. |
| Public feedback entry was missing | **Resolved** | Public feedback button/modal supports typed message, active-vehicle selection, inline error, loading, and success. |
| Onboarding tour selectors appeared stale | **Still Present** | Tour references rsu-avail, route-selector, and gps-locate-btn, but those classes are not rendered by the public tracker. |
| Operational source-health/device visibility was absent | **Still Present** | Backend has source/freshness facts but no admin UX surface or navigation entry exposes them. |
| Keyboard/accessibility affordances were incomplete | **New Finding** | Several important controls have text/title, but the tour targets are absent, feedback close lacks an accessible name, and clickable stop imagery is a non-button div. |

## 2. Public Experience Overview

A first-time rider sees university branding, active-tram count, R01/R02 buttons, feedback entry, map, stop/vehicle cards, and map controls. Selecting a stop shows a name, image, “Estimated Waiting Time,” and a text-plus-color status. Selecting a vehicle shows its next station and a route-progress strip. Browser geolocation is used for the nearest-stop interaction.

This is useful for supervised tracking, but it does not tell a rider whether the displayed position is current. It also does not describe the two route codes in the route control, and it only offers R01/R02 even though repository data includes R03.

## 3. Admin Experience Overview

An admin can sign in, see active-vehicle, route, and stop counts, observe a live map, and manage vehicles, routes, and stops from a responsive sidebar. CRUD pages provide loading and empty states plus browser-native confirmation before delete.

The landing view does not answer the operational question “what needs attention now?” It has no socket/API health, stale/silent vehicles, active trips, source status, feedback queue, history, route-stop composition, or recent failures. The green “Live System Active” badge is fixed UI, not a measured system state.

## 4. UX Strengths

- Public map keeps core information visible without a multi-page journey and supports stop/vehicle drill-down.
- Stop state includes text as well as color; selected-stop no-vehicle wording is clearer than an empty ETA.
- Feedback modal gives clear required-field, loading, failure, and success feedback.
- Admin login provides loading and inline error feedback; mobile admin navigation has labeled open/close controls.
- Admin CRUD screens have clear add/edit affordances, responsive card/table layouts, loading indicators, empty states, and deletion confirmation.
- Public and admin map updates are built around one canonical vehicle update, avoiding conflicting device markers for general users.

## 5. Critical UX Issues

### High — Users cannot tell live data from stale or disconnected data

The tracker and admin map subscribe to location updates but display no connection lifecycle or recorded timestamp. Markers persist until component cleanup. The backend can return no canonical location when all sources are stale, but the UI has no explicit stale/no-service presentation.

User impact: riders can trust an old vehicle position or precise-looking ETA; operators can mistake a silent feed for an operating service.

Recommendation: show a compact data-state label on public cards and an exception summary on admin: connected/reconnecting, last update age, stale/offline, and no active service. Treat missing/stale state as distinct from zero vehicles.

Priority: High before daily operations. Difficulty: Medium.

### High — The admin landing page has a misleading health signal

Dashboard load failures only log to the console; the “Live System Active” badge does not depend on API or socket status. Counts are a snapshot and the map has no stale cleanup.

User impact: an admin cannot reliably identify a real service, data, or source problem during morning operations.

Recommendation: replace the fixed badge with verified API/socket status and add a short exception list: stale/silent vehicles, source/device freshness, vehicles without active trip, and unread feedback when those read models exist.

Priority: High before daily operations. Difficulty: Medium.

### Medium — Public onboarding and route choice are not dependable for newcomers

Tour selectors are stale, so guided steps can target nothing. Route buttons use codes only and the public UI does not explain route names/destination or why only two routes appear.

User impact: new riders may not know which route to choose or may receive a broken first-use tour.

Recommendation: either repair tour selectors against current controls or hide the tour until verified. Pair each route code with a concise destination/name and source route choices from current active data when that product workflow is ready.

Priority: Medium. Difficulty: Easy to Medium.

### Medium — Feedback/error quality varies by surface

Feedback is recoverable and inline, while admin CRUD and dashboard use browser alerts or no visible error. Native confirm/alert interrupts context and gives no retry path.

User impact: administrators cannot tell whether an operation failed, why, or what to do next.

Recommendation: use a shared inline banner/toast pattern with the failed action and retry/refetch option; retain explicit destructive confirmation.

Priority: Medium. Difficulty: Easy.

## 6. Public Journey Walkthrough

1. **First visit:** branding and map make the purpose understandable, but R01/R02 have no destination names. The tour is not trustworthy because target classes are absent.
2. **Select a route and stop:** route line and stops appear; selected stop gives an ETA/status or “no vehicle.” This is the clearest current no-service message.
3. **Track a vehicle:** card shows next stop and progress; however, no “updated at” or stale warning qualifies the position or ETA.
4. **Find nearest stop:** a visible map control uses browser location; denied permission is only logged, not explained in the UI.
5. **Send feedback:** the modal is clear and recoverable, but its fallback vehicle list can differ from live backend data when loading fails.

## 7. Admin Journey Walkthrough

1. **Login:** clear form, loading state, and inline authentication error.
2. **Check service:** dashboard shows counts and a map but not whether API/socket/telemetry is healthy. The fixed green status can mislead.
3. **Find an operational issue:** no route to stale vehicles, device/source health, active trip/history, feedback, or exceptions exists.
4. **Maintain master data:** vehicle/route/stop CRUD is usable for an MVP, with loading/empty states and confirm-before-delete.
5. **Recover from an error:** CRUD uses alert dialogs; dashboard silently retains default/previous-looking counts after a failed load.

## 8. Information Hierarchy Review

Public hierarchy correctly prioritizes map and a selected stop/vehicle. It should elevate data age/no-service state beside ETA and availability, rather than leaving trust information invisible. Numeric ETA looks precise; label it as an estimate and suppress it when freshness is unknown.

Admin hierarchy prioritizes aggregate counts and map visualisation. For daily operations, exception state should precede totals: silent/stale vehicle count, no-active-trip count, source/device state, and actionable feedback. That is progressive disclosure: keep the landing page concise, then link each exception to a focused list.

## 9. Feedback and Error State Review

- **Loading:** feedback and admin CRUD show visible progress; dashboard cards and map use spinners/placeholders.
- **Empty:** CRUD lists explain how to add data. Public selected-stop state explains no vehicle, but empty public map does not explain no service or stale feeds.
- **Error:** feedback and login are inline; route-data/geolocation/dashboard errors are console-only; CRUD uses blocking browser alerts.
- **Destructive actions:** native confirmation exists, but a custom confirmation with the entity name and impact would be more consistent when the UX is next touched.
- **Accessibility basics:** stop status includes text, but several controls rely on title/visual affordance only. Stale tour targets and non-button clickable imagery reduce keyboard/screen-reader reliability. This is a targeted observation, not a formal WCAG result.

## 10. Operational Visibility Gap Analysis

An operator currently cannot see: last update age, stale/silent vehicles, source selection/health, active trip status, trip history, feedback queue, route-stop composition, dashboard/API/socket health, or an exception feed. Backend and database audits show some source/freshness facts exist or can be derived, but UX needs stable read contracts before surfacing them.

For a controlled demo, do not build every operational module. A minimal daily-operations dashboard needs visible freshness/no-service state and a small exception list before adding reports, playback, or advanced analytics.

## 11. Recommended Improvements

### Recommendation 1: Add explicit freshness and no-service states

### Problem

Maps and ETA lack user-visible connection, timestamp, stale, offline, and no-service meaning.

### User Impact

Riders and admins can make decisions from old data that looks live.

### Recommendation

Show last-update age and a plain-language state near public ETA/availability; provide an admin stale/silent exception list. Hide or degrade ETA when the canonical state is stale.

### Why

Freshness is the smallest trust improvement and uses the canonical-state work already identified by Architecture/Backend.

### Priority

High — before daily operations.

### Difficulty

Medium.

### Learning Topic

Status patterns, confidence framing, and empty-state design.

### Related Files

Public tracker/cards, admin dashboard/map, and the backend canonical-state contract.

### Recommendation 2: Make dashboard health evidence-based

### Problem

“Live System Active” is static while API and Socket.IO failures are not visible.

### User Impact

An admin may believe the service is healthy when it is disconnected or stale.

### Recommendation

Bind a compact status indicator to successful API load and socket lifecycle; show a retry action and distinguish “dashboard unavailable” from “no active vehicles.”

### Why

It improves the existing dashboard without adding a new operations suite.

### Priority

High — before daily operations.

### Difficulty

Medium.

### Learning Topic

Operational dashboards and truthful system-status language.

### Related Files

Admin dashboard and LiveMap.

### Recommendation 3: Repair first-use route guidance

### Problem

Tour selectors do not match the rendered UI, and route codes lack destination context.

### User Impact

New riders can miss the correct route or experience an incomplete tour.

### Recommendation

Repair/remove stale tour steps; label R01/R02 with concise route names/destinations. Review R03 visibility after Product decides the supported public scope.

### Why

This is a targeted clarity fix, not a redesign.

### Priority

Medium.

### Difficulty

Easy.

### Learning Topic

First-use onboarding and information scent.

### Related Files

AppTour, ShuttleTracker, and Product Audit.

### Recommendation 4: Standardize recoverable admin feedback

### Problem

Admin CRUD uses alerts and dashboard errors are invisible.

### User Impact

Users lose context and cannot retry or distinguish failure from empty data.

### Recommendation

Adopt a shared inline alert/toast with a concise cause, affected action, and retry/refetch affordance; preserve confirmation for deletes.

### Why

Consistent feedback reduces operating mistakes and support burden.

### Priority

Medium.

### Difficulty

Easy.

### Learning Topic

Recoverable error states and destructive-action confirmation.

### Related Files

Admin dashboard and vehicle/route/stop pages.

## 12. UX Learning Topics

1. Data freshness and estimate confidence — needed now because a realtime map is only trustworthy when age is visible.
2. Exception-first dashboard hierarchy — before daily operations; start with a few actionable conditions rather than a large analytics dashboard.
3. Empty/error state design — needed now for recoverable admin work.
4. Information scent and onboarding — a route code needs a destination hint; test tours against rendered controls.
5. Keyboard semantics for interactive UI — improve buttons and dialogs incrementally; formal accessibility testing follows a browser review.

## Roadmap Impact

No new product or architecture decision is created. D-001 determines whether daily-operations UX is required now. The canonical freshness contract and D-002 remain prerequisites for any source comparison or playback UI. The Roadmap should treat public freshness and truthful admin status as before-daily-operations UX work, while tour and error feedback fixes are low-risk improvements.

## Assumptions and Unknowns

- Static source was used; visual rendering, keyboard behavior, mobile layout, and user comprehension were not observed in a browser.
- No user research establishes route-label preference, ETA tolerance, or operator workflow priorities.
- Backend read contracts for freshness, source health, trips, and feedback review remain incomplete.
- D-001 remains pending.

## Confidence

**High** for rendered-source and absence/presence claims; **Medium** for effective usability because no browser or user session was observed; **Low** for user-preference claims without research.

## Required Decisions

- **D-001 — operational MVP release scope:** determines whether exception-first operational UX is required before release.
- **D-002 — telemetry retention and canonical-history fidelity:** remains required before playback or source-comparison UI.

No new decision is needed to repair tour selectors, improve route labels, or standardize error feedback.

## 13. Audit Limitations

No browser, screen reader, touch-device, real network interruption, live GPS feed, administrator, or rider was observed. This is not a formal accessibility audit, usability study, or frontend architecture review.

## 14. Handoff

This report supersedes the previous Dashboard & UX Audit. Security/DevOps should assess the public-origin, logging, and runtime-observability side of truthful status indicators. Production Readiness should synthesize accepted Product, Architecture, Backend, Database, Infrastructure, and UX evidence once Security/DevOps refreshes.
