# Security, DevOps & Observability Audit

Audit metadata:
- Evidence baseline: 6697acbd62c740039722769588b1c464231e5ce1 plus approved D-009/D-010:A and the current T12 implementation working tree
- Evidence scope: every validated predecessor report; docs/decision-queue.md; docs/research/; docs/testing/; docker-compose.yml; docker-compose.prod.yml; env.example; shuttle-tracking-backend Docker/startup/config/middleware/controllers/routes/services/tests; shuttle-tracking-web authentication/proxy/client files; scripts/ci-checks.sh; and GitHub CI configuration
- Reviewed at: 2026-08-01T14:45:45+07:00
- Validation state: Validated
- Predecessor baselines: Discovery through Dashboard & UX @ 6697acbd62c740039722769588b1c464231e5ce1 plus their T12 implementation re-audit addenda

## 1. Executive Summary

The repository has meaningful controlled-MVP protections: sender JWTs bind source/vehicle/credential version and are rechecked for Socket.IO writes; TTN webhook auth fails closed; boundary parsing and selected Redis rate limits exist; device DTOs redact credential hashes; research reads recheck persisted DEV/SUPER_ADMIN role and bound session/time/export behavior; startup rejects weak/default JWT and TTN secrets; and readiness plus allowlisted operational signals exist.

D-001=C cannot rely on those controls alone. Current admin authentication verifies only user identity,
not D-007 hierarchy or sensitive-action authorization. T10's new PUT route is bounded by parser and
admin write rate limit but inherits that identity-only admin boundary. Production topology, TLS,
proxy/trusted address, secret source/rotation, data-service isolation, backup/restore, log/alert
route and incident ownership are all D-008 gaps. D-009 now approves public-feedback/IP lifecycle,
but no notice, retention/deletion, or server authorization/audit implementation exists. T11/T12 must
not create privileged operations until their server requirements are complete.

A new source finding is material: server Socket.IO invalid-payload handling writes the untrusted rawData value to console.warn. This can log coordinates or arbitrary payload content, contradicting the redacted-log invariant. It is a production-readiness blocker and needs a bounded corrective maintenance or approved task path; this audit does not change code.

## 2. Scope and Freshness

This profile reviews trust boundaries, authorization, input/abuse controls, secrets, privacy, logging, CI, Compose/runtime and operational observability. It is static repository evidence only, not penetration testing, secret scanning, deployed TLS/proxy, provider/firmware, backup or incident validation.

Every required predecessor is validated at 6697acb plus approved D-009/D-010:A and T12 implementation
evidence. These records do not prove deployment controls, actual retention/purge execution, or
external runtime behavior.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Sender and Socket.IO writes were weakly authenticated | Resolved | Sender tokens and per-write source/vehicle/version revalidation remain enforced. |
| TTN webhook auth was optional | Resolved | Required bearer secret uses timing-safe comparison and source-type checks. |
| Device credential hashes were exposed | Resolved | Device response projections and boundary tests omit secret material. |
| Raw research access/export had no least-privilege boundary | Partially Resolved | Research middleware rechecks DEV/SUPER_ADMIN and routes are session/time bounded with fixed-field export. D-007 account lifecycle and operational audit controls remain broader gaps. |
| Admin authorization enforced least privilege | Resolved for D-007/D-010:A scope | Current persisted roles are rechecked on every admin request, unknown roles fail closed, and the hierarchy/fresh-auth route middleware protects T12. General lifecycle remains future work. |
| Public feedback IP had an approved privacy lifecycle | Partially Resolved | T12 adds notice, receipt, 30-day IP clearing, 180-day content/restore expiry, fresh-auth deletion/restore, and content-free audit. No executed purge/migration/backup evidence exists. |
| Sensitive request payloads stayed out of logs | New Finding | server.ts logs Socket.IO invalid rawData in a console.warn call. Untrusted payload can contain coordinates or arbitrary content. |
| Production data services had an evidenced private boundary | Still Present | Production Compose publishes DB/Redis ports and has no selected private network, Redis auth/TLS, firewall, or provider control evidence. |
| Production origin/TLS/proxy behavior was defined | Still Present | CORS includes only GET/POST despite admin PUT/DELETE routes; localhost defaults/fallbacks remain; D-008 topology, TLS, proxy and trusted-address facts are missing. |
| Observability was durable and alertable | Still Present | Allowlisted stdout signals and ready endpoint exist, but no metric/log sink, alert route, on-call, durable audit log or recovery drill is evidenced. |
| CI proved security/release readiness | Partially Resolved | CI checks build, boundaries, Prisma, frontend, Compose and dynamic-log patterns. It lacks dependency/secret/container scanning, live integration, deployment approval, rollback/restore and promotion evidence. |

## 4. Trust Boundary Assessment

| Boundary | Existing control | Required remaining control |
| Public rider/feedback | Rate limit, payload parser, public notice/receipt, and lifecycle source code. | Runtime IP/purge/backup verification. |
| ADMIN web/API | Persisted-role JWT boundary, role middleware, and fresh authentication for privileged Feedback actions. | General account lifecycle and runtime access review. |
| Mobile/ESP32 sender | Source-bound JWT, credential version, rate limit and boundary parser. | T11 installation/claim/recovery lifecycle and external app/device evidence. |
| TTN webhook | Separate secret, parser, rate limit and source type. | Provider registration/dedup/network boundary evidence. |
| Research DEV/SUPER_ADMIN | Persisted-role recheck and bounded routes/export. | Preserve it while resolving D-007 lifecycle/deletion/backup/export policy. |
| PostgreSQL/Redis | Application credentials and ready checks. | Selected topology, private access, TLS/auth/persistence/backup/restore and owner. |

## 5. Findings and Required Placement

- SEC-01 High: raw Socket.IO payload logging violates the sensitive-log baseline. Record and repair it in a bounded approved work unit with a regression check; do not leave it as normal diagnostic output.
- SEC-02 High: D-008 leaves private data-service exposure, TLS, secrets, backups, logs/alerts and incident ownership unresolved. T9 is blocked and must not guess them.
- SEC-03 High: D-007/D-010:A is implemented for the T12 authorization scope. T11 must reuse server middleware and must not authorize from UI state or broad identity-only admin tokens.
- SEC-04 Medium: CORS methods omit PUT/DELETE and origin/proxy trust remain configuration gaps. They belong to T9 after a topology/origin matrix is approved.
- SEC-05 Medium: T12 implements D-009's Feedback policy in source/test form. Target migration,
  retention/purge, backup, and human workflow evidence remain required before release.
- SEC-06 Medium: legacy vehicle/route/stop write boundaries are less consistently parsed/rate-limited than newer admin endpoints; do not expand their authority during T10 without task-specific boundary tests.

## 6. Observability and Operations

Operational signals intentionally allowlist metadata and omit secrets, coordinates, URLs and bodies, but rawData logging is an exception that must be removed. Current signals are process-local stdout without transport accepted/rejected/duplicate durable metrics, latency series, persistence/recovery visibility, dashboard/export failure monitoring, retention/access policy or alert delivery. The ready endpoint tests only database/Redis dependency reachability and production Compose does not consume it as an application healthcheck. No deployment, provider, firmware, secret manager, firewall, backup/restore or incident response exercise is evidenced.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is blocked by D-008 and will need origin, CORS, proxy/trusted address, TLS, secret, data placement
and operations facts. T10 is complete for bounded route operations. T11 needs lifecycle/Android
evidence and server authorization/audit placement. T12 is complete for its RBAC/re-authentication/
audit/retention source/test scope, while runtime rollout remains unverified. The rawData logging issue
must be assigned a bounded corrective work unit before production readiness; this audit does not
broaden the requested roadmap batch to implement it.

Confidence is High for code-visible controls and gaps, Medium for CI/static operational evidence, and Low for TLS, deployment, provider, physical device, attack resistance, backups and incident outcomes.

## 8. Handoff

Security, DevOps & Observability is validated at 671b712. Production Readiness is now eligible, but it must carry forward every unresolved high-impact gate and the new sensitive-log finding.

## 9. T12 Implementation Re-audit — 2026-08-01

**Finding: administrative authorization was identity-only and privileged feedback operations had no
fresh-auth boundary — Resolved for D-007/D-009/D-010:A.** The server validates the signed non-sender
identity, re-fetches the current persisted role on each administrative request, denies unknown roles,
and applies a typed hierarchy. Token role claims are not used for authorization. Super Admin/Dev
feedback routes use server role middleware and delete/restore additionally require a signed
reauthentication timestamp within 15 minutes; selected reason values prevent free-form rider content
from entering the deletion audit.

**Finding: public feedback/source visibility could retain or expose unnecessary data — Partially
Resolved.** Public feedback returns only a receipt; staff feedback DTOs omit IP; safe source DTO tests
prove source ID, credentials, credential lifecycle, priority, raw data, and arbitrary errors are not
returned. Retention code clears IP after 30 days and removes case content on its eligible cutoff while
preserving content-free actions. CI/build/schema and deterministic tests pass, but actual retention
execution, log observation, migration rollout, backup copies, proxy IP behavior, and multi-instance
scheduler behavior are **Unable to Verify**.

SEC-01 (raw Socket.IO invalid-payload logging), D-008 topology/TLS/operations, and external device
security remain release blockers.
