# Security, DevOps & Observability Audit: Tram Tracking System

Re-audited: 2026-07-19

## 1. Executive Summary

Security boundaries are materially improved: non-LoRaWAN senders use short-lived source/vehicle/version-bound JWTs, Socket.IO revalidates each write, TTN fails closed without a secret, production startup rejects weak/default core secrets, and admin routes reject sender claims. Build/lint/test commands and production Docker targets are present.

The remaining high-risk issues are direct disclosure of TrackingSource secret hashes through authenticated device APIs, Redis URL logging that can disclose a credential-bearing connection string, absence of rate limits, inconsistent validation/error handling, and no CI or operational telemetry/error tracking. This is suitable only for a controlled MVP, not a public or daily operational release.

## Scope, Evidence, and Re-audit Status

Reviewed current Product, Architecture, Backend, Database, Infrastructure & Device, and Dashboard reports; previous Security report; auth/middleware/controllers; Compose/Docker/env files; backend/frontend packages and scripts; logging/config source. Backend test and frontend lint results from this audit round were reviewed. No live vulnerability database, production secret, deployment, log sink, metrics system, or penetration test was accessed.

| Prior finding | Re-audit status | Current evidence |
|---|---|---|
| Sender/trip/Socket.IO writes were weakly authenticated | **Resolved** | Sender JWT claims are bound and revalidated; protected HTTP/trip/socket boundaries reject unauthenticated writes. |
| TTN/webhook credential boundary was optional | **Resolved** | Missing TTN secret returns service unavailable; invalid bearer is rejected. |
| Device source lifecycle/rotation was incomplete | **Resolved** | Source credential version, active status, and rotation invalidation exist. |
| Production secret validation/bootstrap was unsafe | **Partially Resolved** | Entrypoint rejects defaults/weak core secrets and seed is development-only; actual deployment secret management is unverified. |
| Device API secret-hash exposure | **Still Present** | Device list/get/create/update serialize TrackingSource directly, including secretHash. |
| No rate limiting/abuse controls | **Still Present** | No rate-limit middleware/package/configuration is evidenced for login, feedback, or ingest. |
| Validation/error mapping was inconsistent | **Still Present** | Backend report confirms untyped resource inputs and generic 500 mapping remain. |
| CI/CD and deployment gates were missing | **Still Present** | No workflow files are present; local build/lint/test are not enforced by automation. |
| Health/readiness/production runtime were missing | **Partially Resolved** | Health/ready endpoints, production targets, migrations, and secret checks exist; no deployed monitor, runbook, or recovery evidence. |
| Logs/metrics/error tracking were insufficient | **Still Present** | Console logging only; no structured redaction, metrics, alerting, or frontend/backend error tracker. |
| Credential-bearing Redis URL is logged | **New Finding** | Redis connect handler logs REDIS_URL verbatim. |

## 2. Security Overview

Admin authentication uses bcrypt and JWT; admin middleware requires a userId claim and rejects sender-kind tokens. Sender login verifies source secret hash and emits a 15-minute token with source, vehicle, and credential version. Public viewers may connect to Socket.IO but cannot submit location without the sender token. TTN uses a separate bearer-secret webhook boundary.

## 3. Security Strengths

- Sender token expiry, binding, rotation/revocation revalidation, and ownership checks are present.
- Admin and sender token types are separated in middleware.
- TTN uses timing-safe comparison and fails closed when unconfigured.
- Production entrypoint rejects known/default/weak JWT and TTN secrets and prevents their reuse.
- Development seed does not create a built-in admin password; production seed is explicit one-time provisioning.
- Parameterized Prisma/raw tagged SQL is used for data access; no string-concatenated SQL injection path was found in reviewed queries.

## 4. Critical Security Issues

### High — Device API responses expose secret hashes

Authenticated device endpoints return raw TrackingSource records and include secretHash.

Impact: copied admin responses expose offline-verifiable credential hashes beyond the server boundary.

Recommendation: use an explicit safe response DTO for all device reads/mutations; never serialize secretHash; add a route test.

Priority: High. Difficulty: Easy.

### High — Redis URL is written to logs

The Redis connect handler logs the entire REDIS_URL. Managed Redis URLs commonly include usernames/passwords.

Impact: credential-bearing configuration can enter container logs, log aggregation, or support exports.

Recommendation: log only a redacted host/port or a static connection event; audit all configuration logging for secret-bearing values.

Priority: High. Difficulty: Easy.

### High — Public write boundaries lack abuse controls

Login, sender login, feedback, and ingestion have no evidenced rate/size limits. Feedback accepts public input and telemetry is high-frequency by design.

Impact: brute-force, spam, resource exhaustion, and noisy operational data can affect a controlled service before more advanced security controls exist.

Recommendation: add small route-specific request-size and rate limits, with stricter limits for auth/feedback and source-aware quotas for ingest; make rejected traffic observable.

Priority: High before public/daily use. Difficulty: Medium.

## 5. Authentication & Authorization Review

Admin and sender flows are now separate and structurally sound for MVP. There is no role/permission model: every valid admin token receives all admin access. Frontend stores the admin token in a cookie readable by client JavaScript; Security should treat XSS/session-storage posture as a future hardening item, while a server-managed HttpOnly session requires an intentional architecture change. No refresh-token, logout revocation, or admin credential lifecycle is evidenced.

## 6. Input Handling & Data Protection Review

GPS coordinates and sender/trip ownership are validated, but CRUD and feedback/resource inputs lack shared schemas and safe error taxonomy. Raw tagged SQL is parameterized; no file upload is found. Feedback stores message, optional vehicle, type, and IP address; retention/access policy is Not Found. Device secretHash exposure is the highest data-protection defect. TTN generic errors expose stack/details and should be normalized.

## 7. Secrets & Configuration Review

Templates use placeholders, while production Compose requires core secret values and entrypoint validates them. Configuration remains split across Compose, backend env, frontend build values, and runtime origins. Actual provider secret store, HTTPS termination, secret rotation operations, and whether committed local env files contain real values were not evaluated. Do not log connection URLs or tokens.

## 8. Dependency Hygiene Review

Lockfiles and npm ci support repeatable installs; package dependencies mostly use semver ranges. No automated vulnerability scan, dependency update policy, SBOM, or CI gate is present. Live advisory scanning is outside this audit and should occur before public release.

## 9. DevOps Overview

Backend builds with TypeScript and has a JWT boundary test; frontend lint passes with six warnings and no errors. Dockerfiles have production targets and entrypoint runs migrations. No CI workflow, deployment pipeline, rollback procedure, or enforced migration/smoke-test gate is found.

## 10. Build & Deployment Review

Local commands are usable but not policy-enforced. Production build/start, migration, secret validation, and readiness are good foundations. A deployment should not depend on development Compose defaults. Before production, automate build, backend test, frontend lint, migration validation, and a readiness smoke check; retain human approval for migrations until the topology/runbook is established.

## 11. Environment Management Review

Development and production configuration are distinguishable, but origin and provider values remain undocumented and can drift. Production Compose defaults some public URLs to localhost. D-003 remains the existing decision gate for origin/configuration order. No new provider decision is created.

## 12. Observability Overview

Health and readiness are available, Redis and pipeline events are logged, and source last-seen/freshness facts exist. There is no metrics endpoint, structured event schema, request/trace ID, alert rule, dashboard, error tracker, or deployed uptime monitor. Dashboard UX correctly identifies that no truthful user-facing connection/freshness state exists.

## 13. Logging Review

Current logs are console calls with varied free-text formats. Some use event-like fields, but no consistent severity, correlation, redaction, retention, or destination exists. Do not log REDIS_URL, bearer tokens, passwords, request bodies, or secret-derived error details. Replace the URL log first.

## 14. Monitoring & Alerting Review

Ready endpoint can support a basic monitor; it checks database and Redis. No evidence shows alerts for readiness failure, socket outage, source stale threshold, failed migrations, ingestion rejection volume, or sampled-history failure. A minimal operational set is readiness uptime, error count, source freshness, ingestion rejection rate, and migration/startup outcome.

## 15. Error Tracking Review

Backend errors go to console. Frontend catches several errors but reports them only inline, alert, or console. No aggregation or alerting exists. Add structured, redacted server errors and one frontend/backend error-reporting capability after production topology is selected; vendor choice is not required now.

## 16. Recommended Improvements

### Recommendation 1: Remove sensitive configuration and hash exposure

### Problem

Device responses include secretHash and Redis logging includes the full connection URL.

### Impact

Credentials or reusable credential material can reach clients and logs.

### Recommendation

Add safe device response DTOs and redact config logging; test both conditions.

### Why

These are direct, low-effort confidentiality fixes.

### Priority

High — needed now.

### Difficulty

Easy.

### Learning Topic

Data minimization and secrets-safe logging.

### Related Files

devices controller and Redis config.

### Recommendation 2: Add bounded abuse controls and shared validation

### Problem

Public/auth/ingest endpoints lack rate limits and resource schemas.

### Impact

Spam, brute-force, malformed data, and resource exhaustion are easier than necessary.

### Recommendation

Set route-specific request-size/rate limits and validate auth, feedback, device, trip, route-stop, and observation payloads with a shared schema/error mapper.

### Why

A small boundary layer protects the MVP without introducing a complex security platform.

### Priority

High before public/daily use.

### Difficulty

Medium.

### Learning Topic

Defense in depth, input schemas, and rate limiting.

### Related Files

server, auth, ingest, feedback, and CRUD routes.

### Recommendation 3: Establish minimal production observability and CI gates

### Problem

Console logs and manual commands do not provide reliable incident detection or deployment assurance.

### Impact

Failures may be discovered by riders/operators, and regressions can be deployed unchecked.

### Recommendation

Automate build, backend test, frontend lint, and configuration/migration validation. Emit redacted structured logs, monitor ready endpoint, and alert on startup/readiness, ingestion rejections, and stale source threshold.

### Why

This is the minimum useful operating signal; it does not require selecting a full observability suite.

### Priority

High before production.

### Difficulty

Medium.

### Learning Topic

CI gates, health checks, structured logging, and service-level signals.

### Related Files

package scripts, Docker entrypoint, server, tracking service, and Compose.

## 17. Security/DevOps/Observability Learning Topics

1. Trust boundaries and short-lived service tokens — implemented, review tests next.
2. Data minimization and redacted logging — needed now.
3. Schema validation plus rate limits — before public traffic.
4. CI gates and migration safety — before production.
5. Health, error, and freshness signals — before daily operations.

## Roadmap Impact

No new owner decision is created. D-003 remains the production configuration gate; D-001 governs whether daily-operation observability is required now. Remove hash/URL leakage now; rate limits, validation, CI, and basic monitoring are before public/daily release. Production Readiness must treat these High findings as blockers for a “ready” result.

## Assumptions and Unknowns

- Static repository evidence only; no live penetration test, dependency advisory scan, secrets, provider log sink, or deployed monitor was accessed.
- HTTPS/TLS, provider security groups, backup encryption, secret rotation operations, and actual CI policy are unknown.
- No formal role model or public release scope has been approved.

## Confidence

**High** for code/config-visible boundaries, exposure, and absence claims. **Medium** for production posture without deployed evidence. **Low** for vulnerability status without a live advisory scan.

## Required Decisions

- **D-001** determines the operating scope and therefore which observability work is mandatory before release.
- **D-003** remains the configuration/origin sequencing gate.

No new decision is required to redact logs, remove secret hashes, add validation/rate limits, or automate current checks.

## 18. Audit Limitations

No live attack, penetration test, runtime log inspection, hosted deployment, production secret, traffic/load test, dependency advisory database, or CI provider was accessed.

## 19. Handoff

This report supersedes the prior Security, DevOps & Observability Audit. Production Readiness must synthesize these High findings with the accepted domain reports and cannot mark a public/daily release ready until the leakage, abuse-control, and minimum operational-signal gaps are resolved or explicitly risk-accepted.
