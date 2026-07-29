# Security, DevOps & Observability Audit

Audit metadata:

- Evidence baseline: `d94abb3a4d80c2174d87df4d006dfbe7c814a6bc`
- Evidence scope: `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/middleware/`, `shuttle-tracking-backend/src/config/`, `shuttle-tracking-backend/src/controllers/auth.controller.ts`, `shuttle-tracking-backend/src/controllers/feedback.controller.ts`, `shuttle-tracking-backend/src/routes/`, `shuttle-tracking-backend/src/services/operational-signals.ts`, `shuttle-tracking-web/contexts/AuthContext.tsx`, `shuttle-tracking-web/proxy.ts`, `docker-compose.yml`, `docker-compose.prod.yml`, `shuttle-tracking-backend/docker-entrypoint.sh`, `env.example`, `.github/workflows/ci.yml`, `scripts/ci-checks.sh`, `docs/testing/ci-checks.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/decision-queue.md`, `docs/research/T7-owner-input-questionnaire.md`, `docs/tasks/T7-raw-research-observations.md`, `docs/audits/specialized/T7-data-lifecycle-access.md`, and the current predecessor audit reports
- Reviewed at: `2026-07-29T14:33:30+07:00`
- Validation state: **Validated**
- Predecessor baselines: all required Discovery, Product, Architecture, Backend, Frontend, Database, Infrastructure & Device, and Dashboard & UX reports `@ d94abb3a4d80c2174d87df4d006dfbe7c814a6bc`

## T7 Re-audit Addendum — 2026-07-29

T7 introduces a distinct researcher trust boundary: authentication remains server-side and
`requireResearchAccess` rechecks the persisted DEV/SUPER_ADMIN role. Research reads/exports are
session/time bounded, fixed-field, CSV streamed, capped, and record a minimum lifecycle/export
manifest; raw telemetry is not added to public DTOs. This is **Partially Resolved** for least-privilege
research access and bounded export abuse. It does not prove TLS/origin deployment, alert routing,
secret scanning, provider/firmware security, production audit-log operations, or a production
retention/deletion run; those findings remain **Unable to Verify**. CI rerun passed backend boundaries
and Prisma validation; frontend lint had two pre-existing non-blocking warnings and no errors.
- Previous report baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`

Execution: **Run Next** selected the only eligible profile after the current Dashboard & UX report.
This is a static repository audit. No deployed endpoint, production secret, provider account,
physical device, or external network boundary was treated as evidence.

## 1. Executive Summary

The controlled-MVP security foundation is materially improved. Sender JWTs are source/vehicle/version
bound and revalidated on use, TTN webhook authentication fails closed with a timing-safe comparison,
device DTOs omit `secretHash`, request and Socket.IO payload sizes are bounded, Redis-backed rate
limits fail closed when unavailable, and operational logs use an allowlisted redacted signal contract.
The T6 canonical publisher now owns REST/Socket publication convergence, avoiding an extra raw
broadcast path. GitHub Actions and a repeatable local CI script are present.

The system is not ready to claim a securely operated public or daily service. Residual high-impact
risks are production DB/Redis exposure without an evidenced private boundary, best-effort stdout-only
observability without durable alerts/recovery, and missing deployment/provider/physical evidence.
Medium risks include incomplete CORS methods for cross-origin admin writes, an ignored admin JWT
duration setting, JavaScript-readable admin tokens with a cookie-presence proxy check, legacy admin
write boundaries without the newer validation/rate-limit contract, and all-or-nothing admin
authorization.

T7 adds an owner-approved D-006 safer disposable/export policy, but the research role model, raw
export implementation, retention job, and lifecycle manifest do not exist. The approved omission of a
raw read-content audit trail is a documented residual risk; it is not evidence that T7 access control
has been implemented.

Current suitability: **controlled demonstration with known operators and configured senders**.
Production Readiness must make the deployment, session, abuse-control, privacy, and monitoring risks
explicit before any broader release claim.

## 2. Scope, Freshness, and Validation

The previous Security, DevOps & Observability report was based at `847a18c...`. All required
predecessors are now current and validated at `fa9441b...` where affected by T6, so the predecessor
gate passes.

The evidence comparison from the previous baseline to the current commit included T6 server and
ingest publication changes, current D-006 owner/export controls, the relocated pipeline test/smoke
path, and all current predecessor reports. The current uncommitted D-006 documents are treated as
coordination evidence only, not as implemented access, export, retention, or deployment evidence.

The review covers admin, sender, Socket.IO, public, TTN, database, Redis, and export trust boundaries;
auth claims; credential rotation; CORS; request limits; error mapping; response DTOs; Compose startup;
health/readiness; CI; operational signals; feedback IP capture; and T7 research-access boundaries.

Validation evidence:

- Backend build, boundary/redaction, operational-signal, T6, and Prisma checks passed.
- Frontend lint passed with two existing warnings and no errors; the current Frontend report records
  TypeScript and webpack production build success.
- `git diff --check` passed.
- Development and production Compose parsing passed with local/disposable values.
- `bash scripts/ci-checks.sh` reached and passed the backend checks and frontend lint, but its default
  Turbopack `next build` did not complete in the restricted runner; the webpack build used by the
  Frontend re-audit passed. This is a runner limitation, not a production-build claim.

Not verified: deployed TLS, proxy/firewall/security-group rules, secret manager and rotation, provider/
gateway configuration, physical-device permissions and firmware, backup/restore, production traffic,
dependency advisories, penetration testing, alert delivery, and recovery execution.

## 3. Prior-Finding Revalidation

| Prior finding | State | Current evidence and implication |
|---|---|---|
| Sender, trip, and Socket.IO writes were weakly authenticated | **Resolved** | Sender JWT claims are verified and re-queried against active source, assignment, type, and credential version; Socket.IO revalidates before every write. T6 now publishes through one canonical boundary. |
| TTN/webhook credential boundary was optional | **Resolved** | TTN requires `TTN_WEBHOOK_SECRET` and compares the bearer value with `timingSafeEqual`; missing configuration fails closed. |
| Device source lifecycle and rotation were incomplete | **Resolved** | Source status, type, assignment, and credential-version checks invalidate old sender tokens after rotation/reassignment. |
| Production secret validation/bootstrap was unsafe | **Partially Resolved** | Production entrypoint rejects missing/known-default/short JWT and TTN secrets, requires them to differ, runs migrations, and disables production seed; storage, rotation, and deployment controls remain unknown. |
| Device API responses exposed `secretHash` | **Resolved** | Device response projections and boundary tests omit `secretHash` and credential material. |
| No rate limiting or abuse controls existed | **Partially Resolved** | Auth, feedback, sender, TTN, device, route-stop, and trip/observation boundaries use Redis limits. Vehicle, route, and stop writes remain unbounded; deployment/proxy keying is not evidenced. |
| Validation and error mapping were inconsistent | **Partially Resolved** | T2 covers auth, feedback, device, route-stop, trip, observation, and TTN boundaries. Vehicle, route, and stop controllers still accept untyped bodies and retain legacy error handling. |
| CI/CD and deployment gates were missing | **Partially Resolved** | GitHub Actions and `scripts/ci-checks.sh` gate repository checks and Compose parsing. Dependency scanning, deployment approval, migration rollback, backup/restore, release approval, and promotion evidence remain absent. |
| Health/readiness and production runtime were missing | **Partially Resolved** | `/health`, `/ready`, production targets, dependency healthchecks, migration-before-start, restart policies, and startup signals exist. Application probes, topology, alerting, rollback, and recovery remain open. |
| Logs, metrics, and error tracking were insufficient | **Partially Resolved** | Allowlisted JSON signals and redacted boundary/Redis logs exist, but collection is stdout/process-local with no durable aggregation, metrics backend, alert route, or error tracker. |
| Credential-bearing Redis URL was logged | **Resolved** | Redis connection events emit static/allowlisted data; the redaction test covers URL, password, and token absence. |
| Production data services lacked an evidenced isolation boundary | **Still Present** | `docker-compose.prod.yml` still publishes `5432` and `6379`; Redis has no password/ACL/TLS setting in the checked-in production definition. |
| T7 raw research access/export had no safe owner boundary | **Partially Resolved** | D-006 now specifies isolated targets, fixed-field/session-scoped default CSV, break-glass full export, streaming/backpressure, and minimal manifests. No role model, route, exporter, lifecycle job, or manifest implementation exists; no raw read-content audit trail remains an accepted owner risk. |

## 4. Trust Boundaries and Authorization

### Admin

`POST /api/auth/login` uses bcrypt and issues a JWT with `userId` and `username`. Protected admin
routers require a verified token and reject sender-kind claims. The authorization model has no role,
permission, account-status, or admin-action audit model: every valid admin token can manage all
protected resources and can reach the current device analytics endpoint. This is acceptable only for
a single-operator controlled MVP and cannot support T7 `DEV`/`SUPER_ADMIN` research authorization.

The admin issuer hardcodes `expiresIn: '1d'` while the documented/configured `JWT_EXPIRES_IN` default
is `8h`. `AuthContext` writes `admin_token` through a client-side cookie API, so the token is
JavaScript-readable and cannot be `HttpOnly` under the current flow. The Next proxy checks only
whether that cookie exists; backend JWT verification remains authoritative, but the edge check is not
an authentication check.

### Mobile, ESP32, and simulator senders

Sender login requires an active non-LoRaWAN source, its bcrypt secret, and an assigned vehicle. The
token contains source, vehicle, and credential version. HTTP ingest/trip routes require the sender
token and derive vehicle ownership from server-side source assignment. Socket.IO permits anonymous
viewers but requires an authenticated sender token for `send-location`, then revalidates the sender
before every write.

This protects the current write boundary against stale credentials and cross-vehicle assignment. It
does not prove firmware storage, device provisioning, offline replay behavior, clock quality, or
physical compromise resistance; those remain Infrastructure & Device limitations.

### TTN / LoRaWAN

`/api/ingest/ttn` is a separate bearer-secret boundary, rate-limited by IP and source, and requires
the resolved source to be LoRaWAN. Provider/gateway identity, replay protection at the provider
boundary, and deployment network controls are not verifiable from the repository.

### Public and research boundaries

Public tracking and feedback are intentionally unauthenticated. Feedback is rate-limited and stores
`req.ip`; privacy notice, retention, access/deletion handling, and staff triage are not implemented.
No separate raw export authorization, research-role model, or protected query is evidenced. D-006's
minimal export manifest is an operational accountability record, not a raw read-content audit log.

## 5. Transport, Input, and Abuse Controls

- HTTP JSON defaults to `64kb` and accepts a configured value only up to `1MiB`; Socket.IO has a
  bounded max buffer.
- Boundary parsers constrain IDs, strings, coordinates, telemetry, enums, stop order, feedback,
  observations, and TTN shapes. Global handling maps oversized/malformed input to safe responses.
- Redis rate limits cover admin login, sender login, public feedback, sender observation/trip writes,
  TTN ingress, device writes, and route-stop writes. Limits fail closed when Redis is unavailable.
- Rate-limit keys use the socket peer address and deliberately do not trust forwarded headers until
  deployment topology explicitly configures a proxy. A proxy deployment must define and test trusted
  hops or attackers may share a limiter bucket or evade intended client identity.
- Vehicle, route, and stop CRUD routes expose POST/PUT/DELETE handlers without the newer validation
  and rate-limit middleware. Authentication is present from the server mount, but abuse and error
  boundaries are weaker than devices/route-stops.

### CORS finding — cross-origin admin writes remain incomplete

`server.ts` applies one CORS configuration to Express and Socket.IO. The origin allowlist is exact
match based and credentials are enabled, but `methods` contains only `GET` and `POST`; protected
vehicle, route, and stop routers use `PUT` and `DELETE`. In a genuinely cross-origin deployment,
browser preflight can reject valid admin mutations. Production also always includes localhost origins
and defaults `FRONTEND_URL` to localhost unless deployment configuration overrides it.

Status: **New Finding**, Medium. Fix through the approved topology/origin contract; do not broaden
origins or methods without a deployment matrix and REST/Socket tests.

## 6. Secrets, Data Protection, and Logging

Strengths:

- bcrypt protects admin and tracking-source secrets; device DTOs omit `secretHash`.
- Production startup rejects known placeholder/weak JWT and TTN secrets, requires them to differ, and
  skips normal production seed.
- `.env` files are ignored and tracked examples contain placeholders; no real secret was found in
  the inspected tracked files.
- Boundary failures log stable categories. Operational signals are allowlisted, bounded,
  correlation-keyed JSON and exclude bodies, coordinates, URLs, headers, credentials, hashes, and
  exception messages.
- Redis connection events no longer print the credential-bearing URL.

Residual concerns:

- Production Compose injects secrets through environment variables and shows no secret manager,
  rotation procedure, or TLS for DB/Redis traffic.
- Feedback persists client IP without a documented purpose, retention period, access restriction,
  deletion path, or incident procedure.
- Stdout signals have no durable retention/access policy or alert delivery. Process-local cooldown
  maps reset on restart and do not provide reliable event accounting.
- The CI static logging check helps prevent obvious leaks but is not a secret scan or dependency
  vulnerability scan.

## 7. DevOps, Runtime, and Observability

Production Compose has Postgres/Redis healthchecks, dependency-gated backend startup,
migrations-before-start, production seed suppression, restart policies, and compiled Node/Next
images. `/health` is liveness-only; `/ready` checks a DB query and Redis ping and emits a readiness
signal. Backend and frontend application-level healthchecks are not present in production Compose,
so orchestration cannot use the application readiness contract.

The repository has a push/PR GitHub Actions job that installs lockfile dependencies and runs
`scripts/ci-checks.sh`. The script covers backend build/boundary/redaction tests, Prisma validation,
frontend lint/build, both Compose configs, unsafe dynamic-log search, and agent-workflow validation.
It does not provide dependency advisory scanning, SAST/DAST, container scanning, live integration in
CI, deployment approval, migration rollback, backup/restore, or release promotion. The default
Turbopack build is constrained by the current restricted runner; the current Frontend webpack build
passed and the remaining CI limitation is recorded rather than hidden.

The signal contract covers startup/readiness, ingestion outcomes, source staleness, canonical
selection, and dependency failures. It does not provide an operator-facing durable series for
per-transport accepted/rejected/duplicate counts, latency, persistence failure, queue/backpressure,
recovery, or dashboard query/export failure.

Production still publishes DB/cache ports and uses floating `node:22-alpine`/`redis:alpine`-style
tags. No TLS/reverse proxy, backup target, restore drill, log destination, alert route, or
operational owner is documented. Provider and physical-device controls remain **Unable to Verify**.

## 8. Findings and Recommendations

| ID | Finding | State | Priority | Recommended next action |
|---|---|---|---|---|
| SEC-01 | Production DB/Redis host exposure and missing evidenced private boundary/auth policy | **Still Present** | High | Define topology first; remove unnecessary host ports, then document private networking, firewall, Redis auth/TLS, and access ownership. |
| SEC-02 | Operational signals are not durable or alertable | **Still Present** | High | Select a redacted log/metrics sink, define per-transport freshness/error alerts, access policy, and a recovery drill. |
| SEC-03 | CORS methods omit admin `PUT`/`DELETE`; production origin defaults are unsafe for deployment | **New Finding** | Medium | Make the approved origin/method matrix explicit and test REST plus Socket.IO preflight/handshake behavior. |
| SEC-04 | Admin JWT lifetime configuration is ignored; browser token is JS-readable and proxy checks presence only | **Still Present** | Medium | Align issuer with approved session policy, move toward secure server-managed session handling, and validate proxy/backend behavior together. |
| SEC-05 | Legacy vehicle/route/stop writes lack bounded parsing, rate limits, and consistent safe errors | **Still Present** | Medium | Bring all admin writes into the shared validation/error/rate-limit boundary before multi-operator use. |
| SEC-06 | Admin authorization has no least-privilege roles or sensitive-action audit | **Still Present** | Medium | Define roles for device provisioning, credential rotation, raw diagnostics, and export before those workflows ship. |
| SEC-07 | Feedback IP/privacy lifecycle is undocumented and unbounded in current evidence | **Partially Resolved** | Medium | Define purpose, retention/deletion, staff access, and disclosure before expanding feedback or research use. |
| SEC-08 | Deployment/provider/physical-device security controls cannot be verified | **Unable to Verify** | High for production claims | Obtain an approved disposable/deployment evidence set covering TLS, secret storage, firewall, provider, firmware, provisioning, and recovery. |
| SEC-09 | T7 research role/export/retention boundary is specified but not implemented | **Partially Resolved** | High for T7 | Add server-side roles and allowlisted query/export/retention boundaries only after the Level 1 gate and D-006 target evidence are complete. |

## 9. Roadmap Impact and Decisions

This audit introduces no owner decision. Existing decisions remain authoritative:

- D-001 keeps the release at a controlled demonstration/pilot boundary.
- D-002 permits bounded raw diagnostics for comparing Mobile, LoRaWAN, and ESP32; retention/access/
  deletion implementation remains gated.
- D-003 requires topology/origin facts before configuration alignment.
- D-004 defines the three-device research boundary and authenticated Dev Dashboard scope.
- D-005 keeps stale observability separate from Trip closure.
- D-006 approves an isolated T7 disposable target and safer bounded export controls, with exact Redis
  digest and execution evidence still required.

Security work should inform topology/origin, observability, and device/research tasks. Repository CI
passing is not deployment approval. Production Readiness is now the next eligible profile and must
synthesize these findings with all current domain reports.

## 10. Unknowns, Confidence, and Handoff

Unknowns include deployed network exposure, TLS termination, firewall/security groups, secret manager
and rotation, Redis/DB encryption, backup/restore, alert routing, production log access, dependency
advisory state, provider configuration, firmware, physical device access, and live browser/device
behavior.

Confidence is **high** for repository-visible auth, CORS, middleware, Compose, CI, and logging
contracts; **medium** for runtime integration because no live production topology or full disposable
pipeline was rerun in this audit; and **low** for provider, physical-device, and operational-response
claims.

Security, DevOps & Observability is **Complete / Validated** at the current evidence baseline. The
next sequential profile is Production Readiness. Do not mark the system production-ready without
resolving or explicitly accepting the High findings and documenting unavailable external evidence.
