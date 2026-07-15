# Master Refactoring Roadmap

## 1. Executive Summary

The Tram Tracking System is a credible MVP, but it is not ready for production use with real vehicles, real drivers, and public riders. The production blockers are not mainly visual polish or raw performance. They are trust, operational truth, and deployability:

- GPS/trip sender flow is unauthenticated.
- Vehicle and tracking source are still treated as the same concept.
- Trip lifecycle can become inconsistent under duplicate requests.
- "Live" UI can silently show stale data.
- Production deployment configuration and health/readiness checks are missing.
- Route-stop management and trip history are missing from admin operations.

The roadmap below sequences work so foundations come before dependent features. In mentor terms: do not build LoRaWAN, ESP32, richer dashboards, or analytics on top of an ingestion path that cannot identify the sender, cannot enforce one active trip, and cannot tell users whether data is fresh.

Good enough for Phase 1 means a narrow but trustworthy production pilot: authenticated GPS sender, safe trip lifecycle, explicit deployment config, visible freshness, route-stop admin workflow, and minimum trip history. It does not require full analytics, high-fidelity playback, complete TTN/ESP32 support, or a perfect dashboard.

## 2. Input Coverage

All required inputs were available and read:

| Input | Status | Notes |
|---|---|---|
| `docs/project-knowledge-base.md` | Available | Baseline feature and architecture inventory. |
| `docs/audits/product-audit.md` | Available | Product gaps and MVP completion criteria. |
| `docs/audits/architecture-audit.md` | Available | Source/device, ingestion, service-boundary risks. |
| `docs/audits/backend-audit.md` | Available | API, trip, Socket.IO, Redis, validation findings. |
| `docs/audits/frontend-audit.md` | Available | Public/admin frontend reliability and maintainability findings. |
| `docs/audits/database-audit.md` | Available | Schema, integrity, GPS history, indexing findings. |
| `docs/audits/infrastructure-device-audit.md` | Available | Vercel/Render/Neon target, device integration, TTN/ESP32 findings. |
| `docs/audits/dashboard-ux-audit.md` | Available | UX trust, public states, operations dashboard findings. |
| `docs/audits/security-devops-observability-audit.md` | Available | Security, CI/CD, health, monitoring, rate limit findings. |
| `docs/audits/production-readiness-audit.md` | Available | Primary skeleton for Phase 1 production bar. |

Coverage confidence is high. No roadmap item below is based on fresh source-code discovery; each item traces to prior audits.

## 3. Consolidated Recommendation List

### T1. Authenticate Device/Vehicle Sender Flow

### Task
Add authenticated device or vehicle tokens for trip start, trip end, and Socket.IO GPS updates.

### Source Audit(s)
Production Readiness Audit, Minimum Viable Production Bar item 1 and Finding 1; Security, DevOps & Observability Audit Recommendation 1; Backend Audit Critical Issue 1 and Recommendation 1.

### Phase
Phase 1 - Production Blockers.

### Depends On
Decision on minimum sender identity model for the pilot. Can begin with per-vehicle or per-device secret.

### Blocks
Trusted production GPS, rate limiting by sender identity, stale device observability, driver workflow, TTN/ESP32 production claims.

### Priority
Critical.

### Difficulty
Medium.

### Suggested Agent
Level 2 Specialized Agent: JWT/Auth Agent, then Level 3 Refactoring Agent.

### Task Brief
Change vehicle/device login so it issues a short-lived token. Require that token for `POST /api/trips/start`, `PUT /api/trips/:id/end`, and Socket.IO connection or `send-location`. Validate that the token subject is allowed to act for the submitted `vehicleId` and `tripId`. Return clear 401/403 errors for missing, expired, or mismatched credentials.

### Related Files
`shuttle-tracking-backend/src/controllers/auth.controller.ts`, `shuttle-tracking-backend/src/routes/trips.route.ts`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`.

### T2. Add Minimal Device/TrackingSource Identity

### Task
Introduce a minimal tracking source model with vehicle assignment, source type, priority, status, and last-seen/source attribution.

### Source Audit(s)
Production Readiness Audit Finding 2 and Minimum Viable Production Bar item 2; Architecture Audit Critical "No tracking-source/device abstraction"; Backend Audit Critical Issue 2 and Recommendation 4; Database Audit Critical Issue 1 and Recommendation 1; Infrastructure & Device Audit Critical Issue 4 and Recommendation 4.

### Phase
Phase 1 - Production Blockers.

### Depends On
T1 for trusted source login can be implemented alongside this task. Needs Confirmation: whether Phase 1 pilot is single mobile source or multi-source.

### Blocks
Multi-device tracking, source priority/failover, source health, stale device dashboard, TTN/ESP32 adapters, canonical current location.

### Priority
Critical.

### Difficulty
Medium.

### Suggested Agent
Level 2 Specialized Agent: Device Registry / Multi-Source Tracking Agent, then Level 3 Refactoring Agent.

### Task Brief
Add `Device` or `TrackingSource` and vehicle assignment data to the schema. Store source type such as mobile, simulator, TTN, or ESP32; source status; last seen timestamp; priority; and optional secret hash. Attribute GPS observations/history to the source. Keep the first version intentionally small so Phase 1 can support one authenticated production sender without blocking future multi-source work.

### Related Files
`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/server.ts`.

### T3. Make Trip Lifecycle Idempotent And Transactional

### Task
Prevent duplicate active trips and make trip start/end safe under retries.

### Source Audit(s)
Production Readiness Audit Finding 3 and Minimum Viable Production Bar item 3; Backend Audit Critical Issue 3 and Recommendation 2; Database Audit Critical Issue 2 and Recommendation 2; Architecture Audit High "Trip lifecycle logic is spread across controller and tracking service."

### Phase
Phase 1 - Production Blockers.

### Depends On
T1 for ownership checks is strongly related. Database migration plan.

### Blocks
Reliable trip history, active trip monitor, stale trip alerts, driver workflow, reports.

### Priority
Critical.

### Difficulty
Medium.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Before starting a trip, check for an existing `in_progress` trip for the vehicle and either return it idempotently or reject with 409. End only trips currently `in_progress` and owned by the authenticated sender. Wrap trip and vehicle status updates in Prisma transactions. Add a PostgreSQL partial unique index enforcing one in-progress trip per vehicle.

### Related Files
`shuttle-tracking-backend/src/controllers/trips.controller.ts`, `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/prisma/migrations/`.

### T4. Add Central Validation And Safe API Errors

### Task
Validate REST bodies, params, and GPS payloads before database writes or broadcasts.

### Source Audit(s)
Production Readiness Audit Finding 10 and Minimum Viable Production Bar item 4; Backend Audit Recommendation 3; Security, DevOps & Observability Audit Recommendation 3; Database Audit Recommendation 5.

### Phase
Phase 1 - Production Blockers.

### Depends On
T1 and T3 define ownership and lifecycle checks. Can start independently for admin CRUD and coordinates.

### Blocks
Safe public deployment, meaningful client error handling, database integrity constraints, rate limit error semantics.

### Priority
High.

### Difficulty
Medium.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Introduce a small validation layer, preferably schema-based, for auth, vehicles, routes, stops, route-stops, trips, feedback, and Socket.IO `send-location`. Validate required fields, IDs, status values, coordinate ranges, speed/bearing ranges, unknown fields, and trip/vehicle/source mismatch. Normalize errors into predictable 400/401/403/404/409 responses.

### Related Files
`shuttle-tracking-backend/src/controllers/*`, `shuttle-tracking-backend/src/services/tracking.service.ts`.

### T5. Remove Unsafe Production Defaults

### Task
Eliminate production-capable default secrets and seeded admin credentials.

### Source Audit(s)
Production Readiness Audit Finding 4 and Minimum Viable Production Bar item 5; Security, DevOps & Observability Audit Recommendation 4.

### Phase
Phase 1 - Production Blockers.

### Depends On
None.

### Blocks
Safe public deployment.

### Priority
Critical.

### Difficulty
Easy.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Replace concrete JWT/example secrets with unmistakable placeholders, fail startup in production if known defaults are used, and make seed admin creation development-only or explicit. Document how first production admin credentials are provisioned for Vercel/Render/Neon or the chosen environment.

### Related Files
`shuttle-tracking-backend/.env.example`, `env.example`, `docker-compose.yml`, `shuttle-tracking-backend/prisma/seed.ts`, `shuttle-tracking-backend/docker-entrypoint.sh`.

### T6. Define Production Deployment Configuration

### Task
Create provider-specific deployment configuration and documentation for Vercel frontend, Render backend/Redis, and Neon database, or the chosen target.

### Source Audit(s)
Production Readiness Audit Finding 5 and Minimum Viable Production Bar item 6; Infrastructure & Device Audit Critical Issue 2 and Recommendation 1.

### Phase
Phase 1 - Production Blockers.

### Depends On
Needs Confirmation if deployment target changes from Vercel/Render/Neon.

### Blocks
Production-like testing, CORS/Socket.IO correctness, migration deployment, release readiness.

### Priority
Critical.

### Difficulty
Medium.

### Suggested Agent
Level 2 Specialized Agent: Deployment/DevOps Agent, then Level 3 Refactoring Agent.

### Task Brief
Document environment variables, build commands, start commands, migration command, CORS origin, backend public URL, REST API base URL, Socket.IO URL, Redis URL, Neon database URL, and provider setup steps. Update env examples so local and deployed config are not confused.

### Related Files
`docker-compose.yml`, `env.example`, `shuttle-tracking-backend/.env.example`, `shuttle-tracking-web/.env.example`, `shuttle-tracking-backend/README.md`, `shuttle-tracking-web/README.md`.

### T7. Use Production Build/Runtime Commands

### Task
Run compiled backend and production frontend builds instead of development servers for production-like deployment.

### Source Audit(s)
Production Readiness Audit Finding 13 and Minimum Viable Production Bar item 7; Infrastructure & Device Audit Critical Issue 1 and Recommendation 2; Security, DevOps & Observability Audit Recommendation 5.

### Phase
Phase 1 - Production Blockers.

### Depends On
T6 deployment target and command decisions.

### Blocks
Reliable deployment, CI/CD, production smoke testing.

### Priority
High.

### Difficulty
Medium.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Ensure backend has a production build and start path such as TypeScript build plus `node dist/server.js`. For frontend on Vercel, rely on Next.js production build. If containers remain part of the plan, add production Docker targets or separate production Dockerfiles that avoid `nodemon`, `next dev`, source mounts, and development `NODE_ENV`.

### Related Files
`shuttle-tracking-backend/package.json`, `shuttle-tracking-web/package.json`, `shuttle-tracking-backend/Dockerfile`, `shuttle-tracking-web/Dockerfile`, `docker-compose.yml`.

### T8. Add Health/Readiness And Minimum Monitoring Hooks

### Task
Add backend `/health` and `/ready` endpoints and basic operational counters/log events.

### Source Audit(s)
Production Readiness Audit Finding 12 and Minimum Viable Production Bar item 8; Infrastructure & Device Audit Critical Issue 3 and Recommendation 3; Security, DevOps & Observability Audit Recommendation 7.

### Phase
Phase 1 - Production Blockers.

### Depends On
T6 for deployment health-check wiring. Can implement endpoints before deployment docs.

### Blocks
Deployment health checks, uptime monitoring, incident diagnosis.

### Priority
High.

### Difficulty
Easy.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Add `/health` for process liveness and `/ready` for PostgreSQL/Redis dependency readiness. Keep readiness checks cheap. Emit basic safe events or counters for API errors, Socket.IO connections, GPS received/rejected, GPS DB writes, Redis failures, and dependency readiness failures.

### Related Files
`shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/config/prisma.ts`, `shuttle-tracking-backend/src/config/redis.ts`, `docker-compose.yml`.

### T9. Add Live Freshness And Stale-State Handling

### Task
Show connection state, last update time, and stale/offline vehicles in public and admin UIs, backed by last-seen state.

### Source Audit(s)
Production Readiness Audit Finding 11 and Minimum Viable Production Bar item 9; Frontend Audit Issue 1 and Recommendation 1; Dashboard & UX Audit Issue 1 and Recommendation 1; Product Audit Phase 1 dashboard stale/offline status; Security, DevOps & Observability Audit Recommendation 8.

### Phase
Phase 1 - Production Blockers.

### Depends On
T2 improves source-level health. A vehicle-level first version can start from Socket.IO timestamps.

### Blocks
Trustworthy public launch, operations dashboard, no-vehicle state clarity.

### Priority
High.

### Difficulty
Medium.

### Suggested Agent
Level 2 Specialized Agent: Realtime/WebSocket Agent, then Level 3 Refactoring Agent.

### Task Brief
Track Socket.IO lifecycle events in public and admin clients. Store `lastSeenAt` per vehicle/source. Show `Live`, `Reconnecting`, `Stale`, or `Offline/Unknown` states. Dim or label stale markers after a defined threshold. Replace the static admin "Live System Active" badge with real socket/API state.

### Related Files
`shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/app/admin/dashboard/page.tsx`, `shuttle-tracking-backend/src/services/tracking.service.ts`.

### T10. Add Route-Stop Management And Cache Invalidation

### Task
Let admins manage stop membership/order per route and ensure public route-stop/geometry caches refresh correctly.

### Source Audit(s)
Production Readiness Audit Findings 6 and 17, Minimum Viable Production Bar item 10; Product Audit Feature Gap 1; Frontend Audit Recommendation 4 and Recommendation 2; Dashboard & UX Audit Recommendation 8; Backend Audit Recommendation 5; Architecture Audit medium cache-invalidation finding.

### Phase
Phase 1 - Production Blockers.

### Depends On
Existing backend route-stop endpoints. Validation from T4 is useful but not strictly blocking.

### Blocks
Operations-managed production routes, trustworthy ETA/snapping after route edits.

### Priority
Critical.

### Difficulty
Medium.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Add a route detail or "Manage Stops" admin workflow where staff can add/remove stops and reorder them for a route. Invalidate backend public route-stop cache on create/delete/reorder. Fix frontend route geometry cache signature to include route ID, stop IDs, order, and coordinates, or a backend version if one is added.

### Related Files
`shuttle-tracking-web/app/admin/routes/page.tsx`, `shuttle-tracking-web/components/admin/RouteModal.tsx`, `shuttle-tracking-web/components/admin/Sidebar.tsx`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-backend/src/controllers/routeStops.controller.ts`, `shuttle-tracking-backend/src/services/cache.service.ts`.

### T11. Add Minimum Admin Trip History

### Task
Expose completed and active trip history to admins with basic filters.

### Source Audit(s)
Production Readiness Audit Finding 8 and Minimum Viable Production Bar item 11; Product Audit Feature Gap 3 and Phase 1 Critical roadmap; Backend Audit Recommendation 7; Database Audit GPS time-series review.

### Phase
Phase 1 - Production Blockers for list/history; Phase 3 for high-fidelity playback.

### Depends On
T3 for correct lifecycle; T14 for explicit sampled-vs-high-fidelity history policy.

### Blocks
Operational accountability, incident investigation, reports.

### Priority
Critical for list/history; Medium for playback.

### Difficulty
Medium.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Add protected admin endpoints and UI for trip list/history with filters by date, route, vehicle, and status. Show trip start/end, duration, vehicle, route, and status. Keep GPS playback optional until storage policy and playback indexes are defined.

### Related Files
`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/routes/trips.route.ts`, `shuttle-tracking-backend/src/controllers/trips.controller.ts`, `shuttle-tracking-web/app/admin/`.

### T12. Add Rate Limiting And Abuse Controls

### Task
Add rate limits for login, public write flows, trip/GPS flows, and Socket.IO events.

### Source Audit(s)
Production Readiness Audit Finding 16 and Minimum Viable Production Bar item 12; Security, DevOps & Observability Audit Recommendation 10.

### Phase
Phase 1 - Production Blockers.

### Depends On
T1 for device-based Socket.IO rate limits. IP-based limits can start earlier.

### Blocks
Safe public internet exposure.

### Priority
High.

### Difficulty
Medium.

### Suggested Agent
Level 2 Specialized Agent: Security/Rate-Limiting Agent, then Level 3 Refactoring Agent.

### Task Brief
Add IP/user/device-aware rate limits. Cover admin login, vehicle/device login, trip start/end, public feedback, and Socket.IO location events. Keep GPS limits compatible with expected 1-3 second updates for authenticated senders while limiting unauthenticated failures and abuse.

### Related Files
`shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/routes/auth.route.ts`, `shuttle-tracking-backend/src/routes/public.route.ts`, `shuttle-tracking-backend/src/routes/trips.route.ts`.

### T13. Separate Ingestion From Canonical Current Location

### Task
Split raw location receipt, validation, persistence, canonical selection, and broadcast into clear stages.

### Source Audit(s)
Production Readiness Audit Finding 9; Architecture Audit High "Location ingestion and canonical location are conflated"; Backend Audit Recommendation 6; Security, DevOps & Observability Audit Recommendation 8.

### Phase
Phase 2 - Structural Foundations.

### Depends On
T1, T2, T4.

### Blocks
Source priority, failover, reliable stale detection, backend-owned current state, consistent public/admin tracking facts.

### Priority
High.

### Difficulty
Medium.

### Suggested Agent
Level 2 Specialized Agent: WebSocket/Tracking Pipeline Agent.

### Task Brief
Refactor the tracking service so incoming observations are validated, normalized, attributed to a source, optionally persisted, used to update canonical current vehicle state, and only then broadcast. Return typed results such as `{ ok, location, error }`. Broadcast only accepted locations and acknowledge or emit errors to senders when data is rejected.

### Related Files
`shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/server.ts`.

### T14. Define GPS Sampling, Retention, And Index Policy

### Task
Decide and document GPS history resolution, retention window, playback expectations, and required indexes.

### Source Audit(s)
Production Readiness Audit Finding 14; Database Audit Critical Issues 3 and 4, Recommendations 3 and 4; Infrastructure & Device Audit TTN note that 60-second sampling may be acceptable for history.

### Phase
Phase 2 - Structural Foundations.

### Depends On
Needs Confirmation: sampled operational history versus high-fidelity playback.

### Blocks
Trip playback, reports, TTN history adapter, partitioning work.

### Priority
High.

### Difficulty
Medium.

### Suggested Agent
User Decision Required, then Level 2 Specialized Agent: Database/Time-Series Agent.

### Task Brief
Choose whether Phase 1/2 production stores sampled history, such as one point per 60 seconds, or high-fidelity traces near 1-3 seconds. Document retention, deletion/archive approach, and storage estimate. Add `(trip_id, recorded_at)` when playback begins. Add GiST indexes only when backend spatial queries need them.

### Related Files
`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/prisma/migrations/`.

### T15. Create Trip/Operations Domain Service

### Task
Centralize trip lifecycle and operational status rules in a backend service.

### Source Audit(s)
Architecture Audit High "Trip lifecycle logic is spread across controller and tracking service"; Backend Audit Trip Lifecycle Review; Product Audit active trip/stale dashboard gaps.

### Phase
Phase 2 - Structural Foundations.

### Depends On
T3.

### Blocks
Active trips monitor, operations dashboard, driver workflow state, alerts.

### Priority
High.

### Difficulty
Medium.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Create a service that owns start trip, end trip, active trip lookup, vehicle operational status, current trip state, and stale trip/location rules. Keep controllers focused on HTTP request/response translation.

### Related Files
`shuttle-tracking-backend/src/controllers/trips.controller.ts`, `shuttle-tracking-backend/src/services/`.

### T16. Align REST And Socket Environment Configuration

### Task
Use explicit frontend env variables for REST API base and Socket.IO backend origin.

### Source Audit(s)
Frontend Audit Recommendation 6; Infrastructure & Device Audit production config analysis; Production Readiness Audit Finding 5.

### Phase
Phase 2 - Structural Foundations.

### Depends On
T6.

### Blocks
Reliable deployed frontend socket behavior.

### Priority
Medium.

### Difficulty
Easy.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Document and use a single `NEXT_PUBLIC_BACKEND_URL` or `NEXT_PUBLIC_SOCKET_URL` for Socket.IO, and keep `NEXT_PUBLIC_API_BASE_URL` for REST. Update public tracker and admin live map to derive the same socket origin in all environments.

### Related Files
`shuttle-tracking-web/.env.example`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/README.md`.

### T17. Improve Admin Session Handling

### Task
Move admin token storage toward safer session handling and earlier expiry enforcement.

### Source Audit(s)
Production Readiness Audit Finding 15; Security, DevOps & Observability Audit Recommendation 2; Frontend Audit Issue 4 and Recommendation 7.

### Phase
Phase 2 - Structural Foundations.

### Depends On
T6 for production cookie settings and origin assumptions.

### Blocks
Safer public internet admin deployment.

### Priority
High.

### Difficulty
Medium.

### Suggested Agent
Level 2 Specialized Agent: JWT/Auth Agent.

### Task Brief
Prefer backend-set `HttpOnly`, `Secure`, `SameSite` cookies or a backend-for-frontend session pattern. If current JavaScript-readable token storage is temporarily kept, set secure production options, shorten expiry, handle logout/session invalidation, and prevent expired/malformed cookies from rendering protected admin UI.

### Related Files
`shuttle-tracking-web/contexts/AuthContext.tsx`, `shuttle-tracking-web/services/api.ts`, `shuttle-tracking-web/proxy.ts`, `shuttle-tracking-web/app/admin/layout.tsx`, `shuttle-tracking-backend/src/controllers/auth.controller.ts`.

### T18. Split Public Tracker Into Focused Hooks/Modules

### Task
Reduce `ShuttleTracker` responsibility by extracting route data, socket, markers, and ETA logic.

### Source Audit(s)
Production Readiness Audit Finding 18; Frontend Audit Issue 3 and Recommendation 3; Architecture Audit High "Frontend owns important tracking intelligence."

### Phase
Phase 2 - Structural Foundations.

### Depends On
T9 and T10 may add enough change pressure to justify this refactor. Do not block Phase 1 on a broad rewrite.

### Blocks
Safer future stale/source indicators, consistent ETA contracts, easier frontend testing.

### Priority
High.

### Difficulty
Medium.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Extract focused hooks such as `useRouteData`, `useVehicleSocket`, `useVehicleMarkers`, and `useEtaCalculator`. Preserve Leaflet refs for performance. Move only one concern at a time and verify public tracking behavior after each extraction.

### Related Files
`shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/hooks/useLeafletMap.ts`, `shuttle-tracking-web/utils/MapHelpers.ts`.

### T19. Build Minimal Driver/Mobile Workflow

### Task
Create or document the supported driver/mobile client workflow.

### Source Audit(s)
Production Readiness Audit Finding 7; Product Audit Feature Gap 2 and Phase 1 Critical roadmap; Infrastructure & Device Audit mobile readiness review.

### Phase
Phase 3 - Feature Completion.

### Depends On
T1, T2, T3, T4.

### Blocks
Real daily operations if no external audited sender exists.

### Priority
Critical from Product Audit; can be Phase 3 only if production pilot uses a separately supplied, audited GPS sender.

### Difficulty
Medium.

### Suggested Agent
Level 2 Specialized Agent: Mobile/Product Agent.

### Task Brief
Build a minimal driver web/mobile flow: vehicle/device login, assigned route confirmation, start trip, current trip state, live sending status, error/reconnect state, and end trip. If a separate mobile app or hardware client will be used instead, document its contract and verification steps.

### Related Files
`shuttle-tracking-web/simulate.js`, `shuttle-tracking-backend/src/controllers/auth.controller.ts`, `shuttle-tracking-backend/src/controllers/trips.controller.ts`, `shuttle-tracking-backend/src/server.ts`.

### T20. Add Feedback Workflow

### Task
Add public feedback submission and admin feedback inbox.

### Source Audit(s)
Product Audit Feature Gap 4 and Phase 2 roadmap; Database Audit Recommendation 6; Dashboard & UX Audit operational visibility gap.

### Phase
Phase 3 - Feature Completion.

### Depends On
T4 validation, T12 rate limiting. Feedback schema expansion when triage status is implemented.

### Blocks
Rider issue reporting and feedback-based operations.

### Priority
Medium.

### Difficulty
Low to Medium.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Expose public feedback submission with type, message, optional route/vehicle/stop context, and safe validation/rate limits. Add admin feedback inbox with status, timestamp, filtering, and basic resolution workflow. Expand schema with workflow fields only when implementing the inbox.

### Related Files
`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/controllers/feedback.controller.ts`, `shuttle-tracking-backend/src/services/feedback.service.ts`, `shuttle-tracking-web/app/`, `shuttle-tracking-web/app/admin/`.

### T21. Add Active Trips Monitor And Operations Dashboard Exceptions

### Task
Reframe dashboard around active trips, stale/silent vehicles, uncovered routes, and socket/API health.

### Source Audit(s)
Production Readiness Audit Finding 19; Dashboard & UX Audit Issue 2, Recommendation 2, Recommendation 9; Product Audit Phase 2 active trips monitor and alerts; Security, DevOps & Observability Audit Recommendation 8.

### Phase
Phase 3 - Feature Completion.

### Depends On
T9, T11, T15.

### Blocks
Daily operations visibility.

### Priority
High.

### Difficulty
Medium.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Add an "Attention Needed" section and a live vehicle list. Include active trips, stale/silent vehicles, route coverage, last seen, health label, speed, station/next stop where available, and socket/API health. Keep inventory counts as secondary metrics.

### Related Files
`shuttle-tracking-web/app/admin/dashboard/page.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-backend/prisma/schema.prisma`.

### T22. Improve Public No-Data, Route Labels, ETA Confidence, And Tour Anchors

### Task
Improve public trust and discoverability states without changing core tracking architecture.

### Source Audit(s)
Production Readiness Audit Finding 20; Dashboard & UX Audit Recommendations 3, 4, 5, 6; Frontend Audit error/empty state review.

### Phase
Phase 3 - Feature Completion.

### Depends On
T9 for freshness context. T10 for route data correctness.

### Blocks
Public rider trust and first-time usability.

### Priority
High for no-data states; Medium for route labels, ETA framing, and tour anchors.

### Difficulty
Easy.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
When no vehicles are live, explain whether no vehicle is reporting, the connection is down, or data is stale. Show route name/destination with route code. Frame ETA as approximate and pair it with freshness. Fix onboarding tour selectors using stable `data-tour` anchors.

### Related Files
`shuttle-tracking-web/components/public/AvailabilityCard.tsx`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/public/StopInfoCard.tsx`, `shuttle-tracking-web/components/public/AppTour.tsx`.

### T23. Improve Admin CRUD Feedback And Client Validation

### Task
Replace browser alerts with inline recoverable feedback and add client-side validation.

### Source Audit(s)
Frontend Audit Recommendation 5; Dashboard & UX Audit Recommendation 7.

### Phase
Phase 3 - Feature Completion.

### Depends On
T4 backend validation for final authority.

### Blocks
Admin confidence and error recovery.

### Priority
Medium.

### Difficulty
Easy.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Add inline form errors, saving states, success feedback, retryable page errors, and latitude/longitude range validation. Keep backend validation authoritative and map API errors into useful UI messages.

### Related Files
`shuttle-tracking-web/components/admin/VehicleModal.tsx`, `shuttle-tracking-web/components/admin/RouteModal.tsx`, `shuttle-tracking-web/components/admin/StopModal.tsx`, `shuttle-tracking-web/app/admin/vehicles/page.tsx`, `shuttle-tracking-web/app/admin/routes/page.tsx`, `shuttle-tracking-web/app/admin/stops/page.tsx`.

### T24. Add Structured Redacted Logging

### Task
Move high-value backend logs to structured, redacted logging and remove noisy frontend live-location logs.

### Source Audit(s)
Security, DevOps & Observability Audit Recommendation 9.

### Phase
Phase 4 - Hardening & Scale.

### Depends On
T8 defines minimum events worth observing.

### Blocks
Incident debugging maturity.

### Priority
Medium.

### Difficulty
Easy.

### Suggested Agent
Level 3 Refactoring Agent direct.

### Task Brief
Use structured log fields for severity, timestamp, event name, request ID when available, and safe operational identifiers. Redact URLs/tokens/passwords. Stop logging full Redis URLs and per-location frontend updates in production.

### Related Files
`shuttle-tracking-backend/src/config/redis.ts`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/controllers/*`, `shuttle-tracking-web/components/admin/LiveMap.tsx`.

### T25. Add Minimal Automated Tests And Release Gates

### Task
Add focused tests and CI/CD gates around the production blockers.

### Source Audit(s)
Security, DevOps & Observability Audit Recommendation 6 and Recommendation 5.

### Phase
Phase 4 - Hardening & Scale.

### Depends On
T1, T3, T4 for high-value test subjects. Can start with build/lint gates earlier.

### Blocks
Regression-safe deployment.

### Priority
Medium.

### Difficulty
Medium.

### Suggested Agent
Level 2 Specialized Agent: Testing/CI Agent.

### Task Brief
Add backend tests for admin login, auth middleware, device auth, trip idempotency, GPS validation, route-stop cache invalidation, and feedback validation. Add frontend smoke tests for admin auth redirects and public map boot. Add CI steps for install with lockfiles, backend build/typecheck, frontend lint/build, tests, and migration deploy checks.

### Related Files
`shuttle-tracking-backend/package.json`, `shuttle-tracking-web/package.json`, `.github/workflows/`, `shuttle-tracking-backend/prisma/`.

### T26. Build TTN History Ingestion Adapter

### Task
Design and implement server-side TTN/LoRaWAN history ingestion if TTN is in production scope.

### Source Audit(s)
Production Readiness Audit Finding 21; Infrastructure & Device Audit Recommendation 5 and LoRaWAN Integration Readiness.

### Phase
Phase 5 - Future Enhancements / Blocked Decision.

### Depends On
T2, T13, T14. Needs Confirmation on TTN application/device IDs, payload format, decoder location, credential handling, and whether frontend receives TTN directly or through a relay.

### Blocks
LoRaWAN production support.

### Priority
High if TTN is in production scope; otherwise deferred.

### Difficulty
Hard.

### Suggested Agent
User Decision Required, then Level 2 Specialized Agent: LoRaWAN/TTN Agent.

### Task Brief
Create a backend or worker adapter that receives TTN uplinks via MQTT or webhook, decodes payloads, maps them to source-attributed observations, applies the chosen sampling policy, and writes history. Do not rely on browser clients as the system-of-record history writer.

### Related Files
`shuttle-tracking-backend/src/services/tracking.service.ts`, future backend/worker ingestion module.

### T27. Decide And Implement ESP32 Ingestion

### Task
Choose ESP32 protocol and implement an adapter only after normalized observation contracts exist.

### Source Audit(s)
Infrastructure & Device Audit ESP32 Integration Readiness and Multi-Device Architecture Readiness.

### Phase
Phase 5 - Future Enhancements / Blocked Decision.

### Depends On
T2, T13, T14. Needs Confirmation on Wi-Fi/cellular/network path, payload fields, authentication, update frequency, and whether ESP32 is primary or fallback.

### Blocks
ESP32 production support.

### Priority
Deferred until user decision.

### Difficulty
Medium to Hard.

### Suggested Agent
User Decision Required, then Level 2 Specialized Agent: ESP32/IoT Agent.

### Task Brief
Choose HTTP, MQTT, or another protocol. Implement a source-authenticated adapter that normalizes ESP32 payloads into the same observation pipeline as mobile and TTN. Include battery/signal/timestamp fields if required by the selected hardware.

### Related Files
Future backend/worker ingestion module, `shuttle-tracking-backend/prisma/schema.prisma`.

### T28. Add Reports, Analytics, Announcements, Admin Roles, Audit Log, And Advanced Playback

### Task
Implement lower-priority operational and management enhancements after production trust foundations are stable.

### Source Audit(s)
Product Audit Phase 3 Enhancement roadmap; Dashboard & UX Audit operational visibility gap; Database Audit missing schema capabilities.

### Phase
Phase 5 - Future Enhancements.

### Depends On
T11, T14, T20, T21, T25.

### Blocks
Long-term service improvement workflows, not initial production trust.

### Priority
Low to Medium depending on product scope.

### Difficulty
Medium.

### Suggested Agent
Level 2 Specialized Agent: Data/Analytics Agent for reports; Level 3 Refactoring Agent for smaller features.

### Task Brief
Add trip playback, reports such as trips per day and average trip duration, service announcements, admin user/role management, and operational audit logs. Sequence each feature from actual product need and available data rather than implementing all at once.

### Related Files
`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-web/app/admin/`, reporting/playback modules to be created.

## 4. Dependency Map

Core dependency chain:

1. T5, T6, T7, T8 can start immediately because they reduce deployment risk and do not depend on application domain redesign.
2. T1, T2, T3, and T4 form the trust-and-integrity foundation. These should happen before driver workflow, multi-device adapters, active trip monitor, or TTN/ESP32 work.
3. T9 and T10 are user-visible production trust features. They can proceed in parallel with backend foundation work, but T9 becomes stronger after T2 supplies last-seen/source state.
4. T11 depends on T3 because trip history is only useful if trip lifecycle is consistent.
5. T13 and T15 are structural refactors that make later features cheaper. They should not block the first secure pilot unless the implementation work is already touching the same files heavily.
6. T19, T20, T21, T22, and T23 are feature completion and UX improvement work. They should be parallelized only after shared API contracts are stable.
7. T26 and T27 are blocked on user/device decisions and should not be started before T2, T13, and T14.

Parallelization guidance:

- Backend trust track: T1, T3, T4, T12, T13, T15.
- Database/device track: T2, T14, later T26/T27.
- Deployment track: T5, T6, T7, T8, T24, T25.
- Frontend operations track: T9, T10, T11 UI, T21, T22, T23.

Avoid parallel edits that collide:

- T1, T3, T4, T13, and T15 all touch trip/GPS backend code. Sequence these deliberately or assign one agent to own the tracking backend.
- T9, T18, and T22 all touch `ShuttleTracker.tsx`. Either do T18 first as a refactor or keep T9/T22 edits narrow and postpone extraction.
- T10 touches both route admin UI and public route geometry cache. Coordinate backend route-stop cache invalidation with frontend cache-signature changes.

## 5. Phased Roadmap

### Phase 1 - Production Blockers

Entry criteria:

- All prior audits available.
- Production scope is at least a controlled pilot with real users or real vehicle/location data.

Tasks:

- T1 Authenticate Device/Vehicle Sender Flow.
- T2 Add Minimal Device/TrackingSource Identity.
- T3 Make Trip Lifecycle Idempotent And Transactional.
- T4 Add Central Validation And Safe API Errors.
- T5 Remove Unsafe Production Defaults.
- T6 Define Production Deployment Configuration.
- T7 Use Production Build/Runtime Commands.
- T8 Add Health/Readiness And Minimum Monitoring Hooks.
- T9 Add Live Freshness And Stale-State Handling.
- T10 Add Route-Stop Management And Cache Invalidation.
- T11 Add Minimum Admin Trip History.
- T12 Add Rate Limiting And Abuse Controls.

Exit criteria:

- Real sender identity is authenticated for trip/GPS.
- One active trip per vehicle is enforced by app logic and database guard.
- Invalid GPS/trip/admin payloads are rejected predictably.
- Deployment target has documented env/config/build/start/migration path.
- Backend can be health/readiness checked.
- Public/admin users can distinguish live, stale, reconnecting, and no-data states.
- Admins can manage route-stop order and review basic trip history.

Mentor note: this phase is intentionally not glamorous. It turns the system from "markers move in a demo" into "operators can trust what the system is saying."

### Phase 2 - Structural Foundations

Entry criteria:

- Phase 1 trust boundaries are implemented or actively being implemented.
- The team knows whether history is sampled or high-fidelity for the next release.

Tasks:

- T13 Separate Ingestion From Canonical Current Location.
- T14 Define GPS Sampling, Retention, And Index Policy.
- T15 Create Trip/Operations Domain Service.
- T16 Align REST And Socket Environment Configuration.
- T17 Improve Admin Session Handling.
- T18 Split Public Tracker Into Focused Hooks/Modules.

Exit criteria:

- Tracking pipeline has clear stages.
- Trip operations rules have one backend owner.
- GPS storage expectations are explicit.
- REST/socket deployed configuration is not ambiguous.
- Admin session handling is safer.
- Public tracker is easier to modify without regressions.

Mentor note: Phase 2 is where rework is prevented. The point is not architectural elegance for its own sake; it is to keep Phase 3 features from duplicating incompatible definitions of "current", "stale", "active", and "trusted."

### Phase 3 - Feature Completion

Entry criteria:

- Secure trip/GPS contracts are stable.
- Basic trip history, stale state, and route-stop workflow exist.

Tasks:

- T19 Build Minimal Driver/Mobile Workflow.
- T20 Add Feedback Workflow.
- T21 Add Active Trips Monitor And Operations Dashboard Exceptions.
- T22 Improve Public No-Data, Route Labels, ETA Confidence, And Tour Anchors.
- T23 Improve Admin CRUD Feedback And Client Validation.

Exit criteria:

- Real operations have a supported sender/driver workflow.
- Riders can report issues if feedback is in MVP scope.
- Admin dashboard highlights attention-needed states.
- Public tracker communicates no-data and ETA uncertainty clearly.
- Admin forms handle errors without browser-alert-only UX.

### Phase 4 - Hardening & Scale

Entry criteria:

- The production pilot path exists.
- Core security and data integrity blockers are resolved.

Tasks:

- T24 Add Structured Redacted Logging.
- T25 Add Minimal Automated Tests And Release Gates.
- Add deeper monitoring/alerts after T8/T9/T21.
- Add playback/spatial indexes from T14 when actual query patterns exist.

Exit criteria:

- CI gates build/lint/test the critical paths.
- Logs are useful and safe for production incident diagnosis.
- Monitoring covers dependency health, GPS flow, stale vehicles, and key errors.

### Phase 5 - Future Enhancements

Entry criteria:

- User decisions exist for TTN, ESP32, history fidelity, and reporting scope.

Tasks:

- T26 Build TTN History Ingestion Adapter.
- T27 Decide And Implement ESP32 Ingestion.
- T28 Add Reports, Analytics, Announcements, Admin Roles, Audit Log, And Advanced Playback.

Exit criteria:

- Future integrations enter through normalized source-attributed observation contracts.
- Reporting and playback match documented data retention/resolution.
- Admin roles/audit logs match actual operational governance needs.

## 6. Research Queue

1. Secure defaults and secret handling.
2. JWT/session handling for admins and devices.
3. Socket.IO authentication middleware and acknowledgements.
4. Runtime request validation, DTOs, and safe API error contracts.
5. Idempotency, database transactions, conflict status code 409.
6. Partial unique indexes and race-condition prevention.
7. Ordered many-to-many relationship management.
8. Device registry, source attribution, and source priority.
9. Realtime data freshness, heartbeat monitoring, and stale status patterns.
10. Health/readiness checks and dependency probes.
11. Environment-specific deployment configuration for Vercel, Render, Neon.
12. Development server versus production server/runtime.
13. REST versus WebSocket origin configuration.
14. Client cache invalidation and localStorage cache key design.
15. Time-series retention policy and storage estimates.
16. Basic indexes, composite playback indexes, PostGIS geography/geometry, GiST indexes.
17. Domain service boundaries for trip/operations logic.
18. Custom React hooks for imperative Leaflet/Socket.IO integrations.
19. Operational dashboard information hierarchy and exception-first design.
20. Empty-state design and ETA confidence framing.
21. Controlled forms, mutation feedback, and client validation.
22. Structured logging, redaction, request correlation, and incident debugging.
23. API integration tests, Redis/Postgres test doubles, and CI/CD release gates.
24. Feedback triage workflow.
25. LoRaWAN/TTN MQTT/webhook ingestion and payload decoding.
26. ESP32 HTTP/MQTT ingestion tradeoffs.
27. Transport KPIs, reports, and analytics.

## 7. Risk Carry-Forward

### TTN/LoRaWAN Production Support

Known accepted risk if deferred: production cannot claim TTN/LoRaWAN support. The current repository has no TTN adapter, decoder, or server-side history path.

What changes it: user confirms TTN application/device IDs, payload format, decoder location, credential handling, and whether frontend direct MQTT remains a demo-only path or production path.

### ESP32 Production Support

Known accepted risk if deferred: production cannot claim ESP32 support. Protocol, payload, authentication, update frequency, and primary/fallback role are undecided.

What changes it: user chooses HTTP/MQTT/other protocol and confirms payload/security requirements.

### High-Fidelity GPS Playback

Known accepted risk if deferred: production history is sampled operational history, not detailed replay. This is acceptable only if communicated clearly.

What changes it: user requires 1-3 second historical playback, triggering retention, partitioning, playback index, and storage policy work.

### Full Analytics, Admin Roles, Audit Log, Announcements

Known accepted risk if deferred: production pilot has limited management and reporting maturity.

What changes it: release scope expands from trustworthy tracking operations to management reporting/governance.

## 8. Recommended Level 2/3 Agent Usage

Use Level 2 Specialized Agents before implementation for:

- T1 and T17: JWT/Auth Agent.
- T2, T13, T26, T27: Device Registry / Multi-Source / IoT Agents.
- T6, T7, T8, T25: Deployment/DevOps/CI Agent.
- T12: Security/Rate-Limiting Agent.
- T14: Database/Time-Series Agent.
- T21 and T22: UX/Dashboard Agent if a design pass is desired before code.

Go directly to Level 3 Refactoring Agents for:

- T3 Trip idempotency and transaction.
- T4 validation once the validation approach is chosen.
- T5 unsafe default cleanup.
- T8 health/readiness endpoints if deployment target is already clear.
- T10 route-stop UI and cache invalidation.
- T11 trip history list.
- T16 socket env alignment.
- T20 feedback workflow.
- T23 admin CRUD feedback.
- T24 structured logging.

User Decision Required before implementation for:

- Whether Phase 1 production pilot is single authenticated mobile source or multi-source.
- GPS history resolution and retention window.
- TTN production scope and frontend MQTT credential approach.
- ESP32 protocol and hardware/payload assumptions.
- Final deployment target if it differs from Vercel/Render/Neon.

