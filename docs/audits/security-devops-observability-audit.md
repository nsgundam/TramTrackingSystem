# Security, DevOps & Observability Audit

Audit metadata:
- Evidence baseline: 82f4d97d8609d73f79aa74eea6efaadaa34238d9
- Evidence scope: every validated predecessor report; docs/decision-queue.md; docs/research/; docs/testing/; docs/tasks/M-20260807-01-redact-socket-invalid-payload-logging.md; docs/tasks/M-20260807-02-secure-simulator-test-artifacts.md; docs/tasks/M-20260807-03-redact-manual-simulator-output.md; docker-compose.yml; docker-compose.prod.yml; env.example; shuttle-tracking-backend Docker/startup/config/middleware/controllers/routes/services/tests; shuttle-tracking-web authentication/proxy/client/simulator/test/ignore files; scripts/ci-checks.sh; and GitHub CI configuration
- Reviewed at: 2026-08-07T16:40:54+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md, docs/audits/product-audit.md, docs/audits/architecture-audit.md, docs/audits/backend-audit.md, docs/audits/frontend-audit.md, docs/audits/database-audit.md, docs/audits/infrastructure-device-audit.md, and docs/audits/dashboard-ux-audit.md @ 6905fe4ceedc621ef16f6f1f3f32edcc58599f2f (atomic D-008 synchronization snapshot; later changes in this sealing pass are metadata-only)

## 1. Executive Summary

The repository has meaningful controlled-MVP protections: sender JWTs bind source/vehicle/credential
version and are rechecked for Socket.IO writes; TTN webhook auth fails closed; boundary parsing and
selected Redis rate limits exist; persisted administrative roles and fresh authentication protect the
T12 scope; device/Feedback DTOs redact sensitive fields; research reads are role/session/time/export
bounded; startup rejects weak/default JWT and TTN secrets; and readiness plus allowlisted operational
signals exist.

M-20260807-01 resolves SEC-01 at source/test level: invalid Socket.IO input retains its safe mapped
response and allowlisted rejection signal but no longer writes `rawData` to console, and both a focused
source invariant plus the repository logging scan block regression. M-20260807-02/03 remove an unsafe
non-local/credential fallback, raw/token/coordinate output across both Mobile simulators, and generated
Playwright artifacts from Git/Docker context. These are static/test-tool results, not deployment,
device, provider, or credential-rotation proof.

D-001=C remains No-Go. D-008 now approves the university single-origin topology and responsibility
boundary, but the repository and external target have not implemented or verified TLS, proxy/trusted-
address behavior, secret rotation, data-service isolation, backup/restore, alerts or incidents. T11
still lacks the exact lifecycle handoff and external Android evidence; T12 migration/retention/runtime
acceptance is unverified; CI lacks broad security/release scanning; and the Dashboard & UX re-audit
identifies unresolved truthful-state/accessibility release risks.

## 2. Scope and Freshness

This profile reviews trust boundaries, authorization, input/abuse controls, secrets, privacy, logging, CI, Compose/runtime and operational observability. It is static repository evidence only, not penetration testing, secret scanning, deployed TLS/proxy, provider/firmware, backup or incident validation.

Every required predecessor is current at 82f4d97. Changed evidence is the approved D-008 decision
and responsibility handoff only. No penetration test, authenticated invalid-payload runtime journey,
simulator target, credential rotation, secret/history scanner, deployed TLS/proxy, provider/firmware,
backup, restore,
or incident exercise was run.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Sender and Socket.IO writes were weakly authenticated | Resolved | Sender tokens and per-write source/vehicle/version revalidation remain enforced. |
| TTN webhook auth was optional | Resolved | Required bearer secret uses timing-safe comparison and source-type checks. |
| Device credential hashes were exposed | Resolved | Device response projections and boundary tests omit secret material. |
| Raw research access/export had no least-privilege boundary | Partially Resolved | Research middleware rechecks DEV/SUPER_ADMIN and routes are session/time bounded with fixed-field export. D-007 account lifecycle and operational audit controls remain broader gaps. |
| Admin authorization enforced least privilege | Resolved for D-007/D-010:A scope | Current persisted roles are rechecked on every admin request, unknown roles fail closed, and the hierarchy/fresh-auth route middleware protects T12. General lifecycle remains future work. |
| Public feedback IP had an approved privacy lifecycle | Partially Resolved | T12 adds notice, receipt, 30-day IP clearing, 180-day content/restore expiry, fresh-auth deletion/restore, and content-free audit. No executed purge/migration/backup evidence exists. |
| Sensitive request payloads stayed out of logs | Resolved | M-20260807-01 removes the direct Socket.IO `rawData` console path while preserving safe rejection metadata/response. Focused source assertions and CI scanning guard regression; deployed log observation is Unable to Verify. |
| Checked-in Mobile simulators failed closed and minimized output | Resolved | M-20260807-02/03 require the Mobile credential, make the automated target local/configurable, restore one-shot behavior, and keep token claims/raw responses/coordinates out of both tools. Four deterministic tests pass; no simulator target was contacted. |
| Removed fallback credential validity and rotation were evidenced | Unable to Verify | A credential literal existed in Git history. Current tracked source and local ignored env inspection do not prove whether it was ever accepted externally or rotated; the authorized owner must assess/rotate any corresponding source before target use. |
| Production data services had an evidenced private boundary | Still Present | D-008 requires private/authenticated DB/Redis, but production Compose still publishes both ports and no firewall/runtime control is evidenced. |
| Production origin/TLS/proxy behavior was defined | Partially Resolved | D-008 defines one TLS proxy origin and owners; CORS still omits PUT/DELETE, localhost defaults remain, and no actual proxy/certificate/trusted-address result exists. |
| Observability was durable and alertable | Still Present | Allowlisted stdout signals and ready endpoint exist, but no metric/log sink, alert route, on-call, durable audit log or recovery drill is evidenced. |
| CI proved security/release readiness | Partially Resolved | CI checks builds, boundaries, Prisma, frontend, Compose, rawData logging, simulator config/output, and generated artifacts. It lacks dependency/secret-history/SAST/container scanning, live integration, migration target, deployment approval, rollback/restore, and promotion evidence. |

## 4. Trust Boundary Assessment

| Boundary | Existing control | Required remaining control |
| Public rider/feedback | Rate limit, payload parser, public notice/receipt, and lifecycle source code. | Runtime IP/purge/backup verification. |
| ADMIN web/API | Persisted-role JWT boundary, role middleware, and fresh authentication for privileged Feedback actions. | General account lifecycle and runtime access review. |
| Mobile/ESP32 sender | Source-bound JWT, credential version, rate limit and boundary parser. | T11 installation/claim/recovery lifecycle and external app/device evidence. |
| TTN webhook | Separate secret, parser, rate limit and source type. | Provider registration/dedup/network boundary evidence. |
| Research DEV/SUPER_ADMIN | Persisted-role recheck and bounded routes/export. | Preserve it while resolving D-007 lifecycle/deletion/backup/export policy. |
| PostgreSQL/Redis | Application credentials, ready checks, and an approved private-service owner contract. | Implement private access/auth/persistence and obtain actual backup/restore evidence. |

## 5. Findings and Required Placement

- SEC-01 High: **Resolved at source/test level by M-20260807-01.** Preserve the response/signal and both regression guards; runtime/deployed log observation remains unavailable.
- SEC-02 High: D-008 resolves the logical boundary and assigns owners, but source-visible port/
  origin gaps and every external TLS/secret/backup/alert/incident result remain unresolved. T9 may
  implement only its exact repository handoff and must not guess runtime facts.
- SEC-03 High: D-007/D-010:A is implemented for the T12 authorization scope. T11 must reuse server middleware and must not authorize from UI state or broad identity-only admin tokens.
- SEC-04 Medium: CORS methods omit PUT/DELETE and origin/proxy trust remain configuration gaps. The
  approved D-008 matrix places them in T9.
- SEC-05 Medium: T12 implements D-009's Feedback policy in source/test form. Target migration,
  retention/purge, backup, and human workflow evidence remain required before release.
- SEC-06 Medium: legacy vehicle/route/stop write boundaries are less consistently parsed/rate-limited than newer admin endpoints; do not expand their authority during T10 without task-specific boundary tests.
- SEC-07 Medium: the removed simulator credential literal's historical external validity/rotation is
  **Unable to Verify**. An authorized owner must assess/rotate it before the corresponding sender is
  used on an approved target; do not infer compromise or safety from repository source alone.

## 6. Observability and Operations

Operational signals now consistently allowlist metadata and omit secrets, coordinates, URLs and
bodies across the repaired Socket.IO/server and checked-in Mobile simulator paths. They remain
process-local stdout without accepted/rejected/duplicate durable metrics, latency series,
persistence/recovery visibility, dashboard/export failure monitoring, retention/access policy, or
alert delivery. The ready endpoint tests only database/Redis dependency reachability and production
Compose does not consume it as an application healthcheck. No deployment, provider, firmware,
secret manager, firewall, backup/restore, or incident response exercise is evidenced.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is eligible for an exact repository-side handoff under D-008; external origin, TLS, secret,
recovery, alert and capacity evidence remains gated. T10 is complete for bounded route operations. T11 needs lifecycle/Android
evidence and server authorization/audit placement. T12 is complete for its RBAC/re-authentication/
audit/retention source/test scope, while runtime rollout remains unverified. SEC-01 and the two
simulator-output paths are repaired, but this does not alter topology, operational, device, UX, or
release gates.

Confidence is High for code-visible controls and gaps, Medium for CI/static operational evidence, and Low for TLS, deployment, provider, physical device, attack resistance, backups and incident outcomes.

## 8. Handoff

Security, DevOps & Observability is validated at 82f4d97. Production Readiness and Roadmap follow:
SEC-01 is absent from the active source blocker list and D-008 policy is resolved, while T9
implementation/external acceptance, T11/device, runtime data lifecycle, operations, credential-
rotation uncertainty, and Dashboard truthfulness/accessibility findings remain open.

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

SEC-01 is superseded by the resolved maintenance evidence below. D-008 topology/TLS/operations,
runtime privacy controls, Dashboard truthfulness/accessibility, and external device security remain
release blockers.

## 10. M-20260807-01/02/03 Re-audit — 2026-08-07

The Socket.IO invalid-payload branch no longer has a direct console bypass; it emits the existing
allowlisted `ingestion.outcome` rejection and returns the same mapped acknowledgement/error-response.
`test_operational_signals.js` rejects any `rawData` console call and asserts the safe reason-code
signal remains; `scripts/ci-checks.sh` independently scans for the same regression.

Both Mobile simulators now require an explicit Mobile credential, avoid token/raw/coordinate output,
and fail before connection when it is absent. The automated tool has localhost as its only default,
requires explicit non-local URLs, and restores documented one-shot behavior. Playwright artifacts are
excluded from Git and Docker context. Focused suites (backend logging and four simulator/tooling
checks) plus full repository CI pass.

This is source/test evidence. No invalid authenticated Socket payload was sent to a running service,
no deployed logs were inspected, no simulator observation was emitted, and no external credential was
verified or rotated. SEC-01 is **Resolved** for source/test; runtime behavior and historical credential
state remain **Unable to Verify**.
