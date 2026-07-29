# Frontend Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `4d5a456a6d73ef5a58d674426ba889f43102a9d2`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`, `docs/audits/backend-audit.md`, `docs/audits/README.md`, `docs/audits/dashboard-ux-audit.md`, `docs/audits/production-readiness-audit.md`, `docs/audits/lead-audit-summary.md`, `docs/decision-queue.md`, `docs/roadmap/master-refactoring-roadmap.md`, `docs/tasks/T8-truthful-map-live-count.md`, `scripts/ci-checks.sh`, `shuttle-tracking-web/package.json`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/public/AvailabilityCard.tsx`, `shuttle-tracking-web/hooks/useShuttleTracker.ts`, `shuttle-tracking-web/hooks/useVehicleTracking.ts`, and `shuttle-tracking-web/types/canonical-state.ts`.
- Reviewed at: `2026-07-29T19:11:00+07:00`
- Validation state: `Validated`
- Predecessor baselines: Discovery, Product, Architecture, and Backend `@ d94abb3a4d80c2174d87df4d006dfbe7c814a6bc`

## T7 Re-audit Addendum — 2026-07-29

T7 adds no frontend application surface and its protected backend research routes are not consumed by
the public tracker or admin UI. The prior public/admin canonical-state findings are therefore
**Still Present**: public consumers remain canonical-only and neutral, while the admin surface retains
operational state. The material live-count expiry finding is **Still Present**: local expiry removes
or dims a marker and recalculates ETA, but does not recompute the public live count. This is the
direct, bounded T8 implementation target. The absence of Dev Dashboard UI is **Still Present** and
is not a reason to expose raw telemetry to riders.
- Previous report evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Legacy report commit: `e566cca`

## T8 Re-audit Addendum — 2026-07-29

The `d94abb3..4d5a456` evidence comparison found one bounded application change: T8 modifies only
`useShuttleTracker.ts` and `useVehicleTracking.ts`; its task record and coordinating audit documents
changed alongside them. It does not change the canonical REST/Socket.IO schema, backend authority,
route geometry/cache, raw-research paths, deployment, dependencies, or public vocabulary.

The live-count expiry finding is **Partially Resolved**. `refreshVehicleStateCounts` now projects the
canonical registry and treats a locally expired `live` vehicle as non-live before the
`AvailabilityCard` receives `vehicleStateCounts.live`; the same timer removes its Marker and
recalculates ETA. A newer accepted canonical event clears the expiry flag before the projection is
refreshed. `useVehicleTracking` also removes the vehicle Marker and clears ETA for `stale`,
`no_service`, `unknown`, and locally expired states without mutating route or stop layers.

However, a **New Finding** prevents closing the bounded T8 acceptance: `handleRouteChange` adds a
stored marker whenever its canonical route matches the newly selected route, without checking its
latest `serviceState` or local-expiry flag. Switching away from and back to that route can therefore
restore a stale or locally expired Marker before a newer canonical `live` event. This contradicts the
T8 restoration invariant. There is no focused expiry/route-switch test or browser/socket-interruption
evidence, so this source-visible path cannot be treated as runtime-verified.

## 1. Executive Summary

The Next.js frontend now consumes the T6 canonical state contract. Public and admin consumers seed
from `GET /api/public/active-vehicles`, reject older `(stateEpoch,stateVersion)` pairs, use backend
route authority, distinguish live/stale/no-service/unknown in marker behavior, suppress ETA for
non-live state, and rehydrate after Socket.IO reconnect. Admin `LiveMap` additionally renders
connection and service-state summaries. This is suitable for the supervised D-001=A presentation
boundary.

The frontend is not an operations-grade or research surface. The public view intentionally exposes
only a neutral live count and marker/ETA behavior; it does not show viewer connection or source-health
labels. T8 now recomputes the public live-only count when local freshness expires, but route switching
can re-add a stale or locally expired Marker before a newer canonical `live` event. Admin local expiry
is not equivalent to the public local-expiry path, origin configuration is duplicated, admin auth
protection begins with cookie presence, and the main public tracker still coordinates many concerns.

No raw research data, credentials, or device comparison is exposed publicly. D-006 affects T7 backend
export/validation controls, not this frontend task. No browser session, accessibility audit, load
profile, or device/provider runtime is inferred from source code.

## 2. Scope, Freshness, and Predecessor Gate

This T8 re-audit is limited to the public canonical-state projection, local expiry, Marker visibility,
ETA availability, route switching, and the live-only count. It does not certify browser/runtime,
accessibility, load, deployment, physical-device behavior, or the T10 route-mutation/cache scope.

Discovery, Product, Architecture, and Backend remain validated at
`d94abb3a4d80c2174d87df4d006dfbe7c814a6bc`, so the Frontend predecessor gate passes. The previous
Frontend report was stale because T8 changed the two public tracker hooks that own local freshness and
Marker presentation.

The freshness comparison from `d94abb3a4d80c2174d87df4d006dfbe7c814a6bc..HEAD` identified
`useShuttleTracker.ts`, `useVehicleTracking.ts`, the exact T8 task handoff, and coordination reports.
Only the two hooks affect this profile's application findings; the remaining changed paths are evidence
records. No owner decision changes the T8 assumptions.

Validation performed:

- `bash scripts/ci-checks.sh` — passed: backend build/boundary tests and Prisma validation, frontend
  lint/build, development and production Compose parsing, dynamic-log check, and workflow validation.
  Frontend lint retains two pre-existing warnings in `app/layout.tsx` and `utils/IconHelpers.ts`.
- `node scripts/validate-agent-workflow.js` — passed.
- No focused expiry/route-switch test, browser, screen-reader, keyboard, Socket.IO interruption,
  service-worker, deployed-origin, or ambient stateful check was run. The documented T6 browser
  evidence remains bounded controlled-MVP evidence.

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
| Public local expiry could leave `Active Trams` high | **Partially Resolved** | The local-expiry callback now reprojects counts and the card consumes the live-only result; marker removal and ETA recalculation occur in the same callback. A route switch can still re-add that stale/expired marker without a newer canonical `live` event. |
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
state. T8 removes a stale vehicle Marker rather than rendering its last-known position, and clears the
selected vehicle ETA; no-service/unknown and locally expired states follow the same no-Marker/no-ETA
path. Route identity still comes from the backend, and unknown route authority cannot produce a
route-specific ETA.

The public hook's local expiry timer now marks the matching accepted live version expired, recomputes
the canonical state counts, removes its Marker, and recalculates ETA. `ShuttleTracker` passes the
resulting live-only count to `AvailabilityCard`, so the prior stale-count path is repaired at source
level. Yet `handleRouteChange` only compares a stored Marker's route with the selected route; it does
not reject stale or expired current state. A route toggle can restore a Marker that T8 removed, so the
T8 marker-restoration acceptance remains incomplete.

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

### High — Route switching can restore a stale or expired public Marker

T8 now synchronizes local-expiry marker removal, live count, and ETA. But `handleRouteChange` can add
the stored Marker back whenever its canonical route matches the selected route, without checking the
current non-live/expired projection. Gate route-change Marker addition by the latest accepted canonical
state and expiry flag, and add a focused live → expired/stale → route switch → newer live test before
closing T8.

### Partially Resolved — Public live count after local expiry

The card now receives a count reprojected from the canonical registry on local expiry, and a newer
accepted live state clears the expiry flag before its count can return. This is source-verified and CI
build-verified, but has no focused timer or browser/runtime fixture.

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

T6 remains revalidated for the frontend consumer boundary. T7 remains a backend/database research
task; the frontend must not add raw research UI or alter public canonical payloads. T8's bounded
live-count repair is **Partially Resolved**, but the stale/expired Marker route-switch path prevents
closure; the T10-dependent route-mutation/cache scope remains excluded and blocked under D-001=A.
T10–T12 remain deferred, and D-003 keeps topology/origin work ordered before configuration alignment.

Approved D-001 through D-006 remain unchanged. No new owner decision is proposed by this report.

## 12. Assumptions, Unknowns, and Confidence

- No browser session, screen-reader/keyboard audit, deployed origin, service-worker runtime, or real
  device was observed.
- OSRM availability, browser geolocation, Socket.IO reconnect timing, timer/route-switch behavior,
  and marker performance remain unverified at runtime. The documented T6 browser evidence is bounded
  controlled-MVP evidence.
- The controlled small-fleet target is a design assumption, not measured frontend capacity.
- Confidence is **High** for source-visible component/API ownership and T6 guards; **Medium** for
  user-facing resilience, accessibility, and runtime performance; **Low** for deployed/provider/device
  outcomes.

## 13. Audit Limitations and Handoff

No frontend code, schema, deployment, retention policy, or owner decision was changed by this report.
Frontend is **Complete / Validated** at `4d5a456a6d73ef5a58d674426ba889f43102a9d2` as an audit
profile; that validates the evidence and records rather than resolves the remaining T8 acceptance
gap. Dashboard & UX is the next eligible selected profile, followed by Production Readiness.
