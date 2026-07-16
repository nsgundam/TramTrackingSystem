# Security, DevOps & Observability Audit: Tram Tracking System

Last re-audited: 2026-07-15.

## 1. Executive Summary

Assessment: **security and operability improved, but still not production-ready for real vehicles or public operation**.

The latest code adds several important operational foundations that were missing in the previous audit: backend `/health` and `/ready` endpoints, a `TrackingSource` model, admin device/source API, HTTP and TTN ingestion routes, source priority/freshness selection, canonical current vehicle location caching, and source-attributed GPS history (`shuttle-tracking-backend/src/server.ts:56-89`, `shuttle-tracking-backend/src/routes/ingest.route.ts:10-142`, `shuttle-tracking-backend/src/services/tracking.service.ts:28-245`, `shuttle-tracking-backend/prisma/schema.prisma:131-173`).

The biggest remaining security issue is that the ingestion boundary is only partially protected. HTTP ingestion authenticates a source only when that source has `secretHash`; sources without a secret can submit data (`shuttle-tracking-backend/src/services/tracking.service.ts:52-61`). TTN webhook authentication is optional when `TTN_WEBHOOK_SECRET` is not configured (`shuttle-tracking-backend/src/routes/ingest.route.ts:69-76`). Socket.IO `send-location` still accepts unauthenticated socket events and falls back from `sourceId` to `vehicleId` for legacy clients (`shuttle-tracking-backend/src/server.ts:97-121`). Trip start/end routes are still public (`shuttle-tracking-backend/src/server.ts:63-66`, `shuttle-tracking-backend/src/routes/trips.route.ts:6-8`).

DevOps remains mostly local-development oriented. Docker still runs backend with `nodemon` and frontend with `next dev`, Compose sets `NODE_ENV=development`, and source volumes are mounted into containers (`docker-compose.yml:51-66`, `docker-compose.yml:82-96`, `shuttle-tracking-backend/Dockerfile:25-28`, `shuttle-tracking-web/Dockerfile:16-18`). No CI/CD config was found, backend `npm test` remains a failing placeholder, and frontend has no test script (`shuttle-tracking-backend/package.json:6-10`, `shuttle-tracking-web/package.json:5-10`).

Observability is better because `/health`, `/ready`, `lastSeenAt`, Redis current-location state, and source-selection analytics now exist. It is still not enough for production operations: logs are console-based, no structured logging or error tracking is present, stale/offline source state is logged but not surfaced as an alert or durable admin-facing status, and there is no uptime/metrics configuration.

## 2. Required Input Status

All required prior audit inputs were found:

- `docs/project-knowledge-base.md`
- `docs/audits/product-audit.md`
- `docs/audits/architecture-audit.md`
- `docs/audits/backend-audit.md`
- `docs/audits/database-audit.md`
- `docs/audits/infrastructure-device-audit.md`

Note: some prior audit documents are now partially stale against the current source. For example, the current Prisma schema includes `TrackingSource`, while older Database Audit sections still describe device/source identity as absent. This report uses current source code/configuration as the deciding evidence where prior docs conflict.

## 3. Security Review

### Authentication and Authorization

Admin authentication is still basic but functional. Login compares bcrypt against `passwordHash`, signs a JWT containing `userId` and `username`, and returns only `id` and `username` in the response (`shuttle-tracking-backend/src/controllers/auth.controller.ts:19-35`). Admin routes for vehicles, routes, stops, route-stops, and devices are protected with `authenticateToken` (`shuttle-tracking-backend/src/server.ts:56-61`). The middleware verifies Bearer tokens using `JWT_SECRET` (`shuttle-tracking-backend/src/middleware/auth.ts:4-26`).

Authorization remains all-or-nothing. The `User` model has no role, status, or permissions (`shuttle-tracking-backend/prisma/schema.prisma:16-23`). Device management is protected as an admin route, but any valid admin token can manage all devices/sources.

Admin session handling still stores the JWT in a JavaScript-readable `admin_token` cookie without visible `httpOnly`, `secure`, or `sameSite` settings (`shuttle-tracking-web/contexts/AuthContext.tsx:46-72`). The frontend reads that cookie and attaches the token as an Authorization header (`shuttle-tracking-web/services/api.ts:11-17`).

Vehicle login remains weak. `POST /api/auth/vehicle-login` only verifies that a vehicle exists and returns the full vehicle object; it issues no session/token (`shuttle-tracking-backend/src/controllers/auth.controller.ts:68-88`). The new source registry is a better device identity model, but the legacy vehicle/trip flow has not been retired.

### Device and Ingestion Security

The new `TrackingSource` model is a major improvement. It stores source type, assigned vehicle, priority, status, optional `secretHash`, and `lastSeenAt` (`shuttle-tracking-backend/prisma/schema.prisma:155-173`). HTTP ingestion accepts a token from request body or Bearer header and sends it to `processObservation` (`shuttle-tracking-backend/src/routes/ingest.route.ts:10-35`). `processObservation` checks the source exists and is active, then validates a bcrypt secret only when `source.type !== 'lorawan' && source.secretHash` (`shuttle-tracking-backend/src/services/tracking.service.ts:42-61`).

The security gap is the optional nature of credentials. A non-LoRaWAN source with no `secretHash` is accepted without a token. LoRaWAN sources skip per-source token validation entirely and rely on the TTN route; that route enforces Authorization only when `TTN_WEBHOOK_SECRET` is configured (`shuttle-tracking-backend/src/routes/ingest.route.ts:69-76`). This is fine for local dev only, but unsafe if defaults reach deployment.

Socket.IO still has no connection authentication. `send-location` accepts raw payloads, maps `sourceId` or legacy `vehicleId`, and passes an optional token into the pipeline (`shuttle-tracking-backend/src/server.ts:101-112`). It now emits `error-response` on rejection, which is an improvement, but it does not authenticate the socket itself (`shuttle-tracking-backend/src/server.ts:117-120`).

Trip start/end remain unauthenticated. `/api/trips/start` and `/api/trips/:id/end` are mounted under open `/api/trips` and the route file does not apply middleware (`shuttle-tracking-backend/src/server.ts:63-66`, `shuttle-tracking-backend/src/routes/trips.route.ts:6-8`).

### Input Handling and Injection Risk

GPS coordinate validation improved. `processObservation` parses lat/lng and enforces approximate Thailand coordinate bounds (`shuttle-tracking-backend/src/services/tracking.service.ts:35-40`). It also rejects inactive/missing sources (`shuttle-tracking-backend/src/services/tracking.service.ts:42-50`).

Validation remains inconsistent elsewhere. Device creation validates only `id`, `name`, and `type`, while `type`, `priority`, `status`, and assignment values are otherwise accepted broadly (`shuttle-tracking-backend/src/controllers/devices.controller.ts:39-70`). Existing route/vehicle/stop controllers still accept many request body values directly. Trip start/end do not authenticate ownership or use transactions (`shuttle-tracking-backend/src/controllers/trips.controller.ts:5-82`).

Repository search found no `$queryRawUnsafe` or `$executeRawUnsafe`. Raw SQL uses Prisma tagged templates for PostGIS operations (`shuttle-tracking-backend/src/services/tracking.service.ts:225-239`), which is structurally safer than string concatenation.

### Data Protection

Admin login and `getme` avoid returning password hashes (`shuttle-tracking-backend/src/controllers/auth.controller.ts:35`, `shuttle-tracking-backend/src/controllers/auth.controller.ts:48-54`). Device list responses include `secretHash` unless Prisma omits it by default, because `getDevices` returns raw `trackingSource.findMany` results with `include: { vehicle: true }` and no field exclusion (`shuttle-tracking-backend/src/controllers/devices.controller.ts:7-13`). That means admin API clients may receive password-equivalent hashes. Hashes are not plaintext secrets, but they should still be treated as sensitive and excluded from routine API responses.

Feedback stores IP address from `x-forwarded-for` or socket remote address (`shuttle-tracking-backend/src/controllers/feedback.controller.ts:24-32`). No retention policy or privacy note was found.

CORS remains allowlist-based for `FRONTEND_URL`, localhost, and 127.0.0.1, with credentials enabled (`shuttle-tracking-backend/src/server.ts:30-49`). Production origins must be configured explicitly.

### Secrets and Configuration

Actual `.env` files are ignored by repository gitignore rules, and env examples are committed. However, backend `.env.example` still contains concrete dev secrets: `JWT_SECRET=TrackingJWTSecretKey` and `TTN_WEBHOOK_SECRET=LoRawanSecret` (`shuttle-tracking-backend/.env.example:12-19`). Compose defaults to the same JWT secret if one is not supplied (`docker-compose.yml:54-57`). The seed script creates default admin users using `admin123`, and the Docker entrypoint runs seed on startup (`shuttle-tracking-backend/prisma/seed.ts:19-27`, `shuttle-tracking-backend/docker-entrypoint.sh:4-11`).

Redis still logs the full `REDIS_URL` on connect (`shuttle-tracking-backend/src/config/redis.ts:11-12`). If production Redis URLs include credentials, that can leak secrets into logs.

### Dependency Hygiene

Both backend and frontend use lockfiles, and Dockerfiles install with `npm ci` (`shuttle-tracking-backend/Dockerfile:8-9`, `shuttle-tracking-web/Dockerfile:8-9`). Many dependency version ranges in `package.json` still use `^`, though lockfiles reduce install drift (`shuttle-tracking-backend/package.json:21-44`, `shuttle-tracking-web/package.json:11-36`). No live vulnerability database scan was performed; add it as a follow-up CI action.

## 4. DevOps Review

Backend build/start scripts exist (`build`, `start`), but the container path remains development-oriented (`shuttle-tracking-backend/package.json:8-10`, `shuttle-tracking-backend/Dockerfile:25-28`). Frontend has build/start/lint, but the Dockerfile runs `next dev` (`shuttle-tracking-web/package.json:5-10`, `shuttle-tracking-web/Dockerfile:16-18`).

No CI/CD configuration was found. There is no `.github/workflows/`, no `render.yaml`, and no `vercel.json`. Backend `npm test` is still a placeholder that exits 1, and frontend has no test command (`shuttle-tracking-backend/package.json:6-8`, `shuttle-tracking-web/package.json:5-10`).

The new `shuttle-tracking-backend/test_pipeline.js` is useful as a manual integration smoke test, but it is not wired into `package.json`, it depends on a running local server/database, and it uses seeded credentials and fixed source secrets (`shuttle-tracking-backend/test_pipeline.js:7-24`, `shuttle-tracking-backend/test_pipeline.js:37-107`). Treat it as a dev diagnostic, not a deployment gate yet.

Production rollback strategy, migration runbook, provider-specific deployment docs, and production Docker targets are Not Found.

## 5. Observability Review

Improvements:

- `/health` returns process liveness (`shuttle-tracking-backend/src/server.ts:68-71`).
- `/ready` checks PostgreSQL and Redis (`shuttle-tracking-backend/src/server.ts:73-89`).
- `lastSeenAt` is updated for sources with a Redis throttle (`shuttle-tracking-backend/src/services/tracking.service.ts:78-87`).
- Canonical vehicle location is cached in Redis (`shuttle-tracking-backend/src/services/tracking.service.ts:151-155`).
- Source-selection analytics increment Redis counters (`shuttle-tracking-backend/src/services/tracking.service.ts:154-155`) and admin analytics are exposed (`shuttle-tracking-backend/src/controllers/devices.controller.ts:136-157`).

Remaining gaps:

- Logging is still console-based, not structured (`shuttle-tracking-backend/src/server.ts:99-148`, `shuttle-tracking-backend/src/services/tracking.service.ts:128-243`).
- No request IDs, route latency logs, ingestion counters, or metrics endpoint were found.
- Stale/offline source state is currently a warning and `null` result, not an admin-visible alert or durable status transition (`shuttle-tracking-backend/src/services/tracking.service.ts:127-129`).
- Frontend error tracking is Not Implemented; admin `LiveMap` still logs every location update to console (`shuttle-tracking-web/components/admin/LiveMap.tsx:31-33`).
- No alerting, uptime monitoring, or production log destination is evidenced in the repository.

## 6. Recommendations

### Recommendation 1: Enforce credentials for every ingestion source and webhook

### Problem

HTTP source authentication is optional when `secretHash` is null, and TTN webhook authentication is optional when `TTN_WEBHOOK_SECRET` is absent.

### Impact

Misconfigured devices or deployment envs can create unauthenticated location write paths. A spoofed source can move vehicles on the public/admin map and write sampled GPS history.

### Recommendation

Require `secretHash` for all non-public ingestion sources before allowing `status='active'`. Fail startup or reject TTN ingestion in non-development environments when `TTN_WEBHOOK_SECRET` is missing. Consider requiring LoRaWAN source IDs to be allowlisted and paired with webhook-level authentication.

### Why

`processObservation` authenticates only when `source.secretHash` exists, and TTN webhook auth is conditional (`shuttle-tracking-backend/src/services/tracking.service.ts:52-61`, `shuttle-tracking-backend/src/routes/ingest.route.ts:69-76`).

### Priority

Critical

### Difficulty

Easy

### Learning Topic

Device secrets, webhook authentication, secure defaults.

### Related Files

`shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/routes/ingest.route.ts`, `shuttle-tracking-backend/src/controllers/devices.controller.ts`, `shuttle-tracking-backend/.env.example`

### Recommendation 2: Authenticate or retire legacy trip and Socket.IO sender flows

### Problem

Trip start/end routes are open, vehicle login issues no token, and Socket.IO accepts unauthenticated `send-location` events.

### Impact

Any reachable client can attempt to start/end trips or submit location events for known source/vehicle IDs. The new source registry reduces some spoofing risk, but the old operational entry points remain exposed.

### Recommendation

Require source/device tokens for Socket.IO handshake or `send-location`, remove fallback from `vehicleId` to `sourceId` once simulator is migrated, and require authenticated device/admin context for trip start/end. If auto-trip creation is the new path, deprecate public trip start/end for devices.

### Why

Open routes and unauthenticated Socket.IO remain in current code (`shuttle-tracking-backend/src/server.ts:63-66`, `shuttle-tracking-backend/src/server.ts:97-121`, `shuttle-tracking-backend/src/routes/trips.route.ts:6-8`, `shuttle-tracking-backend/src/controllers/auth.controller.ts:68-88`).

### Priority

Critical

### Difficulty

Medium

### Learning Topic

Socket.IO auth middleware, device sessions, legacy API deprecation.

### Related Files

`shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/routes/trips.route.ts`, `shuttle-tracking-backend/src/controllers/auth.controller.ts`, `shuttle-tracking-web/simulate.js`

### Recommendation 3: Exclude `secretHash` from device API responses

### Problem

Device APIs return raw tracking source records without explicitly excluding `secretHash`.

### Impact

Admin clients and logs may receive password-equivalent hashes. If copied, logged, or leaked, hashes can become offline attack material.

### Recommendation

Use Prisma `select` to return only safe fields. Do not return `secretHash` from list, detail, create, or update responses. Add a dedicated secret rotation endpoint that only accepts a new secret and never returns it.

### Why

`getDevices`, `getDeviceById`, `createDevice`, and `updateDevice` return Prisma tracking source records directly (`shuttle-tracking-backend/src/controllers/devices.controller.ts:7-13`, `shuttle-tracking-backend/src/controllers/devices.controller.ts:20-32`, `shuttle-tracking-backend/src/controllers/devices.controller.ts:60-72`, `shuttle-tracking-backend/src/controllers/devices.controller.ts:102-107`).

### Priority

High

### Difficulty

Easy

### Learning Topic

Sensitive field redaction and API response shaping.

### Related Files

`shuttle-tracking-backend/src/controllers/devices.controller.ts`

### Recommendation 4: Move admin auth to safer session storage

### Problem

Admin JWT is stored in a JavaScript-readable cookie and copied into Authorization headers.

### Impact

An XSS bug could steal admin tokens. Since authorization is all-or-nothing, stolen tokens have broad admin impact.

### Recommendation

Prefer backend-set `HttpOnly`, `Secure`, `SameSite` cookies or a backend-for-frontend session. If keeping current storage temporarily, set cookie security options for production, shorten expiry, and add refresh/session invalidation behavior.

### Why

The frontend reads and writes `admin_token` directly from JavaScript (`shuttle-tracking-web/contexts/AuthContext.tsx:46-72`, `shuttle-tracking-web/services/api.ts:11-17`).

### Priority

High

### Difficulty

Medium

### Learning Topic

Browser token storage, XSS, `HttpOnly` cookies, CSRF tradeoffs.

### Related Files

`shuttle-tracking-web/contexts/AuthContext.tsx`, `shuttle-tracking-web/services/api.ts`, `shuttle-tracking-backend/src/controllers/auth.controller.ts`

### Recommendation 5: Replace dev secrets and seeded credentials with safe production bootstrapping

### Problem

Env examples and Compose still include concrete secret-like defaults, and seed creates default admin users with `admin123`.

### Impact

If defaults reach deployed environments, attackers may know admin credentials or JWT/webhook secrets from the repository.

### Recommendation

Use unmistakable placeholders in examples, fail production startup if default values are detected, make seed dev-only, and provision initial admins through a one-time secure setup step.

### Why

`JWT_SECRET=TrackingJWTSecretKey`, `TTN_WEBHOOK_SECRET=LoRawanSecret`, Compose JWT default, and seed password `admin123` are present (`shuttle-tracking-backend/.env.example:12-19`, `docker-compose.yml:54-57`, `shuttle-tracking-backend/prisma/seed.ts:19-27`).

### Priority

Critical

### Difficulty

Easy

### Learning Topic

Secure defaults, environment management, first-admin provisioning.

### Related Files

`shuttle-tracking-backend/.env.example`, `docker-compose.yml`, `shuttle-tracking-backend/prisma/seed.ts`, `shuttle-tracking-backend/docker-entrypoint.sh`

### Recommendation 6: Add rate limiting and abuse controls

### Problem

No rate limiting was found for login, feedback, trip start/end, HTTP ingestion, TTN ingestion, or Socket.IO location events.

### Impact

The system is vulnerable to brute force, feedback spam, ingestion flooding, and noisy realtime traffic that can degrade Redis/DB/backend reliability.

### Recommendation

Add IP-based and source-based rate limits. For GPS ingestion, rate by authenticated `sourceId` and reject impossible frequencies. For admin login, add conservative brute-force protection. For public feedback, add IP throttling.

### Why

Route mounting and source search show no rate-limit middleware or dependency (`shuttle-tracking-backend/src/server.ts:50-66`, `shuttle-tracking-backend/package.json:21-44`).

### Priority

High

### Difficulty

Medium

### Learning Topic

Rate limiting, brute-force protection, realtime ingestion backpressure.

### Related Files

`shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/routes/ingest.route.ts`, `shuttle-tracking-backend/src/routes/auth.route.ts`, `shuttle-tracking-backend/src/routes/public.route.ts`

### Recommendation 7: Make validation centralized and strict

### Problem

Validation improved for GPS coordinates but remains ad hoc across devices, admin CRUD, trips, and optional numeric fields.

### Impact

Invalid source types, statuses, priorities, speeds, bearings, route/vehicle IDs, or unexpected fields can enter the system or produce inconsistent state.

### Recommendation

Add request schemas for auth, devices, ingest, trips, vehicles, routes, stops, and feedback. Validate enum-like fields, numeric ranges, UUID/string formats, assignment existence, and unknown fields before Prisma writes.

### Why

Device create/update accepts broad values, trip flow is still minimal, and GPS only validates coordinates strictly (`shuttle-tracking-backend/src/controllers/devices.controller.ts:39-107`, `shuttle-tracking-backend/src/controllers/trips.controller.ts:5-82`, `shuttle-tracking-backend/src/services/tracking.service.ts:35-40`).

### Priority

High

### Difficulty

Medium

### Learning Topic

Runtime schema validation and API contracts.

### Related Files

`shuttle-tracking-backend/src/controllers/*`, `shuttle-tracking-backend/src/routes/ingest.route.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`

### Recommendation 8: Add CI/CD with build, lint, migration, and smoke-test gates

### Problem

No CI/CD config was found, backend tests are not wired, and Docker images are dev-oriented.

### Impact

Build failures, migration errors, auth regressions, or ingestion pipeline regressions can reach deployment unnoticed.

### Recommendation

Add a CI workflow that installs with lockfiles, runs backend build, frontend lint/build, a test suite, and migration checks. Convert `test_pipeline.js` into a scripted smoke/integration test or replace it with framework-backed tests. Add deployment docs/config for Vercel/Render/Neon or the final hosting target.

### Why

No workflow/provider config was found; backend `npm test` exits with error, and `test_pipeline.js` is manual (`shuttle-tracking-backend/package.json:6-10`, `shuttle-tracking-backend/test_pipeline.js:13-179`).

### Priority

High

### Difficulty

Medium

### Learning Topic

CI/CD, automated smoke tests, migration checks, deployment gates.

### Related Files

`shuttle-tracking-backend/package.json`, `shuttle-tracking-web/package.json`, `shuttle-tracking-backend/test_pipeline.js`, `.github/workflows`

### Recommendation 9: Add production runtime configuration

### Problem

Dockerfiles and Compose run development servers and local service URLs.

### Impact

Deployments may run with dev behavior, wrong URLs, wrong CORS/Socket.IO origins, or non-repeatable startup commands.

### Recommendation

Add production Docker targets or provider-native build/start commands. Use `npm run build` and `npm start` for backend, optimized Next.js production builds for frontend, provider-managed env vars, and explicit migration deployment steps.

### Why

Backend Docker runs `nodemon`, frontend Docker runs `next dev`, and Compose sets local URLs (`shuttle-tracking-backend/Dockerfile:25-28`, `shuttle-tracking-web/Dockerfile:16-18`, `docker-compose.yml:51-96`).

### Priority

High

### Difficulty

Medium

### Learning Topic

Production Node/Next.js deployment, Docker multi-stage builds, environment promotion.

### Related Files

`shuttle-tracking-backend/Dockerfile`, `shuttle-tracking-web/Dockerfile`, `docker-compose.yml`, `shuttle-tracking-backend/package.json`, `shuttle-tracking-web/package.json`

### Recommendation 10: Turn source freshness into operator-visible observability

### Problem

The pipeline detects stale/offline sources but only logs a warning and returns `null`.

### Impact

Operators may not know a vehicle/device went silent, and public users may simply stop receiving updates with no visible operational state.

### Recommendation

Create explicit stale/offline source and vehicle states. Surface them in admin APIs/UI, emit a realtime status event, and alert when sources or dependencies go unhealthy. Keep `/ready`, but add metrics for observations accepted/rejected, stale sources, selected source type, Redis/DB errors, and broadcast counts.

### Why

`evaluateCanonicalLocation` logs stale/offline state but does not persist or broadcast it (`shuttle-tracking-backend/src/services/tracking.service.ts:127-129`). Admin analytics expose selection counts, not health/alert status (`shuttle-tracking-backend/src/controllers/devices.controller.ts:136-157`).

### Priority

High

### Difficulty

Medium

### Learning Topic

Health monitoring, stale data detection, metrics, alerting.

### Related Files

`shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/controllers/devices.controller.ts`, `shuttle-tracking-web/components/admin/LiveMap.tsx`

### Recommendation 11: Move from console logs to structured, redacted logging

### Problem

Logging is console-based and not consistently redacted or correlated.

### Impact

Production incidents will be harder to diagnose, and sensitive connection data may leak if full URLs or errors include credentials.

### Recommendation

Use structured logs with levels, request IDs, event names, safe source/vehicle identifiers, latency, and redaction for tokens, secrets, and URLs. Remove high-volume frontend live-location console logs outside development.

### Why

Server, services, controllers, and frontend live map use `console.*`; Redis logs the full `REDIS_URL` (`shuttle-tracking-backend/src/server.ts:99-148`, `shuttle-tracking-backend/src/config/redis.ts:11-12`, `shuttle-tracking-web/components/admin/LiveMap.tsx:31-33`).

### Priority

Medium

### Difficulty

Easy

### Learning Topic

Structured logging, log redaction, request correlation.

### Related Files

`shuttle-tracking-backend/src/config/redis.ts`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-web/components/admin/LiveMap.tsx`

### Recommendation 12: Add frontend and backend error tracking

### Problem

Errors are surfaced mostly through console/stdout. No frontend or backend error tracking integration was found.

### Impact

Client-side failures, API exceptions, and ingestion errors may go unnoticed until a user reports them.

### Recommendation

Add lightweight error reporting with environment tagging and release versioning. Start by capturing frontend runtime errors, backend unhandled exceptions, and ingestion rejection/error rates.

### Why

Search found no error tracking tooling; frontend and backend code rely on `console.error` (`shuttle-tracking-web/contexts/AuthContext.tsx:61`, `shuttle-tracking-backend/src/routes/ingest.route.ts:51-59`, `shuttle-tracking-backend/src/server.ts:147-149`).

### Priority

Medium

### Difficulty

Medium

### Learning Topic

Error tracking, release tagging, incident triage.

### Related Files

`shuttle-tracking-web/app`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/routes/ingest.route.ts`

## 7. Suggested Learning Order

1. Secure defaults and secret management.
2. Device/source authentication and Socket.IO auth middleware.
3. Runtime request validation.
4. Safe API response shaping and sensitive-field redaction.
5. Health/readiness, structured logging, and metrics.
6. CI/CD with build, lint, migration, and smoke-test gates.
7. Stale/offline vehicle monitoring and alerting.
8. Dependency vulnerability scanning and release policy.
