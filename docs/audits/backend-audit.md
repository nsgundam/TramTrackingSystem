# Backend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: cdedcc2fd82ab264e2176716ac23a74c948e1a28
- Evidence scope: docs/project-knowledge-base.md, Product and Architecture audits,
  docs/decision-queue.md, docs/research/, docs/tasks/,
  docs/operations/university-server-network-handoff.md, docker-compose.prod.yml,
  env.production.example, shuttle-tracking-backend/package.json,
  shuttle-tracking-backend/docker-entrypoint.sh, shuttle-tracking-backend/src/,
  shuttle-tracking-backend/prisma/, shuttle-tracking-backend/tests/, scripts/ci-checks.sh,
  and scripts/test-production-topology.mjs
- Reviewed at: 2026-08-07T19:49:20+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md, docs/audits/product-audit.md, and docs/audits/architecture-audit.md @ cdedcc2fd82ab264e2176716ac23a74c948e1a28

## 1. Executive Summary

The backend has coherent bounded ingestion for Mobile Socket.IO, ESP32 HTTP, and LoRaWAN/TTN webhook traffic. Each retains its own authentication boundary and converges on validation, source ownership, canonical selection, and Operations/Trip services. Sender JWTs bind source, vehicle, and credential version; Socket.IO revalidates writes. The public projection omits internal source identity.

T5/T6/T7 remain distinct: Operations owns transactional trip lifecycle and sampled canonical history; canonical-state owns versioned transient public/realtime state; research services record and query bounded raw diagnostic evidence. T8 changes only the frontend consumer, so it leaves these backend authorities unchanged.

D-001=C makes T10/T11/T12 product requirements. T10 now supplies its bounded server command:
authenticated replacement validates active stop membership, assigns contiguous order, replaces the
sequence transactionally, and invalidates public cache after success. T12 supplies persisted current-role
validation, hierarchical authorization, fresh-auth protection, Feedback lifecycle/retention, and a
safe source-health DTO. Trip and
TrackingSource lack Mobile installation/claim state, receipt-time lastAcceptedAt, close reason/closed-at,
force-close audit, and protected history reads. These remain separate gates.

T9 adds one typed runtime authority used by Express/Socket.IO, Prisma, Redis, CORS, proxy trust,
client addressing, and the listen port, with fail-closed production validation before migrations.
It changes configuration boundaries, not the three ingestion/canonical pipelines.

## 2. Scope and Freshness

This profile reviews routes, controllers, middleware, Socket.IO, validation, canonical/operations/research services, schema, errors, rate limits, and backend tests. It is not a running-service, penetration, provider, hardware, Android, or production topology test.

Discovery, Product, and Architecture are validated at `cdedcc2...`. The preceding Backend baseline
was `82f4d97...`. Backend-relevant changes are `shuttle-tracking-backend/docker-entrypoint.sh`,
`package.json`, `src/config/prisma.ts`, `src/config/redis.ts`, `src/config/runtime.ts`,
`src/config/validate-runtime.ts`, `src/middleware/rate-limit.ts`, `src/server.ts`,
`tests/test_t9_runtime_config.js`, plus `docker-compose.prod.yml`, `env.production.example`,
`scripts/ci-checks.sh`, `scripts/test-production-topology.mjs`, the T9 task/runbook, and current
predecessor/decision evidence. `npm --prefix shuttle-tracking-backend run check` and the static
topology test pass. No university runtime, forwarded-hop, migration, Redis recovery, load, or proxy
path was exercised.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Sender/trip identity was weak | Resolved | Sender claims bind source, vehicle, and credential version; HTTP/trip routes authenticate sender and Socket.IO revalidates on each write. |
| Three transports had divergent canonical paths | Resolved | Mobile Socket.IO, ESP32 HTTP, and TTN webhook enter transport-specific validation then shared observation/canonical processing. |
| Trip lifecycle had competing writers | Resolved | Operations owns start, virtual start, active-trip validation, end, vehicle repair, and sampled history transactions. |
| Raw research diagnostics were absent | Resolved | T7 stores bounded raw observations and exposes protected research/metric/export/lifecycle services separately from canonical public state. |
| Public state could be stale/consumer-owned | Partially Resolved | Canonical state has server receive-time freshness and explicit service states; T8 corrects frontend expiry projection. A C-scope public service-state explanation and operational exception surface remain absent. |
| Route-stop mutation does not invalidate public cache | Resolved | T10's bounded PUT replacement validates active membership, deletes/creates the full sequence inside `prisma.$transaction`, then invalidates public cache; create/delete now do the same after success. Pure validation/order tests and repository CI passed, but no stateful DB/cache runtime was run. |
| Role and least-privilege enforcement existed | Resolved for D-007/D-010:A scope | authenticateToken re-fetches an allowlisted persisted role on every admin request; role and fresh-auth middleware protect the T12 routes. General account lifecycle remains out of scope. |
| Protected trip history and exception reads existed | Still Present | No route/controller offers filtered trip list/detail, timeout exception, or source freshness operations views. |
| Mobile enrollment/claim and D-005 lifecycle existed | Still Present | No installation identity, claim, receipt-time lastAcceptedAt, timeout scheduler/worker, close reason, closedAt, atomic force-close, or audit records exist. |
| Feedback triage lifecycle existed | Partially Resolved | T12 adds public receipt, Super Admin/Dev list/update/delete/restore boundaries, exact status transitions, content-free audit, retention sweep, and safe source health. No target migration or retention execution is evidenced. |
| TTN duplicate/identity compatibility is verified | Unable to Verify | The webhook handles documented payload shapes and secret validation; provider aliases, duplicate delivery, gateway behavior, and field delivery remain unavailable. |
| Production runtime, CORS, proxy, and data-service configuration were fail-closed | Resolved | T9 centralizes and validates production database/Redis authentication, application secrets, exact frontend origin, narrow proxy trust, client address, and port before migration; deterministic tests cover safe failures without exposing configured values. Actual target behavior remains externally Unable to Verify. |

## 4. Boundary Assessment

| Boundary | Current controls | Remaining C-scope requirement |
|---|---|---|
| Mobile Socket.IO | JWT handshake, per-write source/vehicle/version revalidation, acknowledgement and rate limit. | Separate Android acceptance contract, installation session/claim, reconnect/no-offline semantics, new lifecycle fields. |
| ESP32 HTTP | Sender JWT, parser, ownership and coordinate validation, shared processing. | Physical firmware/provisioning evidence and D-005 timeout behavior. |
| LoRaWAN/TTN webhook | Bearer secret, source-type check, decoded-payload parsing, shared processing. | Provider delivery/duplicate evidence and owner-controlled operations path. |
| Admin REST | Persisted current-role validation, reusable hierarchy, fresh-auth middleware, and parsers/rate limits on selected routes. | D-012 before expanding general account/source lifecycle, privileged deletion, and recovery actions. |
| Research reads/export | Research access middleware, bounded/session-scoped fixed-field API and lifecycle records. | Preserve research-only access; do not reuse as public/admin operations views. |

## 5. Required Task Placement

- T9 now aligns origins, proxy trust, CORS, Socket.IO and fail-closed production configuration to
  D-008. Preserve the central parser and safe failure taxonomy; do not invent actual host/proxy
  values or claim production readiness without University Server/Network acceptance evidence.
- T10 is complete for its exact backend scope. A future approved disposable target is required to test an actual cache/DB public read; no controller must rely on cache TTL instead.
- T11 must extend Operations and schema atomically. Timeout, sender observation, normal end, and emergency force-close must share lock/order and idempotency rules; only accepted observations may update backend receipt-time lastAcceptedAt. Existing sender routes cannot be relabelled as the approved Mobile product.
- T12's endpoints enforce role/re-authentication server-side, implement retention/deletion audit rules, and keep raw research data isolated. Runtime scheduling and migration execution remain separate release evidence.

## 6. Reliability, Security, and Observability

Canonical state and latest source snapshots remain Redis-backed and transient. Source-health and canonical freshness use related but distinct stored facts; process-local sweeps and global Socket.IO publication lack distributed ownership, replay, and capacity evidence. Boundary errors are typed in key paths, rate limits cover key sender/admin/feedback routes, and logs are designed to avoid secrets/continuous coordinates. T9 makes `req.ip` dependent on an explicit narrow Express proxy predicate rather than parsing forwarding headers in application code. Legacy CRUD validation/error consistency remains uneven. No conclusion about actual proxy trust, TLS, backups, Redis recovery, external alerts, or production incidents is possible without external validation.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff under D-008. T10/T12 are complete for their
bounded handoffs. T11 needs technical lifecycle parameters, external Android acceptance evidence,
and an exact handoff. T12 runtime migration/retention/concurrency evidence remains separate; no new
owner decision is proposed.

Confidence is High for code-visible backend boundaries and missing server models, Medium for checked-in test evidence, and Low for running infrastructure, concurrency under load, Redis recovery, devices, TTN, Android, and production operations.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed. D-012 still gates general account/source lifecycle controls;
external T9 and Android evidence cannot be inferred from backend tests.

Backend is validated at `cdedcc2...` for the T9 implementation impact. Frontend, Database,
Infrastructure & Device, and every downstream profile have now completed their dependent
revalidations.

## 9. T12 Implementation Re-audit — 2026-08-01

**Finding: admin JWTs supplied identity but no server role enforcement — Resolved for the approved
three-role scope.** `authenticateToken` now rejects sender/invalid tokens, loads the persisted user
on every request, and rejects missing or unknown roles. `requireMinimumRole` uses `DEV` >
`SUPER_ADMIN` > `ADMIN`; the feedback router requires Super Admin authority and the safe-health GET
requires Admin authority. Login and `POST /api/auth/reauthenticate` issue signed freshness claims;
delete/restore requires a current claim no older than 15 minutes.

**Finding: feedback capture had no accountable server lifecycle/privacy controls — Partially
Resolved.** Public capture returns only a receipt, creates a content-free audit event, and keeps IP
out of all staff responses. The case service enforces the exact transition graph and blocks deleted or
terminal-case mutation. Its retention sweep clears IP after 30 days and purges case content after 180
days or an expired restore window. Deterministic boundary tests, TypeScript, Prisma validation, and
CI pass; no database migration/retention execution or concurrent production run was authorized.

**Finding: safe source data was coupled to device management — Resolved for the new endpoint.**
`GET /api/admin/devices/health` uses a dedicated allowlist DTO and no write route. It omits source ID,
credential metadata, secret material, priority, payload/location/IP, research data, and arbitrary
errors. The pre-existing device-management API is unchanged and is not the T12 read-only view.
