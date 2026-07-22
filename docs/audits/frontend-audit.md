# Frontend Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/roadmap/master-refactoring-roadmap.md`, `shuttle-tracking-web/package.json`, `shuttle-tracking-web/next.config.ts`, `shuttle-tracking-web/proxy.ts`, `shuttle-tracking-web/contexts/AuthContext.tsx`, `shuttle-tracking-web/services/api.ts`, `shuttle-tracking-web/services/publicApi.ts`, `shuttle-tracking-web/app/page.tsx`, `shuttle-tracking-web/app/admin/layout.tsx`, `shuttle-tracking-web/app/admin/dashboard/page.tsx`, `shuttle-tracking-web/app/admin/login/page.tsx`, `shuttle-tracking-web/app/admin/vehicles/page.tsx`, `shuttle-tracking-web/app/admin/routes/page.tsx`, `shuttle-tracking-web/app/admin/stops/page.tsx`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/public/FeedbackModal.tsx`, `shuttle-tracking-web/components/public/StopInfoCard.tsx`, `shuttle-tracking-web/components/public/AvailabilityCard.tsx`, `shuttle-tracking-web/components/public/VehicleInfoCard.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/components/admin/Sidebar.tsx`, `shuttle-tracking-web/simulate.js`, and `shuttle-tracking-web/simulate-manual.js`.
- Reviewed at: `2026-07-22T21:25:57+07:00`
- Validation state: **Validated**
- Predecessor baselines: Discovery, Product, and Architecture, each `@ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Legacy report commit: `e566cca`

## 1. Executive Summary

The Next.js frontend provides a usable controlled-demo public tracker and basic authenticated admin CRUD. It dynamically loads active routes and route stops, uses OSRM/localStorage/bundled geometry fallbacks, renders Leaflet markers, calculates client-side ETA/next-stop information, submits feedback with loading/error/success states, and connects to the canonical Socket.IO stream. The admin shell uses a server-side cookie-presence redirect, client-side JWT expiry checks, an Axios bearer interceptor, and pages for vehicles, routes, stops, and a dashboard.

The frontend is not yet a truthful daily-operations or research surface. Public and admin realtime clients listen only for `location-update`; they do not expose connection, reconnect, freshness, per-vehicle expiry, or explicit stale/offline/no-service state. The public client assigns an event to the selected route when the backend event lacks route identity, and it owns route position, ETA, and next-stop calculations. The public tracker remains a very large component with map, network, cache, geolocation, PWA, tour, feedback, and realtime responsibilities. The admin UI has no route-stop, trip-history, device-health, feedback-triage, or authenticated Dev Dashboard surface.

For D-001=A, retain the current public client as a supervised presentation. Implement the backend T6 contract before promising live freshness, route correctness, daily operations, or D-004 comparison views.

## 2. Scope, Freshness, and Predecessor Gate

This review covers Next.js server/client boundaries, admin auth presentation, REST and Socket.IO lifecycle, public map/ETA state, route geometry caching, loading/error/empty states, admin CRUD feedback, and research-surface readiness. It does not claim browser/runtime, accessibility, load, deployment, or physical-device evidence.

Discovery, Product, and Architecture are Complete and Validated at the same baseline, so the Frontend predecessor gate passes. The current evidence includes the post-Architecture public/admin source, approved research scope, current API/origin configuration, simulator clients, and CI-reported frontend lint/build. Current uncommitted changes are audit documentation only.

## 3. Prior-Finding Revalidation

| Prior finding | State | Current evidence and implication |
|---|---|---|
| Realtime UI had no connection or stale-state model | **Still Present** | Public `ShuttleTracker` and admin `LiveMap` register only `location-update`; neither tracks connect, disconnect, reconnect, error, per-vehicle last update, expiry, or server freshness. |
| Route-geometry cache could be stale | **Resolved** | `ShuttleTracker` now uses a versioned cache record and a signature containing stop order, IDs, and coordinates with a 24-hour TTL. Backend route-stop cache invalidation remains a separate cross-boundary risk. |
| `ShuttleTracker` mixed too many responsibilities | **Still Present** | One large client component still owns REST fallback resolution, route/stop loading, OSRM, localStorage, Leaflet markers/layers, ETA, geolocation, Socket.IO, cards, tour, PWA installation, and feedback wiring. |
| Admin route protection only checked cookie presence | **Still Present** | `proxy.ts` redirects based on `admin_token` presence; JWT expiry/shape is checked after client render in `AuthContext`, while API requests rely on backend validation and 401/403 redirect. |
| Route-stop management UI was missing | **Still Present** | Admin navigation has Dashboard, Vehicles, Routes, and Stops only; no route-stop page or caller exists. |
| Admin CRUD validation and mutation feedback were weak | **Still Present** | Vehicle/route/stop pages use loading and browser `alert`/`confirm`, but do not provide consistent saving state, inline server errors, or a shared mutation feedback model. |
| Socket origin configuration was inconsistent | **Partially Resolved** | Public and admin maps strip `/api` when deriving Socket.IO origin and Next rewrites `/socket.io`; origin fallback logic remains duplicated and the environment contract is not a single shared client configuration. |
| Public feedback UI was missing | **Partially Resolved** | Submission now has active-vehicle loading, fallback list, validation, submit/loading/error/success states; no receipt, privacy/retention notice, or staff review/triage surface exists. |
| Public route assignment came from the selected UI route | **Still Present** | On the first location event, `vehicleRouteMapRef[id]` falls back to `selectedRouteRef.current`; the canonical event has no authoritative route field. |
| Duplicate unused realtime map component existed | **No Longer Relevant** | The previously reported unused public map artifact is not present in the current file inventory; the active public page imports the current `components/public/ShuttleTracker`. |

## 4. Current Frontend Boundaries

| Surface | Current behavior | Assessment |
|---|---|---|
| Public route/tracker | Fetches active routes and route stops, obtains OSRM geometry with localStorage/bundled fallback, renders Leaflet map and cards, receives canonical Socket.IO updates | Suitable for controlled presentation; route, freshness, and failure semantics remain client-inferred. |
| Public feedback | Fetches active vehicles and posts feedback to public API; falls back to static vehicle IDs if loading fails | Capture is usable for pilot testing; no rider receipt or downstream case state. |
| Admin shell | `proxy.ts` checks cookie presence; `AuthContext` decodes expiry client-side; Axios adds bearer token and redirects on 401/403 | Server API remains the security authority; UI protection can briefly render based on stale/present cookie state. |
| Admin CRUD | Vehicles, routes, and stops pages fetch and mutate through Axios | Basic master-data workflow exists; route-stop composition and operational workflows are absent. |
| Admin live map | Socket.IO-only marker map with no initial REST snapshot, freshness state, error state, or auth-specific view model | Demonstration widget, not an operational exception view. |
| Developer/researcher | No authenticated Dev Dashboard, historical comparison, bounded filters, charts, or export | Missing by design until T6/T7 parameters and implementation. |

## 5. Realtime and State Review

The public tracker connects anonymously to the backend and handles only `location-update`. It buffers updates while zooming, merges the latest value into marker refs, uses five speed samples for its client ETA estimate, and uses the event's vehicle ID. It does not subscribe to `connect`, `disconnect`, `connect_error`, `reconnect`, acknowledgement, freshness, or stale/offline events. The admin `LiveMap` has the same location-only subscription and starts with an empty marker set; it does not fetch `/api/public/active-vehicles` or an admin current-state snapshot.

The public initial active-vehicle request is currently used to build vehicle names and feedback options, not to hydrate current markers. The availability card counts visible Leaflet markers and labels them “Active Trams,” so it measures client-received/visible markers rather than backend service availability. `StopInfoCard` maps `eta === null` to “no vehicle on this route” and cannot distinguish no service, stale source, disconnected socket, failed geometry, or absent route assignment.

The frontend has no deterministic event-version guard. A reconnect or delayed event can update a marker without the client knowing whether it is newer than the prior event. This is directly gated by the backend T6 contract.

## 6. Route, Geometry, and ETA Review

Active routes are selected dynamically from `/api/public/active-routes`; the initial `R01` value is replaced by the first active route when data arrives. Each route's stops are loaded from `/api/public/routes/:id/stops`. Geometry acquisition tries OSRM, then a localStorage cache keyed by a versioned stop signature, then bundled `/data/route-<id>.json`. The cache improvement resolves the old ID-only signature issue and the client preserves route-stop order and coordinate changes in the signature.

ETA and next-stop values are presentation calculations based on route geometry, polyline indexes, raw GPS position, recent client-observed speeds, a fixed average speed floor, and stop dwell assumptions. OSRM nearest-road snapping is started asynchronously for marker presentation while the route-position calculation uses raw coordinates. This distinction is not presented as measured GPS accuracy, which is appropriate for a rider estimate but not for D-004 accuracy research.

The remaining route risk is authority: if the canonical event lacks a route, the client uses the currently selected route. A wrong route can therefore affect marker visibility, route distance, next-stop, and ETA. Route geometry failure logs an error after the five-second preloader safety timeout; there is no durable/recoverable user-facing service state for a failed route load.

## 7. Loading, Failure, and Mutation UX

- A five-second preloader safety timer prevents an infinite intro, but can hide incomplete route/vehicle data rather than explaining what failed.
- Public route/API attempts use multiple origins and catch failures, but there is no persistent offline/retry panel for route data or Socket.IO state.
- Feedback has the strongest state model: vehicle loading, static fallback, form validation, submitting, server error, success, and auto-close. It does not display privacy/IP retention, submission receipt, or support expectations.
- Admin list pages have loading and empty states. Mutations primarily use browser alerts/confirms; errors are not consistently rendered inline and saving/deleting state is not shared.
- There is no frontend surface for trip history, source health, device selection/failover, raw research facts, bounded export, or feedback triage.

## 8. Admin Authentication and Configuration

The browser stores the admin JWT in `admin_token`, decodes its expiry in `AuthContext`, and sends it through Axios. `proxy.ts` checks only cookie presence because it is not the API trust boundary. The backend remains responsible for verifying the token. A stale or malformed cookie can cause a redirect/render cycle before the API corrects it; this is a UX/resilience issue rather than a replacement for server authentication.

Socket origin derivation is duplicated between public and admin components. It considers `NEXT_PUBLIC_BACKEND_URL`, strips `/api` from `NEXT_PUBLIC_API_BASE_URL`, uses same-origin behavior in some HTTPS cases, and falls back to localhost. `next.config.ts` contains a development Socket.IO rewrite. D-003/current T9 still needs a deployed topology/origin contract before production configuration is considered complete.

## 9. Performance, Privacy, and Research Readiness

The public map maintains marker/layer refs and queues updates during zoom, which is reasonable for a small vehicle count. Each accepted location also triggers an OSRM nearest request, so update frequency and external-service latency can become client pressure at higher scale. No browser profiling, connection-count test, marker-density test, or load evidence was observed.

The public client receives canonical fields only and does not expose source comparison or raw payloads. It does, however, log route/network failures and simulator/UI messages to the browser console. The D-004 research surface must be separate, authenticated, bounded by vehicle/source/route/experiment/time, and explicit about reported accuracy, route-conformance distance, pairwise disagreement, and ground-truth error. No such surface currently exists.

## 10. Actionable Recommendations

| Capability | Measurable outcome | Owner | Acceptance signal | Privacy/data boundary | Stage |
|---|---|---|---|---|---|
| T6 canonical client contract | Public/admin clients accept versioned canonical states and explicit stale/offline/no-service states | Backend + Frontend | Browser tests cover initial state, stale transition, delayed event, reconnect, and route filter | Public canonical projection only | Phase 2 / T6/T8 |
| Authoritative route handling | Every vehicle marker/ETA uses backend route identity or explicitly reports unknown route | Backend + Frontend | Multi-route fixture proves selected-route changes cannot reassign a vehicle | No raw source comparison in public UI | Phase 2 / T6 |
| Shared realtime hook | Connection, reconnect, last-received, expiry, and error state are consistent in public/admin views | Frontend | Unit/browser tests cover connect/disconnect/reconnect and duplicate/delayed events | No coordinates in diagnostics | Phase 2 / T8 |
| Route-stop operations | Staff can edit ordered route stops and observe updated public route data | Frontend + Backend | Authenticated mutation/read test and UI success/error states | Master data only | Phase 3 / T10 |
| Focused map architecture | Public tracker responsibilities are split into testable data/realtime/geometry/map hooks | Frontend | Component-level tests and no behavior drift in pilot flow | Preserve public canonical-only boundary | Phase 4 / T14 |
| Research Dev Dashboard | Authenticated researchers can compare bounded live/history metrics with safe export | Frontend + Backend + Database | Filter reproducibility, metric labels, export limit, and privacy tests | Separate research role and retention policy | Phase 2/5 / T7/T15 |

These are handoffs, not implementation authorization. No Level 2 consultation is required unless the owner requests a focused decision on research access, retention, timestamp semantics, or provider/device fields.

## 11. Roadmap and Decision Impact

This audit revalidates the Frontend inputs for T6, T8, T9, T10, T11, T12, T14, and T15. T6 must precede stale/offline and route-authority changes. T10–T12 remain deferred under D-001=A. D-003 keeps topology/origin definition before configuration alignment. D-004 requires an authenticated research surface but does not authorize exposing raw data in the public tracker.

No new owner decision is proposed. Product scope, research retention/access, topology, and three-device boundaries remain governed by D-001 through D-004.

## 12. Assumptions, Unknowns, and Confidence

- No browser session, screen-reader/keyboard audit, deployed origin, service-worker runtime, or real device was observed.
- OSRM availability, browser geolocation behavior, Socket.IO reconnect behavior, and marker performance are unverified at runtime.
- The controlled ten-vehicle target is a design assumption, not a measured frontend capacity.
- Confidence is **high** for source-visible component/API ownership and **medium** for user-facing resilience, accessibility, and runtime performance.

## 13. Audit Limitations and Handoff

No frontend code changes are authorized by this report. Frontend is now Complete and Validated. Infrastructure & Device is now eligible once Backend and Database also pass; Dashboard & UX remains gated by Frontend plus Infrastructure & Device, followed by Security/DevOps/Observability, Production Readiness, and Roadmap.
