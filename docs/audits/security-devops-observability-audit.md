# Security, DevOps & Observability Audit: Tram Tracking System

Validation status: **Needs Re-audit**. This legacy report lacks complete predecessor-baseline
metadata required by the current audit contract.

Re-audited: 2026-07-22

Trigger: Refactor T4 is marked complete in `docs/roadmap/master-refactoring-roadmap.md`.

## 1. Executive Summary

Refactors T2 and T4 materially improve the application and release boundaries. Admin login, sender
login, feedback, device, route-stop, trip, HTTP ingestion, TTN ingestion, and Socket.IO observation
inputs now have shared parsing or bounded handling. Stable boundary error codes, request correlation
IDs, Redis-backed rate limits, sender revalidation, redacted Redis logging, a GitHub Actions CI gate,
and a local check script are evidenced. T4 also adds an allowlisted JSON operational-signal contract
for startup/readiness, ingestion outcomes, source staleness, canonical selection, and history
persistence failures.

No Critical security issue was identified from static repository evidence. The system is still not
ready for an unqualified public or daily operational release. The most important remaining risks
are:

- **High:** production Compose publishes PostgreSQL and Redis ports on the host, while Redis has no
  password/ACL/TLS configuration in the checked-in production definition. The actual host firewall
  and network boundary are unknown, so exposure beyond the host is not proven.
- **High:** validation, safe error mapping, and write rate limits are not applied to the existing
  admin vehicle, route, and stop write routes. T2 therefore resolves the named boundary set but not
  every write surface.
- **High:** CI checks now exist, but there is still no deployment pipeline, migration/rollback gate,
  release approval evidence, metrics backend, alert routing, or aggregated error tracking. The new
  signals are useful JSON lines, not a complete monitoring system.
- **Medium:** the documented admin JWT lifetime is not used by the admin issuer, the browser stores
  the JWT in a JavaScript-readable cookie, and the admin token has no refresh or revocation flow.

Current suitability: controlled MVP/demo with known operators and configured senders. A public or
daily-service readiness decision must wait for the High findings or an explicit risk acceptance.

## Scope, Evidence, and Re-audit Status

This is a static Security, DevOps, and Observability re-audit. It does not repeat Product,
Architecture, Backend, Database, or Infrastructure findings except where their evidence is needed
to classify a security or operational boundary.

Required context was read in order:

1. `docs/project-knowledge-base.md`
2. `docs/audits/product-audit.md`
3. `docs/audits/architecture-audit.md`
4. `docs/audits/backend-audit.md`
5. `docs/audits/database-audit.md`
6. `docs/audits/infrastructure-device-audit.md`
7. the previous version of this report
8. backend authentication, middleware, controllers, routes, and tracking service
9. Compose files, Dockerfiles, entrypoint, `.dockerignore`, and environment templates
10. CI/CD candidates
11. backend/frontend `package.json` and lockfiles

Additional evidence inspected:

- T2 implementation commits `8fcfe1f` and `b6193ae`, plus T4 commit `bd8b36d`.
- `.github/workflows/ci.yml`, `scripts/ci-checks.sh`, `docs/testing/ci-checks.md`, and
  `test_operational_signals.js`.
- `src/middleware/validation.ts`, `boundary-errors.ts`, and `rate-limit.ts`.
- T2 boundary, JWT, device-response, Redis-logging, Socket.IO, and pipeline test scripts.
- frontend `AuthContext`, proxy, API clients, and Socket.IO consumers.
- current git-tracked-file and ignored-environment checks.

Verification performed during this re-audit:

- `shuttle-tracking-backend/npm test` — passed: TypeScript build, JWT boundary tests, and T2
  validation/safe-error tests.
- `npx prisma validate` — passed.
- `shuttle-tracking-web/npm run lint` — passed with 6 warnings and 0 errors.
- `bash scripts/ci-checks.sh` — backend build, boundary/redaction tests, and Prisma validation
  passed; frontend lint passed, but the production build could not fetch Google Fonts in this
  restricted environment, so the Compose checks were not reached in this invocation.
- The roadmap records the full T4 local equivalent, including frontend build and both Compose
  configurations, as passed on 2026-07-21.
- unsafe-output search — no production device response or Redis connection log was found to emit
  the tested credential material.
- local Docker inspection — PostgreSQL and Redis were healthy; no backend container was running
  during this re-audit. The roadmap records that configured Postgres/Redis pipeline and Socket.IO
  smoke checks passed on 2026-07-20, but that runtime result was not independently rerun here.
- no deployed system, production secret, external device, or live public endpoint was accessed.

### Re-audit status against the previous Security/DevOps/Observability report

| Previous finding | Status | Current evidence |
|---|---|---|
| Sender, trip, and Socket.IO writes were weakly authenticated | **Resolved** | `auth.ts` verifies source/vehicle/version-bound sender claims; HTTP/trip routes authenticate; Socket.IO revalidates on every write; JWT boundary tests pass. |
| TTN/webhook credential boundary was optional | **Resolved** | `/api/ingest/ttn` fails closed without `TTN_WEBHOOK_SECRET` and compares the bearer value with `timingSafeEqual`. |
| Device source lifecycle and rotation were incomplete | **Resolved** | Active source checks, credential versioning, rotation, and sender-token revalidation are present. |
| Production secret validation/bootstrap was unsafe | **Partially Resolved** | Production entrypoint rejects missing/known-default/short JWT and TTN secrets and disables normal production seed; actual secret store, rotation, and deployment controls remain unknown. |
| Device API responses exposed `secretHash` | **Resolved** | Device list/get/mutation responses use `toDeviceResponse`/`toDeviceMutationResponse`; boundary tests assert that `secretHash` and its value are absent. |
| No rate limiting or abuse controls existed | **Partially Resolved** | Auth, feedback, sender trips/ingestion, TTN, device writes, and route-stop writes now use Redis limits; vehicle/route/stop writes remain unbounded, and rate-limit settings are not documented in env templates. |
| Validation and error mapping were inconsistent | **Partially Resolved** | T2 covers the named auth/feedback/device/route-stop/trip/observation boundaries and global JSON errors; vehicle/route/stop controllers still accept untyped bodies and expose legacy generic error handling. |
| CI/CD and deployment gates were missing | **Partially Resolved** | `.github/workflows/ci.yml` and `scripts/ci-checks.sh` now gate backend/frontend checks and Compose parsing; migration approval, deployment automation, rollback workflow, and release approval evidence remain absent. |
| Health/readiness and production runtime were missing | **Partially Resolved** | `/health`, `/ready`, production image targets, migrations-before-start, restart policies, secret checks, correlation IDs, and readiness/startup signals exist; deployment topology, service probes, alerting, rollback, and recovery evidence remain absent. |
| Logs, metrics, and error tracking were insufficient | **Partially Resolved** | T4 adds allowlisted redacted operational JSON lines and source-stale/history-failure signals; there is still no metrics endpoint/backend, alert rule or sink, durable aggregation, or frontend/backend error tracker. |
| Credential-bearing Redis URL was logged | **Resolved** | Redis connect/error handlers emit static redacted messages and `test_redis_logging.js` confirms the URL, password, and token are absent. |

T2 is **Partially Resolved from this re-audit's evidence perspective** and T4 is **Resolved for its
checked-in CI and signal contract**. The T4 local script reached and passed backend checks, while the
frontend production build was blocked by unavailable Google Fonts; the roadmap records a complete
T4 run on 2026-07-21. T4 does not itself provide a deployment pipeline, metrics backend, alert
routing, or error tracking.

## 2. Security Overview

The backend has three trust boundaries:

1. Admin users authenticate with bcrypt-checked credentials and a JWT.
2. Mobile, ESP32, simulator, and other non-LoRaWAN senders exchange a source secret for a short-lived
   source/vehicle/version-bound JWT. HTTP, trip, and Socket.IO writes require that identity.
3. TTN/LoRaWAN traffic enters through a separate bearer-secret webhook and is required to resolve to
   an active LoRaWAN source.

Prisma queries and tagged raw SQL are parameterized in the inspected paths. No file upload path or
   string-concatenated SQL injection path was found. The main security gap is now boundary coverage
   and production isolation rather than the basic sender authentication design.

## 3. Security Strengths

- bcrypt is used for admin and tracking-source secrets; source/device hashing uses cost 12.
- Sender tokens expire by default after 15 minutes and are checked against source status,
  assignment, type, and credential version during use.
- Sender tokens cannot be used as admin tokens, and public Socket.IO viewers cannot emit location
  writes without a sender token.
- TTN authentication fails closed and uses a timing-safe comparison.
- Device API DTOs no longer disclose `secretHash` or credential material.
- JSON request bodies default to 64 KiB, are capped at 1 MiB through configuration parsing, and
  Socket.IO messages have a bounded buffer.
- T2 provides stable 4xx/429 boundary responses and redacted category-only boundary logs for the
  covered routes.
- Production startup rejects known placeholder/weak JWT and TTN secrets, requires the two secrets to
  differ, runs migrations before application start, and skips normal production seed.
- `.env` files are ignored and the tracked env examples contain placeholders; no real secret value
  was found in tracked files during the repository check.
- Prisma migrations and `npm ci` lockfile installs support a repeatable baseline, and Compose config
  validation passes for both development and production-mode files.

## 4. Critical Security Issues

**No Critical-severity issue was identified from the available static evidence.** In particular, the
two prior direct leakage findings—`secretHash` in device responses and `REDIS_URL` in Redis logs—are
resolved.

The following High issue is the principal security blocker and must not be confused with a proven
internet exposure because the host firewall and deployment boundary are not in the repository.

### High — Production Compose exposes internal data services without an evidenced isolation boundary

`docker-compose.prod.yml` publishes PostgreSQL on `5432:5432` and Redis on `6379:6379`. Redis is
configured as `redis://redis:6379` without a password, ACL, or TLS setting. The file contains no
private-only network declaration, host firewall, reverse proxy, or provider security-group evidence.

If those host ports are reachable beyond the trusted host, an attacker could target the database or
read/write cache and Socket.IO adapter state directly. Even host-local exposure increases blast
radius after a container or host compromise.

Remove the host port mappings from the production data services unless an explicitly controlled
private-network use case requires them. Put public traffic through the selected TLS/reverse-proxy
boundary, add Redis authentication/ACL/TLS where the chosen topology requires it, and document the
database/cache network and firewall policy before deployment.

Priority: **High**. Difficulty: **Medium**. This is a configuration-level risk; final severity
depends on the undiscovered deployment network boundary.

## 5. Authentication & Authorization Review

### Admin flow

`POST /api/auth/login` validates the body, looks up the username, compares the bcrypt hash, and
returns a JWT containing `userId` and `username`. Admin middleware rejects sender-kind tokens and
protects all `/api/admin/*` mounts. `/api/auth/me` only returns the selected user fields.

The current authorization model is all-or-nothing: the schema has no role, permission, account-status,
or admin-action audit model. A valid admin token can manage every protected resource. That is
acceptable for a controlled single-operator MVP, but it is not least privilege for multiple
operators.

The backend hardcodes the admin JWT lifetime to `1d`, even though `JWT_EXPIRES_IN=8h` is documented in
the root and backend env examples. The browser stores the token in the JavaScript-readable
`admin_token` cookie and has no refresh, server-side revocation, or logout invalidation. The frontend
does check the JWT `exp` claim and redirects on 401/403, but the proxy only checks cookie presence,
not token validity.

### Sender flow

`POST /api/auth/vehicle-login` requires an active non-LoRaWAN source with a bcrypt secret and an
assigned vehicle. The issued sender JWT includes source ID, vehicle ID, and credential version.
HTTP ingestion and trip routes authenticate it; Socket.IO authenticates at handshake and revalidates
expiry, status, assignment, type, and credential version for every write. Rotation or reassignment
therefore invalidates old sender credentials without a token blacklist.

The HTTP boundary rejects a payload source ID that differs from the token source. The optional HTTP
`vehicleId` field is parsed but is not compared in `ingest.route.ts`; the canonical vehicle is still
derived from the server-side source assignment, so this is a contract-consistency gap rather than a
cross-vehicle write demonstrated by current evidence. Socket.IO does perform the optional vehicle
comparison.

### TTN flow

The TTN route requires the configured bearer secret before parsing a source into the tracking
pipeline. It accepts the supported payload shapes and requires the resolved source type to be
`lorawan`. Invalid or missing credentials receive safe errors.

## 6. Input Handling & Data Protection Review

T2's validation layer now covers admin login, sender login, public feedback, device create/update,
route-stop create/delete IDs, trip start/end IDs, HTTP observations, Socket.IO observations, and TTN
payload/source extraction. It bounds strings, coordinates, numeric telemetry, IDs, enums, stop order,
feedback length, request bodies, and Socket.IO message size. The global error middleware handles
oversized and malformed JSON requests without exposing parser details.

Boundary errors map common Prisma failures to safe `404`, `409`, or `422` responses and log only a
stable category. T2 tests confirm malformed inputs throw before the service path and that generic
errors do not escape their original message.

Residual gaps:

- `vehicles.route.ts`, `route.route.ts`, and `stops.route.ts` still pass create/update/delete bodies
  directly to legacy controllers. Those controllers use `req.body`/`any`, have no shared schemas,
  no route-specific rate limits, and log raw errors.
- T2 validation is permissive about unknown keys rather than rejecting an explicit allowlist. This
  is acceptable for the current contract but should be made intentional before external clients are
  versioned.
- Feedback stores `req.ip` with the message and vehicle. Its retention, access, deletion, and privacy
  policy are not found. The API response does not include the stored IP.
- No file upload path was found.
- Raw SQL uses Prisma tagged templates with interpolated parameters; no string concatenation was
  found in the inspected SQL paths.

### CORS and transport

The backend permits the configured `FRONTEND_URL` plus localhost development origins and enables
credentials. However, `corsOptions.methods` contains only `GET` and `POST`, while the admin frontend
uses `PUT` and `DELETE`. Cross-origin browser preflight for those admin writes may therefore fail.
Production also has no TLS/reverse-proxy configuration in the repository. The actual HTTPS boundary
is **Needs Confirmation**.

## 7. Secrets & Configuration Review

The tracked `env.example` files use placeholder values. Local `.env` files are ignored and were not
treated as production evidence; no `.env` file is tracked by git. The backend entrypoint rejects
missing, known-default, or short JWT/TTN secrets in non-development environments and rejects using
the same value for both.

The remaining configuration risks are:

- Production Compose requires database/JWT/TTN values but defaults `API_URL`, `FRONTEND_URL`, and
  the frontend API build argument to localhost. A deployment can therefore start with an origin
  that is syntactically valid but operationally wrong.
- `REQUEST_BODY_LIMIT`, `SOCKET_MAX_BUFFER_BYTES`, and all `*_RATE_LIMIT_*` variables are read by
  source but are absent from the env templates and Compose documentation.
- `JWT_EXPIRES_IN` is documented but ignored by the admin issuer, creating session-policy drift.
- The root README still documents `admin`/`transport` with `admin123`, while current seed behavior
  requires an explicit `SEED_ADMIN_PASSWORD` and has no built-in admin password. This is a dangerous
  operator instruction even though it is not a committed runtime secret.
- `NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_SOCKET_URL` are read by frontend components but are not
  documented in the frontend env example. This increases origin/configuration drift.

## 8. Dependency Hygiene Review

Both applications have lockfiles and Dockerfiles use `npm ci`; the backend test/build and frontend
lint commands are reproducible from the checked-in scripts. Dependency declarations mostly use
semver ranges (`^`), while Docker base images use floating tags such as `node:22-alpine` and
`redis:alpine`. Lockfiles improve npm install repeatability, but the Docker image contents can still
change without a repository commit.

No dependency advisory database scan, update policy, SBOM, license gate, or CI vulnerability check is
present. Live vulnerability status was intentionally not assessed by this audit.

## 9. DevOps Overview

The repository has a conventional two-application build:

- Backend: `npm run build` compiles TypeScript to `dist`; `npm test` runs the build and boundary tests.
- Frontend: `npm run build`, `npm start`, and `npm run lint` are defined; lint currently has 6
  warnings and no errors.
- Production Docker targets install production dependencies, run the compiled backend and `next
  start`, and do not use development source mounts.
- Entrypoint startup runs `prisma migrate deploy`, skips development seed outside development, and
  emits migration/application startup events.

`.github/workflows/ci.yml` now provides a CI workflow, but there is still no deployment pipeline.
No rollback strategy, migration rollback procedure, backup/restore drill, release approval gate, or
production smoke artifact is checked in. The local backend `npm run dev` command references `tsx`
through `nodemon.json`, but `tsx` is not declared in the backend package; the roadmap records that
the T2 runtime smoke used compiled `dist/server.js` for this reason.

## 10. Build & Deployment Review

The production image structure is an improvement over the earlier development-only setup. Compose
configuration parses, Postgres/Redis health checks exist, and the backend has `/health` and `/ready`.
The production file still lacks a backend/frontend healthcheck, a public reverse-proxy/TLS layer,
explicit origin requirements, internal data-service isolation, and a documented migration/rollback
runbook.

The checked-in pipeline smoke script is not self-contained evidence: it requires configured secrets
and a running backend/database, and its hard-coded test assumptions have previously diverged from seed
fixtures. The Infrastructure audit and roadmap identify simulator fixture alignment as T3, which is
not complete in this re-audit.

## 11. Environment Management Review

Development and production Compose targets are clearly separated, and `.dockerignore` excludes
local env files and dependencies. Production still relies on implicit defaults for origins and
publishes internal services. The environment contract is split across root Compose variables,
backend variables, frontend build-time values, and simulator variables.

The minimum environment matrix is not documented as one artifact. It should state, per environment:
frontend origin, REST origin, Socket.IO origin, database URL, Redis URL/authentication, TTN webhook
URL, secret owner/store, migration mode, seed mode, and public/private network boundary.

## 12. Observability Overview

The system has useful starting signals: `/health`, `/ready`, Redis connection events, migration
events, source `lastSeenAt`, a 30-second freshness helper, and source-selection counters in Redis.
T4 adds a bounded, allowlisted JSON-line signal contract with `schemaVersion`, event, outcome,
correlation ID, safe identifiers, reason codes, status, duration, and bounded freshness/count fields.
Signals cover startup/readiness, ingestion outcomes, canonical selection, source staleness/recovery,
Redis dependency state, and history persistence success/failure. Emission is best-effort and cannot
change application behavior.

For a 10+ vehicle service, an operator needs at least:

- uptime/readiness monitoring for the API and dependency failures;
- accepted/rejected ingestion counts by source and reason;
- source freshness and silent-vehicle thresholds;
- current active-trip and canonical-selection state;
- Redis/Postgres latency or failure signals;
- GPS-history persistence failure counts;
- authentication/rate-limit rejection trends; and
- frontend/API error aggregation.

The signals are currently stdout JSON lines only. None is exposed through a metrics endpoint, alert
rule, dashboard, or operator notification. A stale source now produces a structured
`tracking.source_stale` event, but no checked-in consumer turns it into an alert or operator view.

## 13. Logging Review

T1 removed the direct Redis URL disclosure, and T2's boundary logger avoids emitting exception
messages that may contain request/configuration values. The entrypoint also emits useful
`level=... event=...` startup messages.

Application logging remains mixed and mostly console-based. The new operational logger is allowlisted
and redacted, and HTTP requests receive an `X-Request-ID`; however, legacy vehicle/route/stop/public/
cache paths still use category-only or free-text console logs, and not every event carries a request
ID. There is no documented retention policy, log destination, or central collection.

No passwords, bearer tokens, or request bodies were found in the reviewed production log statements,
but the raw legacy error paths should not be treated as safe for arbitrary database/configuration
errors.

## 14. Monitoring & Alerting Review

`/ready` can support an external uptime check and correctly checks PostgreSQL and Redis. It does not
check application-level ingestion health, Socket.IO fan-out, migration age, source freshness, or
history persistence. No alert configuration or uptime monitor is present.

There is still no current mechanism to alert an operator that:

- a vehicle's source has stopped sending while its last location remains in Redis;
- all sources for a vehicle are stale;
- Redis rate limiting or cache operations are unavailable;
- canonical history writes are being swallowed after logging; or
- frontend users are receiving API/socket failures.

The backend now emits structured evidence for stale sources, dependency failures, and history
persistence failures, which improves diagnosis but does not provide monitoring or alert delivery.

## 15. Error Tracking Review

Backend failures terminate in stdout/stderr. The new boundary logger and operational signals make
several server errors safer and more searchable, but they do not aggregate, group, notify, or retain
them. Frontend code catches errors and shows inline messages or writes to the browser console; no
frontend error reporting or session diagnostics are present.

## 16. Recommended Improvements

### Recommendation 1: Isolate production data services and define the public network boundary

### Problem

Production Compose publishes PostgreSQL and Redis host ports and configures Redis without an
authentication or encryption policy. Public origin, TLS, firewall, and reverse-proxy ownership are
also not documented.

### Impact

If the host is reachable from an untrusted network, attackers may directly target the data plane,
read/write Redis state, or attempt database access. Incorrect public origins can also cause unsafe
or broken browser behavior.

### Recommendation

Remove production host port mappings for PostgreSQL/Redis unless explicitly required by a private
operator network. Define an internal network, Redis authentication/ACL/TLS policy, database access
policy, TLS terminator, firewall/security-group rules, and required non-local `FRONTEND_URL`, API,
Socket.IO, and frontend build values in one deployment matrix. Add a short runbook and verify it in a
disposable environment.

### Why

The repository currently proves container startup, not isolation. A small explicit network contract
prevents a deployment from inheriting development exposure by accident.

### Priority

High

### Difficulty

Medium

### Learning Topic

Private service networks, TLS termination, Redis ACLs, and defense in depth.

### Related Files

`docker-compose.prod.yml`, `docker-compose.yml`, `shuttle-tracking-backend/docker-entrypoint.sh`,
and the missing deployment/origin runbook.

### Recommendation 2: Complete validation, error, rate-limit, and CORS coverage for admin writes

### Problem

T2 covers its named boundary routes, but vehicle, route, and stop mutations still accept untyped
request bodies, use legacy generic errors, and have no write rate limit. CORS advertises only `GET`
and `POST` although the frontend uses `PUT` and `DELETE`.

### Impact

Malformed or abusive master-data writes can reach Prisma, produce inconsistent 500 responses, and
may fail in a browser preflight or behave differently from the T2-protected APIs.

### Recommendation

Add shared schemas, parameter validation, safe error mapping, and admin write limits to vehicle,
route, and stop routes. Make the CORS method/origin contract match actual frontend requests, including
preflight behavior. Add route-level tests proving malformed writes do not reach Prisma and that
duplicate/missing-resource cases return stable codes. Document every limit variable and default.

### Why

T2's main value is a consistent boundary contract; leaving the existing admin CRUD paths on legacy
behavior creates an avoidable security and operability split.

### Priority

High

### Difficulty

Medium

### Learning Topic

Allowlist validation, HTTP error taxonomies, CORS preflight, and bounded admin APIs.

### Related Files

`shuttle-tracking-backend/src/routes/vehicles.route.ts`, `route.route.ts`, `stops.route.ts`,
their controllers, `src/middleware/validation.ts`, `src/middleware/boundary-errors.ts`, and
`src/server.ts`.

### Recommendation 3: Make JWT session policy and admin trust boundaries explicit

### Problem

The admin issuer hardcodes a one-day expiry despite `JWT_EXPIRES_IN` documentation, the browser
stores the token in a JavaScript-readable cookie, and all admin accounts have the same permissions.

### Impact

Session policy can drift between environments; an XSS issue could read the bearer token; and a
compromised ordinary admin has the same mutation authority as every other admin.

### Recommendation

Use the configured admin expiry or remove the misleading variable. Before multi-operator use, choose
an intentional server-managed HttpOnly/Secure/SameSite session or BFF boundary, define refresh and
revocation behavior, and add role/permission checks plus action attribution. Keep the current
source-bound sender token design for devices. Remove the `admin123` instructions from README and
replace them with explicit local provisioning steps.

### Why

This preserves the current MVP simplicity while making the session and least-privilege decision
explicit before the number of administrators grows.

### Priority

Medium now; High before multi-operator or public administration

### Difficulty

Medium for expiry/documentation; Hard for session and RBAC redesign

### Learning Topic

JWT expiry, HttpOnly cookies, refresh/revocation, RBAC, and audit trails.

### Related Files

`shuttle-tracking-backend/src/controllers/auth.controller.ts`, `src/middleware/auth.ts`,
`shuttle-tracking-web/contexts/AuthContext.tsx`, `services/api.ts`, `proxy.ts`, `README.md`, and
the seed/env documentation.

### Recommendation 4: Add CI gates and a repeatable release/rollback check

### Problem

Build, lint, boundary tests, Prisma validation, and Compose parsing now have a CI workflow and local
script. Migration gates, rollback procedures, deployment approval evidence, and integration smoke
execution in CI are still absent. The local dev script also references undeclared `tsx`.

### Impact

Validation and security regressions can reach a release without detection, and a migration or origin
failure may only be discovered after deployment.

### Recommendation

Extend the existing CI job with a disposable Postgres/Redis integration smoke, migration/release
approval and rollback instructions. Either add `tsx` to the backend dev dependencies or change
`nodemon.json` to a declared tool. Keep live dependency advisory scanning as a separate pre-release
job.

### Why

The project already has useful local checks; CI turns them into a repeatable deployment gate without
requiring a heavyweight platform.

### Priority

High before production or public release

### Difficulty

Medium

### Learning Topic

CI gates, disposable integration environments, migration safety, and rollback design.

### Related Files

`shuttle-tracking-backend/package.json`, `shuttle-tracking-backend/nodemon.json`, both package
lockfiles, Dockerfiles, Compose files, and the missing CI workflow/runbook.

### Recommendation 5: Establish minimal structured operational signals and alerts

### Problem

The application now has request correlation and redacted JSON signals for readiness, ingestion
outcomes, source staleness, dependency state, and history persistence, but no metrics export, error
aggregation, source-silence alert, or frontend error reporting.

### Impact

Operators may learn about a silent vehicle, Redis failure, or lost GPS history only from riders or
after an incident, making diagnosis and response unreliable.

### Recommendation

Keep the current signal contract and export its counters to a metrics or log sink. Monitor `/ready`,
alert on source silence and dependency failure, and add one aggregated backend/frontend error-reporting
path after the deployment topology is selected.

### Why

These signals map directly to the operational failure modes already represented in the code and do
not require selecting a vendor or building a full SIEM.

### Priority

High before daily operations; Medium for a controlled demo

### Difficulty

Medium

### Learning Topic

Structured logging, metrics, health checks, alert thresholds, and error grouping.

### Related Files

`shuttle-tracking-backend/src/server.ts`, `src/services/tracking.service.ts`, `src/config/redis.ts`,
`src/middleware/boundary-errors.ts`, frontend API/socket consumers, and the deployment runbook.

### Recommendation 6: Align fixtures and make the device pipeline smoke reproducible

### Problem

The pipeline evidence depends on configured infrastructure and secrets. T3 aligns simulator/test
fixtures and documents the smoke path, but no physical sender or provider runtime is available in
this repository.

### Impact

Device authentication and source-priority claims can fail before they exercise the actual canonical
pipeline, reducing confidence in future security or operational changes.

### Recommendation

Drive source IDs, vehicle IDs, admin provisioning, and secrets from one documented test environment;
remove fallback credentials from simulators; align TTN simulator IDs with seed fixtures; and provide
one disposable command that starts dependencies, runs the compiled backend, runs REST/Socket.IO smoke
checks, and cleans up without using production credentials.

### Why

Reproducible evidence is the simplest way to preserve T2's trust-boundary guarantees as T3/T4/T5/T6
change the pipeline.

### Priority

High for device-pipeline validation; Medium for a demo-only release

### Difficulty

Easy to Medium

### Learning Topic

Configuration-as-contract, test fixtures, smoke tests, and secret-safe integration environments.

### Related Files

`shuttle-tracking-backend/test_pipeline.js`, `shuttle-tracking-backend/prisma/seed.js`,
`shuttle-tracking-web/simulate.js`, `simulate-manual.js`, `shuttle-tracking-backend/simulate-ttn.js`,
and the env templates.

## 17. Security/DevOps/Observability Learning Topics

1. **Boundary validation and safe errors.** Validation is a parser at the trust boundary; it stops
   malformed data before database/broadcast code. It is needed now because T2 introduced the pattern
   but legacy admin CRUD still bypasses it. A small local parser plus one error mapper is enough; a
   large validation framework is not required. Learn request shape, allowlists, status/code taxonomy,
   and route tests first.
2. **Rate limits and quotas.** A rate limit bounds attempts per key/window; a source quota prevents
   one sender from flooding ingestion. They are needed for auth, feedback, and telemetry. Redis is a
   suitable current implementation; a gateway is unnecessary at MVP scale. Learn key design, proxy
   identity, fail-open versus fail-closed behavior, and alerting next.
3. **Secret-safe responses and transport.** Data minimization removes credential material from API
   responses/logs; TLS and private networks protect it in transit and at the service boundary. T1
   resolved the first two leaks, while production data-service isolation remains. Learn response DTOs,
   redaction, internal networks, TLS termination, and Redis ACLs in that order.
4. **CI/CD and migration safety.** CI runs the same checks on every change; migration safety makes
   schema changes reversible or forward-recoverable. This project needs CI before claiming a reliable
   production release, while a simple workflow and runbook are enough. Learn build/test gates,
   disposable dependencies, migration approval, rollback, and smoke checks.
5. **Operational observability.** Logs explain an event, metrics count a condition, health checks
   prove dependency reachability, and alerts turn thresholds into operator action. This project needs
   source freshness and dependency signals before daily operations; a full vendor suite is not needed
   now. Learn structured events, correlation IDs, counters, readiness monitoring, stale thresholds,
   and error grouping.
6. **JWT sessions and least privilege.** JWT expiry limits exposure time; refresh/revocation handles
   longer sessions; RBAC limits what each operator can change. The current single-admin MVP can defer
   RBAC, but it should not silently rely on a one-day hardcoded session. Learn expiry/config alignment,
   HttpOnly cookies, revocation, roles, and action audit trails.

## 18. Audit Limitations

- No live production deployment, host firewall, TLS terminator, provider security group, secret
  manager, log sink, uptime monitor, or backup system was inspected.
- No penetration test, exploit attempt, or live dependency advisory database lookup was performed.
- No mobile application, ESP32 firmware, TTN console configuration, or physical device was available.
- The local database and Redis containers were observed healthy, but the backend was not running during
  this re-audit; the recorded roadmap smoke result was not independently repeated.
- Browser behavior, including the CORS preflight consequence for PUT/DELETE, was inferred from the
  source configuration and frontend requests rather than observed interactively.
- The severity of direct PostgreSQL/Redis exposure depends on deployment firewall/network facts that
  are not in the repository.

## 19. Handoff

Recommended next agent: **Production Readiness Audit Agent**.

Production Readiness depends on this report because the remaining security and operational gaps are
release gates, not optional polish. It should not mark a public/daily release ready while production
data services lack a confirmed private boundary, admin master-data writes remain outside the T2
validation/rate-limit contract, deployment/release evidence is incomplete, or operators cannot detect source
silence and dependency failure. It should distinguish the controlled-MVP decision from a public or
daily-service decision and record any explicit risk acceptance.

## Roadmap Impact

- T1, T2, T3, and T4 are marked **Complete** in the roadmap. T4's CI and redacted operational-signal
  contract are now available for the remaining refactors and Production Readiness evidence.
- T2 does not close the whole previous security finding set: admin vehicle/route/stop boundary
  coverage, production network isolation, session-policy alignment, and CORS still need work.
- T3's simulator/seed alignment and pipeline smoke documentation improve device evidence, but no
  physical sender or provider deployment was verified in this audit.
- T4 is **Resolved for its stated Phase 1 scope**. It remains insufficient by itself for deployment
  approval because migration/rollback, alert delivery, and error tracking are outside its scope.
- T5/T6 remain downstream of the security boundary but are not security sign-offs. Their runtime
  changes must preserve source-bound tokens, bounded payloads, safe errors, and source-aware quotas.
- D-001 still determines whether daily-operation observability is a release blocker now. D-003 still
  governs production origin/topology sequencing. D-002 remains relevant to telemetry retention but is
  not required to resolve the direct configuration/leakage findings in this report.

## Assumptions and Unknowns

- `docker-compose.prod.yml` is treated as a production-mode configuration template, not proof of the
  deployed topology.
- Production secrets are assumed to be supplied outside git; their strength, rotation, ownership,
  and storage system are unknown beyond entrypoint checks.
- Actual TLS, firewall, reverse-proxy, Redis persistence/eviction, database backup, and log-retention
  decisions are unknown.
- One all-powerful admin token is assumed to match the current controlled-MVP scope; role/permission
  requirements are not approved.
- No external sender client contract is assumed beyond the repository's API and simulators.

## Confidence

**High** for code-visible authentication, validation, response projection, rate-limit placement,
logging statements, package scripts, CI workflow, Compose definitions, and signal redaction.

**Medium** for local runtime readiness because Postgres/Redis were healthy and the roadmap records a
configured smoke run, but the backend smoke was not rerun in this turn.

**Low** for production exposure, dependency vulnerability status, TLS, device behavior, and alerting
because the required external systems and live scans were unavailable.

## Required Decisions

- **D-001 — Operational MVP release scope:** decide whether this remains a controlled demo or moves to
  daily/public operations; this sets the urgency of source-silence alerts, admin session hardening,
  and error tracking.
- **D-003 — Production topology and origin sequencing:** confirm private database/Redis networking,
  TLS/reverse proxy, public origins, secret ownership, and release runbook before production Compose
  is treated as deployable.
- No new product decision is required to remove production data-service port mappings, document the
  env contract, align CORS with actual methods, complete legacy admin boundary coverage, or add CI
  checks.
