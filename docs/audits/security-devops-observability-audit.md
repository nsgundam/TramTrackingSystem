# Security, DevOps & Observability Audit: Tram Tracking System

## 1. Executive Summary

Assessment: **MVP-development usable, not ready for real vehicles or real users without security and operational hardening**.

The admin path has a basic JWT implementation: login compares a bcrypt password hash and signs a JWT with a 1-day expiry (`shuttle-tracking-backend/src/controllers/auth.controller.ts:19-35`), admin CRUD routes are mounted behind `authenticateToken` (`shuttle-tracking-backend/src/server.ts:53-57`), and the middleware verifies Bearer tokens with `JWT_SECRET` (`shuttle-tracking-backend/src/middleware/auth.ts:4-26`). That is a reasonable MVP base.

The highest-risk gap is that the vehicle/trip/GPS sender path is effectively unauthenticated. Vehicle login only confirms that a `vehicleId` exists and returns the vehicle record (`shuttle-tracking-backend/src/controllers/auth.controller.ts:68-88`), trip routes are mounted without auth (`shuttle-tracking-backend/src/server.ts:62`, `shuttle-tracking-backend/src/routes/trips.route.ts:6-8`), and Socket.IO accepts `send-location` from any connected client (`shuttle-tracking-backend/src/server.ts:68-75`). This aligns with the Backend Audit's critical finding that trip and GPS sender identity is too weak (`docs/audits/backend-audit.md:57-59`).

DevOps readiness is local/dev only. Docker Compose runs backend with `nodemon`, frontend with `next dev`, source volumes are mounted into containers, and backend `NODE_ENV` is `development` (`docker-compose.yml:51-66`, `docker-compose.yml:82-96`, `shuttle-tracking-backend/Dockerfile:25-28`, `shuttle-tracking-web/Dockerfile:16-18`). There is no `.github/workflows/` directory or other CI config found in the repository, and backend `npm test` is a placeholder that exits with failure (`shuttle-tracking-backend/package.json:6-8`).

Observability is minimal. The system logs to `console`, has DB/Redis Compose health checks, but no backend `/health` or `/ready` route, no metrics, no alerting, no structured logs, and no frontend/backend error tracking found. For an operational real-time tracking system, this means operators cannot reliably know whether vehicles are stale, Redis/DB is degraded, or client-side failures are affecting riders.

## 2. Required Input Status

All required prior audit inputs were found:

- `docs/project-knowledge-base.md`
- `docs/audits/product-audit.md`
- `docs/audits/architecture-audit.md`
- `docs/audits/backend-audit.md`
- `docs/audits/database-audit.md`
- `docs/audits/infrastructure-device-audit.md`

No reduced-context stop was required.

## 3. Security Review

### Authentication and Authorization

Admin auth is implemented but broad. Successful admin login signs a JWT containing `userId` and `username` with a hardcoded 1-day expiry in code (`shuttle-tracking-backend/src/controllers/auth.controller.ts:29-33`). The backend env example and Compose mention `JWT_EXPIRES_IN`, but the controller does not use it (`shuttle-tracking-backend/.env.example:12-14`, `docker-compose.yml:56-57`). There is no role or permission model in the `User` schema, only `username` and `passwordHash` (`shuttle-tracking-backend/prisma/schema.prisma:16-23`), so authorization is all-or-nothing admin access.

Frontend stores the admin JWT in a cookie named `admin_token` using `cookies-next` without visible `httpOnly`, `secure`, or `sameSite` settings (`shuttle-tracking-web/contexts/AuthContext.tsx:68-72`). The frontend then reads that cookie from JavaScript and attaches it as a Bearer token (`shuttle-tracking-web/services/api.ts:11-17`). This is functional but increases token theft impact if XSS is introduced later.

Vehicle/device authentication is not implemented. `POST /api/auth/vehicle-login` verifies existence only and issues no token (`shuttle-tracking-backend/src/controllers/auth.controller.ts:68-88`). `POST /api/trips/start`, `PUT /api/trips/:id/end`, and Socket.IO `send-location` have no sender authentication (`shuttle-tracking-backend/src/routes/trips.route.ts:6-8`, `shuttle-tracking-backend/src/server.ts:72-75`).

### Input Handling and Injection Risk

Validation is inconsistent. Feedback validates non-empty strings for `type`, `vehicleId`, and `message` (`shuttle-tracking-backend/src/controllers/feedback.controller.ts:6-22`), but admin vehicle and route create/update paths pass request body fields directly into Prisma with little validation (`shuttle-tracking-backend/src/controllers/vehicles.controller.ts:40-68`, `shuttle-tracking-backend/src/controllers/route.controller.ts:37-65`). Stop creation checks required fields but uses `!lat || !lng`, which rejects valid zero values and does not validate coordinate ranges (`shuttle-tracking-backend/src/controllers/stops.controller.ts:55-64`). GPS ingestion only checks presence of `tripId`, `vehicleId`, `lat`, and `lng`, then parses coordinates without rejecting `NaN` or out-of-range values (`shuttle-tracking-backend/src/services/tracking.service.ts:8-39`).

Prisma is used for most database access, and raw SQL uses tagged `$queryRaw` / `$executeRaw` with interpolated parameters rather than unsafe raw string methods in the inspected source (`shuttle-tracking-backend/src/controllers/stops.controller.ts:30-40`, `shuttle-tracking-backend/src/controllers/public.controller.ts:103-116`, `shuttle-tracking-backend/src/services/tracking.service.ts:28-39`). Repository search found no `$queryRawUnsafe` or `$executeRawUnsafe`.

### Data Protection

Admin login response returns only user `id` and `username`, not `passwordHash` (`shuttle-tracking-backend/src/controllers/auth.controller.ts:35`). `getme` also selects only `id` and `username` (`shuttle-tracking-backend/src/controllers/auth.controller.ts:48-54`).

Vehicle login returns the full vehicle object (`shuttle-tracking-backend/src/controllers/auth.controller.ts:84-88`). That currently appears to be operational metadata rather than secrets, but the endpoint is public and should be treated carefully if vehicle records gain sensitive fields later.

Feedback stores IP address from `x-forwarded-for` or socket remote address (`shuttle-tracking-backend/src/controllers/feedback.controller.ts:24-32`, `shuttle-tracking-backend/src/services/feedback.service.ts:30-36`). This is PII-adjacent operational data. No retention policy, admin review controls, or privacy notes were found.

CORS is allowlist-based and permits `FRONTEND_URL`, localhost, and 127.0.0.1, with credentials enabled (`shuttle-tracking-backend/src/server.ts:27-47`). That is a good start, but deployment will require production origins to be configured explicitly.

### Secrets and Configuration

Tracked `.env.example` files exist, and actual `.env` files are ignored by `.gitignore` (`.gitignore:38-51`, `shuttle-tracking-backend/.gitignore:34-35`, `shuttle-tracking-web/.gitignore:33-34`). `git ls-files` showed only `env.example` among env files.

However, the backend `.env.example` uses concrete local values, including `JWT_SECRET=TrackingJWTSecretKey` (`shuttle-tracking-backend/.env.example:12-14`), and Compose defaults to the same JWT secret if no env is provided (`docker-compose.yml:54-57`). The seed script creates default admin users `admin` and `transport` with password `admin123` (`shuttle-tracking-backend/prisma/seed.ts:19-27`), and the backend entrypoint runs seed on every container startup, ignoring duplicate failures (`shuttle-tracking-backend/docker-entrypoint.sh:4-11`). These are acceptable dev conveniences but unsafe production defaults.

Redis logs the full `REDIS_URL` on connect (`shuttle-tracking-backend/src/config/redis.ts:11-12`). If production Redis URLs contain credentials, this can leak secrets to logs.

### Dependency Hygiene

Both backend and frontend have `package-lock.json`, which supports reproducible installs. Dockerfiles use `npm ci` (`shuttle-tracking-backend/Dockerfile:8-9`, `shuttle-tracking-web/Dockerfile:8-9`).

Most backend dependency versions use caret ranges in `package.json` (`shuttle-tracking-backend/package.json:21-44`), while the frontend pins core framework packages such as `next`, `react`, and `react-dom` exactly but uses caret ranges for many others (`shuttle-tracking-web/package.json:11-36`). No live vulnerability database lookup was performed because it is out of scope for this audit. A CI `npm audit` or equivalent dependency review should be added later.

## 4. DevOps Review

The backend has build and start scripts (`npm run build`, `npm start`) (`shuttle-tracking-backend/package.json:8-10`), and the frontend has build/start/lint scripts (`shuttle-tracking-web/package.json:6-9`). But the Dockerfiles and Compose file are development oriented: backend runs `npx nodemon`, frontend runs `npx next dev`, and source volumes override container contents (`shuttle-tracking-backend/Dockerfile:25-28`, `shuttle-tracking-web/Dockerfile:16-18`, `docker-compose.yml:62-66`, `docker-compose.yml:86-96`).

No CI/CD configuration was found. There is no `.github/workflows/`, no `render.yaml`, and no `vercel.json` in the repository. Backend tests are not implemented, and frontend has no test script (`shuttle-tracking-backend/package.json:6-8`, `shuttle-tracking-web/package.json:5-10`). Rollback strategy is Not Found.

Docker image hygiene is partially addressed by `.dockerignore` files that exclude `node_modules`, env files, `.git`, logs, and build output (`shuttle-tracking-backend/.dockerignore:1-10`, `shuttle-tracking-web/.dockerignore:1-11`). Production image optimization is Not Implemented: there are no multi-stage builds, no non-root runtime user, and no production-specific Docker targets.

## 5. Observability Review

Logging is console-based. The backend logs server startup, Socket.IO connections/disconnections, DB save events, cache invalidation, Redis errors, and controller errors (`shuttle-tracking-backend/src/server.ts:70-102`, `shuttle-tracking-backend/src/services/tracking.service.ts:40-49`, `shuttle-tracking-backend/src/services/cache.service.ts:23-26`). Frontend admin live map logs every received location update (`shuttle-tracking-web/components/admin/LiveMap.tsx:31-33`).

These logs are useful during development but not enough for production incident diagnosis. There are no request IDs, structured fields, severity levels, latency logs, route-level access logs, or safe redaction policy found.

Health checks exist only for Compose database and Redis services (`docker-compose.yml:19-23`, `docker-compose.yml:36-40`). Backend health/readiness endpoints are Not Found. Metrics, uptime monitoring, alerting, stale vehicle detection, Redis/DB connection alerts, and frontend error reporting are Not Implemented.

The system currently cannot tell an operator that a vehicle GPS device has gone silent. Socket disconnect only logs the socket ID (`shuttle-tracking-backend/src/server.ts:77-79`), and there is no device/source health model as noted by the Architecture, Backend, Database, and Infrastructure audits (`docs/audits/architecture-audit.md:7-17`, `docs/audits/backend-audit.md:61-63`, `docs/audits/database-audit.md:48-54`, `docs/audits/infrastructure-device-audit.md:41-44`).

## 6. Recommendations

### Recommendation 1: Require authenticated device or vehicle tokens for trip and GPS flows

### Problem

Vehicle login only verifies that a vehicle ID exists, trip routes are mounted without authentication, and Socket.IO accepts unauthenticated `send-location` events.

### Impact

Anyone who can reach the backend and knows or guesses a vehicle ID can spoof trips or live GPS locations. This is trivially exploitable and unsafe for real vehicles.

### Recommendation

Make vehicle/device login issue a short-lived token and require it for trip start, trip end, and Socket.IO connection or `send-location`. At MVP level, a per-vehicle or per-device secret is enough before building full provisioning. Validate that the token subject owns the `vehicleId` and `tripId` being updated.

### Why

Admin JWT already exists, but the operational sender path has no comparable trust boundary (`shuttle-tracking-backend/src/controllers/auth.controller.ts:68-88`, `shuttle-tracking-backend/src/routes/trips.route.ts:6-8`, `shuttle-tracking-backend/src/server.ts:72-75`).

### Priority

Critical

### Difficulty

Medium

### Learning Topic

Device authentication, JWT claims, and Socket.IO authentication middleware.

### Related Files

`shuttle-tracking-backend/src/controllers/auth.controller.ts`, `shuttle-tracking-backend/src/routes/trips.route.ts`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`

### Recommendation 2: Replace client-readable admin token storage with safer session handling

### Problem

The admin JWT is stored in a JavaScript-readable cookie without visible `httpOnly`, `secure`, or `sameSite` settings.

### Impact

If an XSS bug appears, the admin token can be read and replayed. Admin access is currently all-or-nothing, so stolen tokens have broad impact.

### Recommendation

Move admin session storage to an `HttpOnly`, `Secure`, `SameSite` cookie set by the backend, or add a backend-for-frontend session endpoint that keeps tokens out of JavaScript. If the current approach is kept temporarily, at least set `secure` in production, set `sameSite`, shorten expiry, and add logout/session invalidation strategy.

### Why

The frontend reads `admin_token` and attaches it to requests (`shuttle-tracking-web/contexts/AuthContext.tsx:47-72`, `shuttle-tracking-web/services/api.ts:11-17`).

### Priority

High

### Difficulty

Medium

### Learning Topic

Browser token storage, XSS risk, `HttpOnly` cookies, and CSRF tradeoffs.

### Related Files

`shuttle-tracking-web/contexts/AuthContext.tsx`, `shuttle-tracking-web/services/api.ts`, `shuttle-tracking-backend/src/controllers/auth.controller.ts`

### Recommendation 3: Add centralized request validation and normalize API error handling

### Problem

Validation is inconsistent across admin CRUD, feedback, trip lifecycle, and GPS ingestion.

### Impact

Invalid statuses, malformed coordinates, bad UUIDs, unexpected fields, or mismatched trip/vehicle IDs can enter the system or produce 500 errors instead of safe client errors.

### Recommendation

Introduce schema validation for request bodies and params, starting with auth, trips, GPS events, vehicles, routes, stops, and feedback. Reject invalid coordinate ranges, unknown statuses, unknown fields, and trip/vehicle mismatches before database writes.

### Why

Vehicle and route controllers pass request bodies directly into Prisma, stop/GPS parsing does not validate ranges, and `handleLocationData` returns raw data on validation failures (`shuttle-tracking-backend/src/controllers/vehicles.controller.ts:40-68`, `shuttle-tracking-backend/src/controllers/route.controller.ts:37-65`, `shuttle-tracking-backend/src/controllers/stops.controller.ts:55-64`, `shuttle-tracking-backend/src/services/tracking.service.ts:8-50`).

### Priority

High

### Difficulty

Medium

### Learning Topic

Runtime validation libraries, API contracts, and safe error responses.

### Related Files

`shuttle-tracking-backend/src/controllers/*`, `shuttle-tracking-backend/src/services/tracking.service.ts`

### Recommendation 4: Remove production-capable defaults for secrets and seeded admin credentials

### Problem

The backend env example and Compose use a concrete JWT secret, and the seed creates admin accounts with password `admin123`.

### Impact

If these defaults reach a test or production deployment, attackers may be able to authenticate or forge tokens once the secret/password is known from the repository.

### Recommendation

Change examples to unmistakable placeholders, fail startup in production when default values are detected, make seeding explicit for development only, and require first admin credentials to be provisioned through a secure deployment step.

### Why

`JWT_SECRET=TrackingJWTSecretKey` appears in the backend env example and Compose default, and seed uses `admin123` for two users (`shuttle-tracking-backend/.env.example:12-14`, `docker-compose.yml:54-57`, `shuttle-tracking-backend/prisma/seed.ts:19-27`).

### Priority

Critical

### Difficulty

Easy

### Learning Topic

Secret management, secure defaults, and environment-specific bootstrapping.

### Related Files

`shuttle-tracking-backend/.env.example`, `docker-compose.yml`, `shuttle-tracking-backend/prisma/seed.ts`, `shuttle-tracking-backend/docker-entrypoint.sh`

### Recommendation 5: Add production build and deployment pipeline

### Problem

Docker and Compose are development-oriented, and no CI/CD configuration was found.

### Impact

Deployments are manual and not gated by build, lint, test, migration, or smoke checks. Running dev servers in production also weakens performance and reliability.

### Recommendation

Add production commands and deployment docs for the chosen target. Minimum pipeline: install with lockfiles, backend typecheck/build, frontend lint/build, run tests when added, run Prisma migration deploy, and deploy with environment variables from the hosting provider. Add production Docker targets if containers are used.

### Why

Backend Docker runs `nodemon`, frontend Docker runs `next dev`, and no workflows/config for GitHub Actions, Render, or Vercel were found (`shuttle-tracking-backend/Dockerfile:25-28`, `shuttle-tracking-web/Dockerfile:16-18`, `docker-compose.yml:51-96`).

### Priority

High

### Difficulty

Medium

### Learning Topic

CI/CD basics, production builds, migration deployment, and release gates.

### Related Files

`shuttle-tracking-backend/package.json`, `shuttle-tracking-web/package.json`, `shuttle-tracking-backend/Dockerfile`, `shuttle-tracking-web/Dockerfile`, `docker-compose.yml`

### Recommendation 6: Add minimal automated tests before deployment gates

### Problem

Backend `npm test` is a placeholder that exits with failure, and the frontend has no test script.

### Impact

Security and operational regressions can ship unnoticed, especially around auth, trip lifecycle, validation, and public API cache behavior.

### Recommendation

Start with focused backend tests for admin login, auth middleware, vehicle/device auth once implemented, trip start/end idempotency, GPS validation, and feedback validation. Add frontend smoke tests for admin login redirect behavior and public map boot.

### Why

Backend `package.json` has `"test": "echo \"Error: no test specified\" && exit 1"`, while frontend scripts only include dev/build/start/lint (`shuttle-tracking-backend/package.json:6-10`, `shuttle-tracking-web/package.json:5-10`).

### Priority

Medium

### Difficulty

Medium

### Learning Topic

API integration tests, test doubles for Redis/Postgres, and deployment quality gates.

### Related Files

`shuttle-tracking-backend/package.json`, `shuttle-tracking-web/package.json`

### Recommendation 7: Add health/readiness endpoints and minimal operational monitoring

### Problem

No backend health/readiness endpoint, metrics, uptime monitoring, or alerting implementation was found.

### Impact

Operators cannot tell whether the backend is alive, whether DB/Redis dependencies are reachable, or whether deployments are healthy beyond container/process status.

### Recommendation

Add `/health` for process liveness and `/ready` for dependency checks against PostgreSQL and Redis. Expose basic counters or logs for API errors, Socket.IO connections, GPS events received, GPS events rejected, DB writes, and Redis failures. Configure deployment health checks to use these endpoints.

### Why

Compose checks DB and Redis directly, but backend routes only mount auth, admin, public, and trips (`docker-compose.yml:19-40`, `shuttle-tracking-backend/src/server.ts:50-62`).

### Priority

High

### Difficulty

Easy

### Learning Topic

Health checks, readiness checks, dependency probes, and service-level monitoring.

### Related Files

`shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/config/prisma.ts`, `shuttle-tracking-backend/src/config/redis.ts`, `docker-compose.yml`

### Recommendation 8: Implement stale vehicle/device observability

### Problem

The system has no device/source health, heartbeat, last-seen status, or stale GPS alerting.

### Impact

For 10+ real vehicles, the public map may silently stop updating while operators have no clear alert that a vehicle/device went offline.

### Recommendation

Track last-seen timestamps per vehicle/source, mark vehicles stale after a defined threshold, show stale/offline state in admin, and emit alerts/log events when updates stop. This can start as an in-memory/Redis current-state model and later move into the device/source schema recommended by other audits.

### Why

Socket disconnect only logs a socket ID, GPS updates are broadcast as received, and prior architecture/database/backend audits identify missing device/source identity as a critical gap (`shuttle-tracking-backend/src/server.ts:72-79`, `docs/audits/architecture-audit.md:7-17`, `docs/audits/database-audit.md:48-54`).

### Priority

High

### Difficulty

Medium

### Learning Topic

Heartbeat monitoring, stale data detection, and current-state read models.

### Related Files

`shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-web/components/admin/LiveMap.tsx`

### Recommendation 9: Move from ad hoc console logs to structured, redacted logging

### Problem

Logging is console-based and sometimes logs operational values such as Redis URLs and every live map update.

### Impact

Logs will be noisy, hard to search, and may expose credentials if production URLs contain secrets.

### Recommendation

Use structured logging with levels, timestamps, request IDs, event names, vehicle/trip IDs where safe, and redaction for URLs/tokens/passwords. Remove or gate high-volume frontend live-location logs.

### Why

Redis logs `REDIS_URL`, controllers and services use `console.error`, and admin `LiveMap` logs each received location (`shuttle-tracking-backend/src/config/redis.ts:11-12`, `shuttle-tracking-backend/src/server.ts:70-102`, `shuttle-tracking-web/components/admin/LiveMap.tsx:31-33`).

### Priority

Medium

### Difficulty

Easy

### Learning Topic

Structured logging, log redaction, request correlation, and incident debugging.

### Related Files

`shuttle-tracking-backend/src/config/redis.ts`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/controllers/*`, `shuttle-tracking-web/components/admin/LiveMap.tsx`

### Recommendation 10: Add rate limiting and abuse controls on public write endpoints and login

### Problem

No rate limiting or brute-force protection was found for admin login, vehicle login, trip start/end, Socket.IO location submission, or public feedback.

### Impact

Attackers can brute-force admin credentials, spam feedback, or flood GPS/trip endpoints. Even without credential compromise, this can degrade operations.

### Recommendation

Add IP/user/vehicle-based rate limits for auth and public write endpoints. Add Socket.IO event throttling by authenticated device identity once device auth exists. Keep limits generous enough for real GPS frequency but strict for unauthenticated failures.

### Why

Auth, public feedback, trips, and Socket.IO are mounted without any visible rate limiting middleware (`shuttle-tracking-backend/src/server.ts:47-75`, `shuttle-tracking-backend/src/routes/public.route.ts:19-20`, `shuttle-tracking-backend/src/routes/trips.route.ts:6-8`).

### Priority

High

### Difficulty

Medium

### Learning Topic

Rate limiting, brute-force protection, and abuse prevention for realtime systems.

### Related Files

`shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/routes/auth.route.ts`, `shuttle-tracking-backend/src/routes/public.route.ts`, `shuttle-tracking-backend/src/routes/trips.route.ts`

## 7. Suggested Learning Order

1. Secure defaults and secret handling.
2. JWT/session handling for admins and devices.
3. Runtime request validation.
4. Health/readiness checks and basic structured logging.
5. CI/CD with build, lint, migration, and test gates.
6. Stale vehicle/device monitoring and alerting.
7. Dependency vulnerability scanning and release policy.

