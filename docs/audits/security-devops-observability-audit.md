# Security, DevOps & Observability Audit

Audit metadata:
- Evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Evidence scope: `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/middleware/`, `shuttle-tracking-backend/src/config/`, `shuttle-tracking-backend/src/controllers/auth.controller.ts`, `shuttle-tracking-backend/src/controllers/feedback.controller.ts`, `shuttle-tracking-backend/src/routes/`, `shuttle-tracking-backend/src/services/operational-signals.ts`, `shuttle-tracking-web/contexts/AuthContext.tsx`, `shuttle-tracking-web/proxy.ts`, `docker-compose.yml`, `docker-compose.prod.yml`, `shuttle-tracking-backend/docker-entrypoint.sh`, `env.example`, `.github/workflows/ci.yml`, `scripts/ci-checks.sh`, `docs/testing/ci-checks.md`, `docs/testing/pipeline-smoke-tests.md`, and the predecessor audit reports.
- Reviewed at: `2026-07-22T21:52:02+07:00`
- Validation state: **Validated**
- Predecessor baselines: `docs/audits/backend-audit.md`, `docs/audits/frontend-audit.md`, `docs/audits/database-audit.md`, `docs/audits/infrastructure-device-audit.md`, and `docs/audits/dashboard-ux-audit.md` @ `847a18cce9bc27c82b2622dbc176b3a89bc4d037`

Execution: **Run Next** selected the only eligible profile after Dashboard & UX. This is a static repository audit. No deployed endpoint, production secret, provider account, physical device, or external network boundary was treated as evidence.

## 1. Executive summary

The controlled-MVP security foundation is materially improved. Sender JWTs are source/vehicle/version-bound and revalidated on use, TTN webhook authentication fails closed with a timing-safe comparison, device DTOs omit `secretHash`, request and Socket.IO payload sizes are bounded, Redis-backed rate limits fail closed when unavailable, and operational logs use an allowlisted redacted signal contract. A GitHub Actions workflow and repeatable local CI script are present.

The system is not ready to claim a securely operated public or daily service. The main residual risks are:

- **High:** production Compose publishes PostgreSQL and Redis host ports, with no repository evidence of private networking, Redis authentication/TLS, firewall rules, or a reverse-proxy boundary.
- **High:** observability is best-effort stdout and process-local suppression; there is no durable metrics/log sink, alert routing, error tracker, or recovery drill.
- **Medium:** CORS advertises only `GET` and `POST`, although protected admin routers expose `PUT` and `DELETE`; a cross-origin deployment can therefore fail admin mutations at preflight.
- **Medium:** the documented `JWT_EXPIRES_IN=8h` is ignored by admin login, which hardcodes `1d`; the browser stores the admin JWT in a JavaScript-readable cookie and the edge proxy checks only cookie presence.
- **Medium:** legacy vehicle, route, and stop writes remain untyped, unthrottled, and outside the newer boundary-error contract; admin authorization is all-or-nothing with no role or sensitive-action audit trail.

Current suitability: **controlled demonstration with known operators and configured senders**. Production Readiness must make the deployment, session, abuse-control, privacy, and monitoring risk explicit before any broader release claim.

## 2. Scope, execution, and limitations

The review followed the Security, DevOps & Observability playbook and consumed the current validated Product, Architecture, Backend, Frontend, Database, Infrastructure & Device, and Dashboard & UX reports. It reviewed:

- admin, sender, Socket.IO, public, and TTN trust boundaries;
- auth claims, credential rotation, CORS, request limits, error mapping, and response DTOs;
- Compose production configuration, container startup, health/readiness, environment templates, and CI;
- operational signal schema, Redis failure logging, feedback IP capture, and available tests/docs.

Not verified: deployed TLS, proxy/firewall/security-group rules, secret manager and rotation, provider/gateway configuration, physical-device permissions and firmware, backup/restore, production traffic, dependency advisories, penetration testing, and alert delivery.

Validation performed for this audit: `node scripts/validate-agent-workflow.js` passed; backend
boundary, device-response, Redis-log, and operational-signal tests passed; frontend lint passed
with six existing warnings and no errors; `git diff --check` passed. The full release script was
not required for this docs-only audit update.

## 3. Re-audit of prior findings

| Prior finding | Status | Current evidence |
|---|---|---|
| Sender, trip, and Socket.IO writes were weakly authenticated | **Resolved** | `auth.ts` verifies sender JWT claims and re-queries active source, assignment, type, and credential version. Socket.IO revalidates on every write. |
| TTN/webhook credential boundary was optional | **Resolved** | The TTN route requires `TTN_WEBHOOK_SECRET` and compares the bearer value with `timingSafeEqual`; missing configuration fails closed. |
| Device source lifecycle and rotation were incomplete | **Resolved** | Source status, source type, assignment, and credential-version checks invalidate old sender tokens after rotation/reassignment. |
| Production secret validation/bootstrap was unsafe | **Partially Resolved** | The production entrypoint rejects missing/known-default/short JWT and TTN secrets, requires them to differ, runs migrations, and disables production seed; store, rotation, and deployment controls remain unknown. |
| Device API responses exposed `secretHash` | **Resolved** | Device response projections and boundary tests omit `secretHash` and credential material. |
| No rate limiting or abuse controls existed | **Partially Resolved** | Auth, feedback, sender, TTN, device, and route-stop boundaries use Redis limits. Vehicle, route, and stop writes remain unbounded; deployment/proxy keying is not yet evidenced. |
| Validation and error mapping were inconsistent | **Partially Resolved** | T2 covers the named auth, feedback, device, route-stop, trip, observation, and TTN boundaries. Vehicle, route, and stop controllers still accept untyped bodies and retain legacy error handling. |
| CI/CD and deployment gates were missing | **Partially Resolved** | `.github/workflows/ci.yml` and `scripts/ci-checks.sh` gate repository checks and Compose parsing. Deployment, migration approval, rollback, release approval, and security scanning are absent or not evidenced. |
| Health/readiness and production runtime were missing | **Partially Resolved** | `/health`, `/ready`, production targets, dependency healthchecks, migrations-before-start, restart policies, and startup signals exist. Application container probes, topology, alerting, rollback, and recovery remain open. |
| Logs, metrics, and error tracking were insufficient | **Partially Resolved** | Allowlisted JSON signals and redacted boundary/Redis logs exist, but collection is stdout/process-local with no durable aggregation, metrics backend, alert route, or error tracker. |
| Credential-bearing Redis URL was logged | **Resolved** | Redis connect/error handlers emit static or allowlisted data; the redaction test covers URL, password, and token absence. |
| Production data services lacked an evidenced isolation boundary | **Still Present** | `docker-compose.prod.yml` still publishes `5432` and `6379`; Redis has no password/ACL/TLS setting in the checked-in production definition. |

## 4. Trust boundaries and authorization

### Admin

`POST /api/auth/login` uses bcrypt and issues a JWT with `userId` and `username`. Protected admin routers require a verified token and reject sender-kind claims. The authorization model has no role, permission, account-status, or admin-action audit model: every valid admin token can manage all protected resources. This is acceptable only for a single-operator controlled MVP.

The admin issuer hardcodes `expiresIn: '1d'` while the documented/configured `JWT_EXPIRES_IN` default is `8h`. `AuthContext` writes `admin_token` through a client-side cookie API, so the token is JavaScript-readable and cannot be `HttpOnly` under the current flow. The Next proxy checks only whether that cookie exists; backend JWT verification remains authoritative, but the edge check is not an authentication check.

### Mobile, ESP32, and simulator senders

Sender login requires an active non-LoRaWAN source, its bcrypt secret, and an assigned vehicle. The token contains source, vehicle, and credential version. HTTP ingest/trip routes require the sender token and derive vehicle ownership from the server-side source assignment. Socket.IO allows anonymous viewers but requires an authenticated sender token for `send-location`, then revalidates the sender before every write.

This protects the current write boundary against stale credentials and cross-vehicle assignment. It does not prove firmware storage, device provisioning, offline replay behavior, clock quality, or physical compromise resistance; those remain Infrastructure & Device limitations.

### TTN / LoRaWAN

`/api/ingest/ttn` is a separate bearer-secret boundary, rate-limited by IP, and requires the resolved source to be LoRaWAN. Provider/gateway identity, replay protection at the provider boundary, and deployment network controls are not verifiable from the repository.

### Public and export boundaries

Public tracking and feedback are intentionally unauthenticated. Feedback is rate-limited and stores `req.ip`; privacy notice, retention, access/deletion handling, and staff triage are not implemented. No separate raw export authorization, export audit trail, or research-role model is evidenced because the research dashboard/export workflow is not implemented.

## 5. Transport, input, and abuse controls

- HTTP JSON defaults to `64kb` and accepts a configured value only up to `1MiB`; Socket.IO has the same bounded-buffer principle.
- Boundary parsers constrain IDs, strings, coordinates, telemetry, enums, stop order, feedback, observation payloads, and TTN shapes. Global error handling maps oversized/malformed input to safe responses.
- Redis rate limits cover admin login, sender login, public feedback, sender observation/trip writes, TTN ingress, device writes, and route-stop writes. Limits fail closed when Redis is not ready or errors.
- Rate-limit keys use the socket peer address and deliberately do not trust forwarded headers until deployment topology is defined. A proxy deployment must set and test the trusted-hop policy, or attackers may share a limiter bucket or evade the intended client identity.
- Vehicle, route, and stop CRUD routes expose POST/PUT/DELETE handlers without the newer validation and rate-limit middleware. Their admin authentication is present, but their abuse and error boundary is weaker than devices/route-stops.

### CORS finding — current cross-origin admin writes are incomplete

`server.ts` applies the same CORS options to Express and Socket.IO. The origin allowlist is exact-match based and credentials are enabled, but `methods` contains only `GET` and `POST`. Protected vehicle, route, and stop routers use `PUT` and `DELETE`. In a genuinely cross-origin deployment, browser preflight can reject those admin operations even when the JWT is valid. Production also always includes localhost origins and defaults `FRONTEND_URL` to localhost unless deployment configuration overrides it.

Status: **New Finding**, Medium. The fix belongs in the shared topology/origin contract; do not broaden origins or methods without an explicit deployment matrix and tests.

## 6. Secrets, data protection, and logging

Strengths:

- bcrypt protects admin and tracking-source secrets; device API DTOs do not expose `secretHash`.
- Production startup rejects known placeholder/weak JWT and TTN secrets, requires them to differ, and skips normal production seed.
- `.env` files are ignored and tracked examples contain placeholders; no real secret was found in the inspected tracked files.
- Boundary failure logs emit only stable categories. Operational signals are allowlisted, bounded, correlation-keyed JSON and intentionally exclude bodies, coordinates, URLs, headers, credentials, hashes, and exception messages.
- Redis connection events no longer print the credential-bearing URL.

Residual concerns:

- Compose production injects secrets through environment variables and does not show a secret manager, rotation procedure, or TLS for database/Redis traffic.
- Feedback persists client IP without a documented purpose, retention period, access restriction, deletion path, or incident procedure.
- stdout signals have no durable retention, access policy, or alert delivery. Process-local cooldown maps reset on restart and do not provide reliable event accounting.
- The CI static logging check helps prevent obvious leaks but is not a secret scan or dependency vulnerability scan.

## 7. DevOps, runtime, and observability

Production Compose has Postgres and Redis healthchecks, dependency-gated backend startup, migrations-before-start, production seed suppression, restart policies, and compiled Node/Next images. `/health` is liveness-only; `/ready` checks a database query and Redis ping and emits a readiness signal. Backend and frontend application-level healthchecks are not present in production Compose, so container restart/orchestration cannot use the application readiness contract.

The repository has a push/PR GitHub Actions job that installs lockfile dependencies and runs `scripts/ci-checks.sh`. The local script covers backend build/boundary/redaction tests, Prisma validation, frontend lint/build, both Compose configs, unsafe dynamic-log search, and agent-workflow validation. It does not provide dependency advisory scanning, SAST/DAST, container scanning, live integration tests in CI, deployment approval, migration rollback, backup/restore, or release promotion.

The operational signal contract covers startup/readiness, ingestion outcomes, source staleness, canonical selection, and dependency failures. It is useful evidence for a controlled run, but accepted/rejected/duplicate counts, latency, persistence failure, queue/backpressure, recovery, dashboard query/export failure, alert routing, and durable per-transport history are not available as an operator-facing system.

The production artifact still publishes database/cache ports and uses floating `node:22-alpine`/`redis:alpine`-style image tags. No TLS/reverse proxy, backup target, restore drill, log destination, or operational owner is documented. Provider and physical-device controls remain **Unable to Verify**.

## 8. Findings and recommendations

| ID | Finding | Status | Priority | Recommended next action |
|---|---|---|---|---|
| SEC-01 | Production DB/Redis host exposure and missing evidenced private boundary/auth policy | **Still Present** | High | Define topology first; remove unnecessary host ports, then document private networking, firewall, Redis auth/TLS, and access ownership. |
| SEC-02 | Operational signals are not durable or alertable | **Still Present** | High | Select a redacted log/metrics sink, define per-transport freshness/error alerts, access policy, and a recovery drill. |
| SEC-03 | CORS methods omit admin `PUT`/`DELETE`; production origin defaults are unsafe for deployment | **New Finding** | Medium | Make the approved origin/method matrix explicit and test REST plus Socket.IO preflight/handshake behavior. |
| SEC-04 | Admin JWT lifetime configuration is ignored; browser token is JS-readable and proxy checks presence only | **Still Present** | Medium | Align issuer with the approved session policy, move toward secure server-managed session handling, and validate proxy/backend behavior together. |
| SEC-05 | Legacy vehicle/route/stop writes lack bounded parsing, rate limits, and consistent safe errors | **Still Present** | Medium | Bring all admin writes into the shared validation/error/rate-limit boundary before multi-operator use. |
| SEC-06 | Admin authorization has no least-privilege roles or sensitive-action audit | **Still Present** | Medium | Define roles for device provisioning, credential rotation, raw diagnostics, and export before those workflows ship. |
| SEC-07 | Feedback IP/privacy lifecycle is undocumented and unbounded in the current audit evidence | **Partially Resolved** | Medium | Define purpose, retention/deletion, staff access, and disclosure before expanding feedback or research use. |
| SEC-08 | Deployment/provider/physical-device security controls cannot be verified | **Unable to Verify** | High for production claims | Obtain an approved disposable/deployment evidence set covering TLS, secret storage, firewall, provider, firmware, provisioning, and recovery. |

## 9. Roadmap impact and decisions

This audit introduces no owner decision. Existing decisions remain authoritative:

- D-001 keeps the release at a controlled demonstration/pilot boundary.
- D-002 permits bounded raw diagnostics for comparing Mobile, LoRaWAN, and ESP32, but retention, access, and deletion implementation remain gated.
- D-003 requires topology/origin facts before configuration alignment.
- D-004 defines the three-device research boundary and authenticated Dev Dashboard scope.

Security work should inform the current roadmap's topology/origin, observability, and device/research tasks. It must not be treated as approval for deployment merely because repository CI passes. Production Readiness is now the next eligible profile and must synthesize these findings with all current domain reports.

## 10. Unknowns, confidence, and handoff

Unknowns: deployed network exposure, TLS termination, firewall/security groups, secret manager and rotation, Redis/DB encryption, backup/restore, alert routing, production log access, dependency advisory state, provider configuration, firmware, physical device access, and live browser/device behavior.

Confidence is **High** for repository-visible auth, CORS, middleware, Compose, CI, and logging contracts; **Medium** for runtime integration because no live production topology or full disposable pipeline was rerun in this audit; **Low** for provider, physical-device, and operational response claims.

Handoff: Security, DevOps & Observability is **Complete / Validated** at the stated baseline. The next `run next` profile is Production Readiness. Do not mark the system production-ready without resolving or explicitly accepting the High findings and documenting the unavailable external evidence.
