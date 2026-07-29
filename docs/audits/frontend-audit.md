# Frontend Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`, `docs/audits/backend-audit.md`, `docs/audits/README.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/research/T7-owner-input-questionnaire.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/roadmap/master-refactoring-roadmap.md`, `docs/tasks/T6-canonical-vehicle-state.md`, `shuttle-tracking-web/package.json`, `shuttle-tracking-web/next.config.ts`, `shuttle-tracking-web/proxy.ts`, `shuttle-tracking-web/contexts/AuthContext.tsx`, `shuttle-tracking-web/services/api.ts`, `shuttle-tracking-web/services/publicApi.ts`, `shuttle-tracking-web/app/`, `shuttle-tracking-web/components/`, `shuttle-tracking-web/hooks/`, `shuttle-tracking-web/types/`, `shuttle-tracking-web/utils/`, `shuttle-tracking-web/constants/`, and the checked-in simulator files.
- Reviewed at: `2026-07-29T11:07:14+07:00`
- Validation state: `Validated`
- Predecessor baselines: `docs/project-knowledge-base.md @ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`; `docs/audits/product-audit.md @ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`; `docs/audits/architecture-audit.md @ fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`; `docs/audits/backend-audit.md @ fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`
- Previous report evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Legacy report commit: `e566cca`

## 1. Executive Summary

The Next.js frontend now consumes the T6 canonical state contract. Public and admin consumers seed
from `GET /api/public/active-vehicles`, reject older `(stateEpoch,stateVersion)` pairs, use backend
route authority, distinguish live/stale/no-service/unknown in marker behavior, suppress ETA for
non-live state, and rehydrate after Socket.IO reconnect. Admin `LiveMap` additionally renders
connection and service-state summaries. This is suitable for the supervised D-001=A presentation
boundary.

The frontend is not an operations-grade or research surface. The public view intentionally exposes
only a neutral live count and marker/ETA behavior; it does not show viewer connection or source-health
labels. Admin local expiry is not equivalent to the public local-expiry path, origin configuration is
duplicated, admin auth protection begins with cookie presence, and the main public tracker still
coordinates many concerns. A newly observed correctness gap is that local expiry removes a marker and
updates ETA availability but does not recalculate `vehicleStateCounts.live`, so the public live-count
card can remain high until a new canonical state arrives.

No raw research data, credentials, or device comparison is exposed publicly. D-006 affects T7 backend
export/validation controls, not this frontend task. No browser session, accessibility audit, load
profile, or device/provider runtime is inferred from source code.

## 2. Scope, Freshness, and Predecessor Gate

This re-audit covers Next.js server/client boundaries, admin auth presentation, REST and Socket.IO
lifecycle, public map/ETA state, route geometry caching, loading/error/empty states, admin CRUD
feedback, and research-surface readiness. It does not certify browser/runtime, accessibility, load,
deployment, or physical-device behavior.

Discovery and Product remain accepted at `847a18c...`; Architecture and Backend are current and
validated at `fa9441b...`, so the Frontend predecessor gate passes. The previous Frontend report was
stale because T6 changed the canonical types/API, public tracker hooks, admin map, route authority,
local freshness handling, and build font configuration.

The freshness comparison from `847a18cce9bc27c82b2622dbc176b3a89bc4d037..HEAD` identified the T6
frontend components/hooks/types/services, backend canonical contract used by the clients, moved
boundary tests, and related task/decision documents as relevant changes. D-006 is present as
uncommitted coordination evidence and does not change frontend behavior.

Validation performed:

- In `shuttle-tracking-web`: `npm run lint` — passed with two warnings and no errors.
- In `shuttle-tracking-web`: `npx tsc --noEmit` — passed.
- In `shuttle-tracking-web`: `npx next build --webpack` — passed; production output compiled and
  generated all current app routes.
- No browser, screen-reader, keyboard, service-worker, deployed-origin, or ambient stateful check was
  run during this re-audit. The documented owner-confirmed T6 browser evidence remains bounded
  controlled-MVP evidence.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Realtime UI had no connection or stale-state model | **Partially Resolved** | Admin `LiveMap` now renders connected/reconnecting/disconnected and service-state counts; public `useSocketConnection` still does not expose transport state, and public source-health labels remain intentionally hidden under D-005. Canonical state guards are present. |
| Route-geometry cache could be stale | **Resolved** | Route geometry cache uses a versioned stop signature containing stop order, IDs, and coordinates with a 24-hour TTL; backend route-stop invalidation remains a separate boundary. |
| `ShuttleTracker` mixed too many responsibilities | **Still Present** | `useShuttleTracker` plus the public page still coordinate route/stop loading, geometry, Leaflet, realtime, ETA, geolocation, PWA, tour, feedback, and loading state. Supporting hooks reduce some coupling but do not make the map boundary independently testable. |
| Admin route protection only checked cookie presence | **Still Present** | `proxy.ts` redirects based on `admin_token` presence; JWT expiry/shape is checked after client render in `AuthContext`, while backend validation remains authoritative. |
| Route-stop management UI was missing | **Still Present** | Admin navigation still has Dashboard, Vehicles, Routes, and Stops only; route-stop composition/reordering is absent. |
| Admin CRUD validation and mutation feedback were weak | **Still Present** | Pages have loading/empty states and alert/confirm feedback, but no consistent saving state, inline server-error model, or shared mutation feedback boundary. |
| Socket origin configuration was inconsistent | **Partially Resolved** | Public/admin code strips `/api` when deriving Socket.IO origin and uses the configured backend origin, but origin fallback logic remains duplicated and the deployment topology/origin contract is not evidenced. |
| Public feedback UI was missing | **Partially Resolved** | Loading, static fallback, validation, submit/error/success, and auto-close behavior exist; there is still no receipt, privacy/retention notice, or staff review/triage surface. |
| Public route assignment came from the selected UI route | **Resolved** | `vehicleRouteMapRef` is populated from canonical `routeId` only when `routeAuthority` is known; the selected route remains a filter and cannot populate vehicle route authority. |
| Duplicate unused realtime map component existed | **No Longer Relevant** | The old unused artifact is not present in the current file inventory; the active public page uses the current tracker path. |
| Public/admin clients lacked T6 state/version contract | **Resolved** | Shared canonical types, initial REST hydration, epoch/version guards, stale/no-service/unknown handling, local public expiry, and admin state summaries are present and covered by T6 source/boundary checks. |

## 4. Current Frontend Boundaries

| Surface | Current behavior | Assessment |
|---|---|---|
| Public route/tracker | Fetches active routes/stops, obtains OSRM geometry with localStorage/bundled fallback, renders Leaflet map/cards, hydrates canonical vehicle state, and receives `location-update` | Suitable for controlled presentation; public connection/source-health wording is deliberately neutral and runtime failure behavior remains limited. |
| Public feedback | Fetches active vehicles and posts feedback; falls back to static vehicle IDs if loading fails | Capture is usable for pilot testing; no receipt, privacy notice, or downstream case state. |
| Admin shell | `proxy.ts` checks cookie presence; `AuthContext` decodes expiry client-side; Axios adds bearer token and redirects on 401/403 | Backend remains the security authority; UI protection can briefly render based on stale/present cookie state. |
| Admin CRUD | Vehicles, routes, and stops pages fetch/mutate through Axios | Basic master-data workflow exists; route-stop composition and operational workflows are absent. |
| Admin live map | Hydrates canonical state over REST, accepts the same Socket.IO envelope, guards versions, and renders connection/service summaries | Improved controlled-MVP diagnostic widget; local expiry and protected exception views remain incomplete. |
| Developer/researcher | No authenticated Dev Dashboard, historical comparison, bounded metric filters, charts, or export | Missing by design until T7 backend contract and access controls exist. |

## 5. Realtime and Canonical State Review

The public and admin clients now accept only schema version 1 canonical envelopes. Each vehicle has a
local `(stateEpoch,stateVersion)` comparator; older same-epoch events are ignored and a new epoch is
accepted as a namespace reset. Initial REST hydration occurs before the socket is processed, and a
successful reconnect rehydrates the snapshot. This prevents the old delayed-event and route-fallback
failure modes at the repository contract level.

`useVehicleTracking` uses `liveLocation` only for live state and `lastKnownLocation` only for stale
state. Stale markers are dimmed and ETA is disabled; no-service/unknown states remove the marker and
set unavailable stop information. Route identity comes from the backend, and unknown route authority
cannot produce route-specific ETA.

The public hook's local expiry timer removes a live marker when the receive-time freshness threshold
passes without a newer state. However, the expiry callback sets `expiredVehiclesRef` and recalculates
ETA without recomputing `vehicleStateCounts`; `ShuttleTracker` passes `vehicleStateCounts.live` to
`AvailabilityCard`. The visible live count can therefore remain stale until another canonical state
updates the counts. This is a new frontend finding and should be fixed in a bounded consumer task.

`useSocketConnection` still does not expose connection/error state to the public tracker. Admin
`LiveMap` has its own connection state and hydration logic rather than sharing one realtime hook, so
public/admin lifecycle behavior can drift. Admin does not have a local expiry timer equivalent to the
public path; it relies on server transitions for stale state while disconnected.

## 6. Route, Geometry, and ETA Review

Active routes are selected dynamically from `/api/public/active-routes`; the initial `R01` value is
replaced by the first active route when data arrives. Route stops are loaded per route. Geometry tries
OSRM, then a localStorage cache keyed by a versioned stop signature, then bundled route data. The
cache signature includes ordered stop IDs and coordinates, resolving the previous ID-only staleness
finding.

ETA and next-stop values remain presentation calculations based on route geometry, raw canonical
position, recent client-observed speeds, an average-speed floor, and stop dwell assumptions. This is
an estimate, not device latency or absolute GPS accuracy. Route-conformance distance, reported
accuracy, pairwise disagreement, and ground-truth error remain distinct research metrics and are not
shown as a single frontend score.

The remaining route risk is data availability: if geometry fails, the preloader safety timeout can
allow a partially initialized map without a persistent rider-facing recovery panel. The route cache
also depends on backend route-stop mutation invalidation, which remains outside this profile.

## 7. Loading, Failure, and Mutation UX

- The five-second preloader safety timer prevents an infinite intro but can hide incomplete route or
  vehicle data instead of explaining the failed dependency.
- Public route/API attempts use configured and localhost fallback origins and catch failures, but no
  persistent offline/retry panel is shown for route data or public Socket.IO failure.
- Feedback has the strongest state model: vehicle loading, static fallback, validation, submitting,
  server error, success, and close. It still lacks privacy/IP retention wording and a receipt.
- Admin lists have loading and empty states. Mutations primarily use browser alerts/confirms and do
  not share inline error or saving-state components.
- No frontend surface exists for trip history, source health, device selection/failover, raw research
  facts, bounded export, or feedback triage.

## 8. Admin Authentication and Configuration

The browser stores the admin JWT in `admin_token`, decodes expiry in `AuthContext`, and sends it
through Axios. `proxy.ts` checks only cookie presence because it is not the API trust boundary. A
stale or malformed cookie can cause a redirect/render cycle before the API corrects it; this remains
a UX/resilience issue rather than a replacement for server authentication.

Socket origin derivation is duplicated between public/admin components and the shared socket hook.
It considers `NEXT_PUBLIC_BACKEND_URL`, strips `/api` from `NEXT_PUBLIC_API_BASE_URL`, and falls back
to localhost. `next.config.ts` contains a development Socket.IO rewrite. D-003/T9 still needs a
deployed topology/origin contract before production configuration is current.

## 9. Performance, Privacy, and Research Readiness

The public map maintains marker/layer refs and queues updates during zoom, which is reasonable for a
small vehicle count. Each accepted location can trigger an OSRM nearest request, and Leaflet marker
updates/DOM icon manipulation are not profiled at the target cadence. No browser profiling,
connection-count test, marker-density test, or load evidence was observed.

The public client receives canonical fields only and does not expose source comparison or raw payloads.
The T7 research surface must remain separate, authenticated, bounded by vehicle/source/route/
experiment/time, and explicit about each accuracy/arrival metric. No such surface currently exists.

## 10. Current Findings and Recommendations

### High — Public live count can remain stale after local expiry

The expiry callback removes a marker and updates ETA availability but does not recalculate
`vehicleStateCounts.live`, while the public card renders that count. Update the same state projection
used by the card when expiry occurs, and test live → expired → recovery without a new state gap.

### Medium — Public/admin realtime lifecycle implementations can drift

The public hook has local expiry and silent connection handling; admin has connection labels and REST
hydration but no equivalent local expiry. Consolidate the state/lifecycle contract or explicitly
document the different public-neutral/admin-operational projections before daily operations.

### Medium — Public failure semantics remain intentionally implicit

Public stale/no-service/unknown behavior is expressed through marker/ETA behavior, not explicit
labels, and socket/route failures have no persistent retry state. This is consistent with D-001=A and
D-005 but is insufficient for daily operations without an owner-approved wording and exception flow.

### Medium — Main tracker remains a broad maintenance boundary

Keep the current controlled path stable, then split data/realtime/geometry/map responsibilities into
testable units under the dedicated roadmap task. Do not add rooms, broker, or a second map path without
measured scale evidence.

### Medium — Admin authentication presentation is weaker than backend trust

Keep backend JWT enforcement authoritative, but add a single recoverable auth state for malformed,
expired, and missing tokens instead of relying on cookie-presence middleware plus client redirects.

### Low — Origin and external routing fallbacks are duplicated

Centralize API/socket origin derivation after T9 topology facts are approved. Do not infer the
production origin from the development rewrite or localhost fallback.

## 11. Roadmap and Decision Impact

T6 is revalidated for the frontend consumer boundary. T7 remains a backend/database research task;
the frontend must not add raw research UI or alter public canonical payloads during T7. T8 remains the
truthful map/consumer cleanup task, with the live-count expiry issue recorded as a current frontend
finding. T10–T12 remain deferred under D-001=A, and D-003 keeps topology/origin work ordered before
configuration alignment.

Approved D-001 through D-006 remain unchanged. No new owner decision is proposed by this report.

## 12. Assumptions, Unknowns, and Confidence

- No browser session, screen-reader/keyboard audit, deployed origin, service-worker runtime, or real
  device was observed.
- OSRM availability, browser geolocation, Socket.IO reconnect timing, and marker performance remain
  unverified at runtime. The documented T6 browser evidence is bounded controlled-MVP evidence.
- The controlled small-fleet target is a design assumption, not measured frontend capacity.
- Confidence is **High** for source-visible component/API ownership and T6 guards; **Medium** for
  user-facing resilience, accessibility, and runtime performance; **Low** for deployed/provider/device
  outcomes.

## 13. Audit Limitations and Handoff

No frontend code, schema, deployment, retention policy, or owner decision was changed by this report.
Frontend is now **Complete / Validated** at `fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`. The next
selected profile is **Database**; Infrastructure & Device becomes eligible only after Database also
passes, and Dashboard & UX remains gated by Frontend plus Infrastructure & Device.
