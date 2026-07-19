# Frontend Re-audit: Tram Tracking System

Re-audited: 2026-07-19

## 1. Executive Summary

The frontend is a capable controlled-MVP interface: the public page renders an interactive Leaflet tracker, calculates a client-side ETA, supports selected stop and vehicle information, and now gives riders a feedback form. The admin area provides authenticated vehicle, route, and stop CRUD with a live map.

It is **not ready for daily operations or a public production launch**. The two release-relevant frontend gaps are that operators still cannot maintain route-stop order, and both public and admin maps present received markers as live without connection, last-update, stale, or no-service state. A newly identified correctness risk compounds this: the public tracker assigns a vehicle to whichever route the rider currently selected on its first event, rather than using an authoritative route association.

The appropriate target today is a supervised demonstration or controlled pilot, not an operational dispatch console. For a small student MVP, a marker moving on a map is good enough for a demo. For real riders and staff, the UI must truthfully distinguish current information from old or unavailable information.

## Scope, Evidence, and Re-audit Status

Scope: Next.js/React client structure, public and admin flows, client state, REST and Socket.IO consumption, Leaflet behavior, forms, error states, baseline responsive/accessibility evidence, and the frontend implications of accepted Product, Architecture, and Backend audits. This does not re-audit backend security, server validation, databases, or deployed infrastructure.

Evidence reviewed:

- docs/project-knowledge-base.md, refreshed 2026-07-18.
- docs/audits/product-audit.md, docs/audits/architecture-audit.md, and docs/audits/backend-audit.md, re-audited 2026-07-19.
- Previous docs/audits/frontend-audit.md.
- Current shuttle-tracking-web source, package configuration, and .env.example.
- npm run lint on 2026-07-19: passed with 0 errors and 6 warnings.
- npm run build was not conclusive: a prior next build process retained .next/lock after compilation began, so this audit does not claim a successful production build.

| Prior finding | Re-audit status | Current evidence |
|---|---|---|
| Realtime UI had no connection or stale-state model | **Still Present** | Public ShuttleTracker and admin LiveMap listen only to location-update; neither tracks connect, disconnect, reconnect, errors, per-vehicle last update, or expiry. Dashboard still hard-codes “Live System Active.” |
| Route-geometry cache could be stale | **Still Present** | Cache signature remains the comma-joined stop IDs only; order and coordinates are excluded. |
| ShuttleTracker mixed too many responsibilities | **Still Present** | One 926-line component still owns map initialization, REST fallbacks, cache, OSRM, marker lifecycle, ETA, geolocation, Socket.IO, cards, tour, and feedback wiring. |
| Admin route protection only checked cookie presence | **Still Present** | proxy.ts checks presence only; AuthContext detects expiry after client render and API interceptors redirect later. |
| Route-stop management UI was missing | **Still Present** | No route-stops caller, page, or sidebar item is present. |
| Admin CRUD validation and mutation feedback were weak | **Still Present** | CRUD pages use browser alert and confirm, no saving state, inline server errors, or coordinate-range validation. |
| Socket origin configuration was inconsistent | **Partially Resolved** | Both map clients now strip /api when deriving the Socket.IO origin, but the logic is duplicated and .env.example still documents only NEXT_PUBLIC_API_BASE_URL. |
| Public feedback UI was missing | **Resolved** for submission; **Still Present** for staff workflow | FeedbackModal fetches active vehicles and posts public feedback with loading, error, and success states. No feedback review or triage page exists. |
| New: public route assignment comes from selected UI route | **New Finding** | On the first location event, ShuttleTracker sets vehicleRouteMapRef[id] to selectedRouteRef.current instead of an authoritative vehicle-route association. |
| New: duplicate unused realtime map component | **New Finding** | PublicMap.tsx contains a separate Socket.IO/React-Leaflet implementation but is not imported by the public page, creating a drift risk. |

## 2. Current Frontend Overview

The App Router public page dynamically imports ShuttleTracker with SSR disabled. ShuttleTracker creates Leaflet imperatively through useLeafletMap, loads R01 and R02 stops, resolves route geometry, subscribes to Socket.IO, manages Leaflet markers through refs, and renders stop/vehicle cards, geolocation controls, an onboarding tour, and FeedbackModal.

The admin layout wraps routes in AuthProvider and renders a responsive sidebar. The available admin pages are dashboard, vehicles, routes, and stops. Dashboard retrieves counts with the shared Axios client and dynamically loads LiveMap. The CRUD pages maintain local lists and modals, then refetch after mutations.

## 3. Frontend Strengths

- Public tracking has an end-to-end browser flow: route-stop fetch, static geometry, OSRM fallback, Leaflet marker movement, stop and vehicle selection, nearest-stop lookup, and ETA calculation.
- FeedbackModal is a meaningful improvement: it has form validation, active-vehicle loading, submit progress, inline failure feedback, and success confirmation.
- Leaflet objects and high-frequency public marker data live mostly in refs, avoiding a React re-render for every public location event. This is reasonable at the stated ten-vehicle MVP target.
- Admin REST calls share an authenticated Axios client, login exposes failures inline, and admin list pages have loading and empty states.
- Mobile admin navigation is implemented with a responsive drawer and keyboard-labelled open/close controls.

## 4. Critical Issues

### Critical — Route-stop operations are unavailable in the frontend

Product Audit, section 7, identifies route-stop ordering as required for operator-managed routes. The current sidebar exposes only dashboard, vehicles, routes, and stops; no frontend route-stops caller or page exists.

Impact: staff cannot safely make the route changes on which public geometry and ETA rely without technical/manual intervention.

### High — Realtime displays do not communicate truthfulness or freshness

ShuttleTracker and LiveMap handle location-update only. They retain received markers indefinitely and do not render socket state. The dashboard labels itself “Live System Active” independent of API or socket health.

Impact: a silent source, backend outage, reconnecting socket, or stale vehicle can appear to riders and administrators as live service. This reinforces the Product, Architecture, Backend, and Dashboard & UX findings on missing canonical freshness/no-service semantics.

### High — The public client can put a vehicle on the wrong route

ShuttleTracker initially maps an incoming vehicle to selectedRouteRef.current. It does not fetch or consume an authoritative assigned route in this path. A first R02 event received while R01 is selected can be rendered/snapped/used for ETA as R01.

Impact: route-specific availability, markers, next-stop labels, and ETA can be wrong. This is especially problematic because the UI currently offers R01 and R02 as distinct rider journeys.

### High — Route geometry cache is not versioned by operational data

The cache signature includes stop IDs but not order or coordinates. Route and stop changes can therefore retain old local geometry, stop polyIndex values, snapping, and ETA until local storage is manually cleared or another cache miss occurs.

Impact: a correct operational update can be presented inaccurately to riders.

### High — The public tracker remains difficult to change safely

ShuttleTracker has grown to 926 lines and manages unrelated side effects and mutable state in one component. The lack of named boundaries makes the required freshness, route association, cache, and error-state improvements harder to implement and review safely.

Impact: regression risk grows with each operational requirement.

## 5. Public Tracking Flow Review

1. app/page.tsx dynamically imports ShuttleTracker with SSR disabled.
2. useLeafletMap creates the map and OpenStreetMap tile layer in the browser.
3. ShuttleTracker tries configured backend origin, current origin, then localhost to fetch route stops.
4. It resolves geometry in the implemented order: localStorage cache, static public/data route file, then public OSRM service.
5. It assigns each stop a polyIndex, creates imperative stop/route layers, and maintains Leaflet vehicle markers in refs.
6. A Socket.IO client receives location-update, queues events during zoom, and otherwise updates marker, snapping, speed history, next stop, and ETA.
7. Riders change routes, select map markers, request browser geolocation, and can submit feedback.

Normal data rendering is credible for a demo. Failure is not communicated: route load failure and vehicle-name load failure log only to the console; an empty route produces no explanatory public state. OSRM response status and cached JSON parsing are not guarded. The map has no socket lifecycle state or marker TTL.

## 6. Admin Flow Review

1. Admin login posts credentials through services/api.ts; errors render inline and submit disables while loading.
2. AuthContext stores admin_token in a client-readable cookie, restores it on mount, decodes expiry client-side, and attaches it to Axios.
3. proxy.ts redirects only when the cookie is absent; expiry/malformed handling occurs after the client context runs or after an API 401/403.
4. Dashboard requests vehicle, route, and stop lists in parallel, derives counts client-side, then renders LiveMap.
5. LiveMap stores the latest event per vehicle in React state.
6. Vehicle, route, and stop pages fetch on mount, open a modal, issue POST or PUT, close/refetch on success, and use native confirm before deletion.

The flow supports basic administration. It has no route-stop, device, trip history, feedback-triage, reports, alert, or user-management frontend surface. It also has no stale-write/conflict UI: the client assumes the submitted entity is still current.

## 7. Real-Time Client Review

Public normal operation uses Socket.IO and imperative Leaflet markers; admin normal operation uses Socket.IO and React state. Socket.IO client defaults may reconnect, but the application never consumes lifecycle events, so reconnection is not a user-visible capability.

Neither surface records last update time, removes/dims stale vehicles, distinguishes no vehicles from disconnected data, or handles backend restart. Admin LiveMap re-renders its marker list on every event; this is acceptable to validate at ten vehicles, but no throttling or measured load evidence exists.

The frontend also has two separate realtime map implementations: the active public tracker and unused PublicMap.tsx. Maintaining one client event-state model is safer than allowing them to diverge.

## 8. State and Data Fetching Review

Public state is deliberately imperative for Leaflet, but its refs and UI state are concentrated in ShuttleTracker. Auth state is centralized appropriately in AuthContext. Admin CRUD state is simple and page-local.

Admin REST calls correctly use the common authenticated Axios instance. The public tracker bypasses publicApi and repeats origin-fallback/fetch behavior in multiple effects. That duplication makes environment behavior and error treatment inconsistent. The feedback component repeats an additional backend-origin fallback and uses a static vehicle fallback if its API call fails; that fallback can submit feedback against an identifier that may not exist in the deployed system.

## 9. Map and Route Geometry Review

Static R01/R02 geometry plus OSRM fallback is a useful MVP fallback hierarchy. Local geometry is preferable to depending on a public routing service in normal use.

The cache key must include ordered stop identity and coordinates, or a backend route revision when one becomes available. The client must safely discard invalid cached JSON and present a recoverable route-load error when every geometry source fails. The UI should consume an authoritative route relationship for each vehicle before snapping or filtering it; the selected rider route must not become the vehicle source of truth.

## 10. Forms and CRUD UX Review

Vehicle and route forms require core fields; stop forms parse latitude/longitude to numbers. Admin pages display loading and empty list states, refetch after mutation, and guard deletion with a native confirmation.

Weaknesses remain: mutation progress is not disabled, success is only implicit through modal close/refetch, API failures use browser alerts, and coordinates have no client-side range validation. The project does not need a form framework now; small shared form-error and mutation-state helpers would be sufficient.

## 11. Error, Loading, and Empty State Review

Implemented: admin list loading/empty states, dashboard stat spinners, login inline error, feedback inline error/loading/success, and native delete confirmation.

Still missing: visible dashboard fetch failure, public route/stops failure, empty/no-service state, socket disconnection/reconnect state, stale marker state, and recovery action. A selected stop can say no vehicle is available, but it cannot distinguish genuinely no service from old/disconnected data.

## 12. Missing Frontend Capabilities

- Route-stop membership and ordering: **Not Implemented**; Critical before operator-managed daily operations.
- Supported driver/sender client: **Not Found** in this frontend repository; simulators are not a staff workflow.
- Admin trip history: **Not Implemented**.
- Feedback triage: **Not Implemented**; public capture exists only.
- Device/source health and administration: **Not Implemented** despite backend APIs.
- Operations exception list, stale/offline status, and alerts: **Not Implemented**.
- Reports/playback: **Not Implemented**; playback remains dependent on D-002.
- R03 public route exposure: **Needs Confirmation** against D-001; the public UI only renders R01 and R02.

## 13. Recommended Improvements

### Recommendation 1: Build route-stop management before daily operations

### Problem

Administrators cannot add, remove, or order stops for a route in the UI.

### Impact

A route change requires developer/manual action and can leave public route geometry/ETA unreliable.

### Recommendation

Add an admin route-detail page that consumes the existing route-stop API, supports ordered add/remove/reorder, and explains the resulting published order.

### Why

This is the smallest operator workflow that aligns the frontend with the Product Audit’s critical route-stop need.

### Priority

Critical

### Difficulty

Medium

### Learning Topic

Ordered many-to-many relationship UI: represent order explicitly, submit a deterministic order, then refetch the canonical result.

### Related Files

shuttle-tracking-web/app/admin/routes/page.tsx; shuttle-tracking-web/components/admin/Sidebar.tsx; shuttle-tracking-web/components/public/ShuttleTracker.tsx

### Recommendation 2: Add a shared realtime freshness model

### Problem

Maps treat every received marker as live and expose no connection lifecycle.

### Impact

Riders and operators can make decisions using stale or unavailable tracking information.

### Recommendation

Create a small shared client model for socket lifecycle and last-seen timestamps. Show connecting, live, reconnecting, stale, and no-service states; dim/remove stale markers only using the backend-approved freshness policy.

### Why

This is the minimum truthful UI needed before a real operational claim. Do not invent a client-only policy that conflicts with the pending canonical-state contract.

### Priority

High

### Difficulty

Medium

### Learning Topic

Socket lifecycle and freshness: event delivery is not proof of currentness; timestamps and explicit state make realtime information trustworthy.

### Related Files

shuttle-tracking-web/components/public/ShuttleTracker.tsx; shuttle-tracking-web/components/admin/LiveMap.tsx; shuttle-tracking-web/app/admin/dashboard/page.tsx

### Recommendation 3: Use authoritative vehicle-route data and repair cache keys

### Problem

The public map assigns first-seen vehicles from selectedRouteRef.current and cache invalidation ignores stop order/coordinates.

### Impact

A vehicle, route line, ETA, and availability count can be associated with the wrong route or stale geometry.

### Recommendation

Fetch/consume the assigned route from an authoritative public contract, require it before route filtering/snapping, and derive cache validity from route ID plus ordered stop ID/coordinates or backend route revision. Safely ignore corrupt local cache values.

### Why

The route picker is a user preference, not a source of operational truth.

### Priority

High

### Difficulty

Medium

### Learning Topic

Source of truth and cache invalidation: UI selection should filter canonical state, never create it.

### Related Files

shuttle-tracking-web/components/public/ShuttleTracker.tsx; shuttle-tracking-web/services/publicApi.ts; docs/audits/backend-audit.md

### Recommendation 4: Split public map responsibilities into focused hooks

### Problem

ShuttleTracker owns unrelated data, map, socket, geometry, ETA, and presentation concerns.

### Impact

The above operational fixes are risky to implement and test in one large component.

### Recommendation

Extract useRouteData, useVehicleSocket, useVehicleMarkers, and useEtaCalculator while retaining Leaflet objects in refs. Retire or merge unused PublicMap.tsx to maintain one realtime client path.

### Why

Custom hooks give each side effect a clear lifecycle without adding a global state library.

### Priority

High

### Difficulty

Medium

### Learning Topic

React hooks around imperative libraries: isolate ownership, cleanup, and inputs before optimizing further.

### Related Files

shuttle-tracking-web/components/public/ShuttleTracker.tsx; shuttle-tracking-web/components/public/PublicMap.tsx; shuttle-tracking-web/hooks/useLeafletMap.ts

### Recommendation 5: Standardize admin mutation and error feedback

### Problem

CRUD mutations use alerts, native confirm, implicit success, and minimal client validation.

### Impact

Recoverable operator mistakes are harder to understand and repeat submits are possible.

### Recommendation

Add per-form saving state, inline API errors, explicit success feedback, coordinate-range validation, and a reusable confirmation dialog when these screens are next touched.

### Why

A few shared components are enough; a full state-management/form framework is not justified by this codebase.

### Priority

Medium

### Difficulty

Easy

### Learning Topic

Controlled forms and mutation feedback: prevent duplicate actions, keep validation close to fields, and show the server outcome in the same context.

### Related Files

shuttle-tracking-web/app/admin/vehicles/page.tsx; shuttle-tracking-web/app/admin/routes/page.tsx; shuttle-tracking-web/app/admin/stops/page.tsx; shuttle-tracking-web/components/admin/StopModal.tsx

## 14. Frontend Learning Topics

1. Realtime freshness before animation — first learn socket lifecycle and timestamps, then connect visual state to the server’s canonical freshness contract.
2. Client cache keys — include every data field whose change invalidates the derived result; stop ID alone is not a route version.
3. Source-of-truth boundaries — route selection filters a vehicle; it must not assign the vehicle’s route.
4. Imperative map hooks — keep Leaflet refs, but give data loading, sockets, markers, and ETA separate cleanup boundaries.
5. Controlled mutation UX — disable during submit, validate local invariants, show inline results, then refetch canonical data.

## 15. Audit Limitations

No browser, touch device, screen reader, live Socket.IO session, API instance, real GPS feed, or user was observed. This is not a full accessibility, performance, security, or usability study. The production build could not be verified because an existing .next build lock prevented a second build from acquiring the lock; lint passed with six non-blocking warnings.

## 16. Handoff

Production Readiness Audit can now proceed because all required domain reports are current. It should treat route-stop operations, truthful realtime state, authoritative route association, and route-cache invalidation as frontend evidence against daily-operation readiness.

Database and Backend follow-up are not required before this report is valid, but their eventual canonical freshness and route public-read contracts must be consumed before the realtime UI work is considered complete.

## Roadmap Impact

Before daily operations: add route-stop management, an authoritative vehicle-route public contract, cache invalidation, and visible freshness/no-service state. Follow with the small admin exception surface only after the canonical-state contract is agreed. Feedback triage, device health, and trip history remain D-001 scope-dependent; playback remains gated by D-002. No roadmap file is modified here.

## Assumptions and Unknowns

- D-001, operational MVP release scope, remains pending.
- D-002, telemetry retention and canonical-history fidelity, remains pending.
- The backend may expose vehicle route data elsewhere, but this public event path does not consume it.
- Socket.IO default reconnection behavior is library behavior, not evidence of a user-visible recovery workflow.
- No runtime evidence confirms how static fallback vehicle IDs behave against a deployed backend.

## Confidence

**High** for source-visible public/admin flows, current re-audit statuses, socket lifecycle absence, route cache behavior, and route assignment behavior. **Medium** for production performance and real interruption behavior because no browser or live services were run.

## Required Decisions

- D-001 — operational MVP release scope: determines whether route-stop operations, feedback triage, device health, and trip history are release requirements beyond a controlled demo.
- D-002 — telemetry retention and canonical-history fidelity: remains required before playback or source comparison UI.

No new owner decision is needed to add visible connection state, correct authoritative route association, repair cache keys, or improve CRUD feedback.
