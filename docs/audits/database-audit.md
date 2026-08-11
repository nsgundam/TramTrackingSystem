# Database Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 1eec866b986b4cb4e802f7a48fac93e54e780699
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture audits, Backend/Frontend
  audits as cross-boundary context, docs/decision-queue.md, docs/research/, docs/tasks/,
  docs/operations/university-server-network-handoff.md, docker-compose.prod.yml,
  env.production.example, shuttle-tracking-backend/prisma/,
  shuttle-tracking-backend/src/config/prisma.ts, shuttle-tracking-backend/src/config/redis.ts,
  shuttle-tracking-backend/src/services/,
  shuttle-tracking-backend/src/middleware/research-access.ts,
  shuttle-tracking-backend/src/routes/research.route.ts, and shuttle-tracking-backend/tests/
- Reviewed at: 2026-08-08T00:07:30+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md, docs/audits/product-audit.md, and
  docs/audits/architecture-audit.md @ 1eec866b986b4cb4e802f7a48fac93e54e780699

## 2026-08-08 D-012 and Mobile-contract re-audit

Required predecessors are current at `1eec866...`; schema and migrations are unchanged. D-012 now
defines the future durable lifecycle requirements: enabled/session version for administrative
accounts; safe audit events; generated-once/rotatable Sender credentials; recoverable Trip-plus-GPS
tombstone with a 30-day restore window and named backup; and a separate final purge action that
retains lifecycle/audit evidence. These are approved requirements, not current columns, constraints,
jobs, or target evidence.

The external Mobile source confirms that the current `TrackingSource.secretHash`/credential-version
model is actively consumed by a client that persists and resubmits a static secret. T11 still needs
additive Installation/activation/refresh/claim state rather than overloading `TrackingSource` or
deleting provenance. No current migration may be represented as satisfying that lifecycle.

## 1. Executive Summary

PostgreSQL/PostGIS remains the durable system of record for master data, Trips, sampled canonical GPSTrack history, Feedback, TrackingSource registry, and T7 research records. Redis remains transient for latest source/canonical state and sampling admission. The additive T7 schema correctly keeps bounded research sessions, raw observations, aggregates, and lifecycle manifests distinct from public canonical state and sampled operational history.

D-001=C does not make the schema ready for T11. T10 uses the existing RouteStop relation for
active-membership-validated transactional delete/create replacement and assigns contiguous order in
the application boundary; it adds no schema migration. Trip lacks receipt-time lastAcceptedAt, close
reason, closed-at, Mobile installation/claim linkage, and force-close audit. T12 adds Feedback case
state, ownership, resolution, privacy/retention/deletion controls and the D-010:A ordinary-role
migration/default. General role/account lifecycle remains outside the approved scope.

## 2. Scope and Freshness

This profile reviews schema, migrations, constraints, indexes, data lifecycle/retention code, and database-facing services/tests. It does not certify a live migration, query plan, backup/restore, deletion, rollback, provider, hardware, or production database.

Required predecessors are validated at `1eec866...`. The preceding Database baseline was
`82f4d97...`. T9 changes `docker-compose.prod.yml`, `env.production.example`,
`shuttle-tracking-backend/src/config/prisma.ts`, `src/config/redis.ts`,
`src/config/runtime.ts`, `src/config/validate-runtime.ts`,
`tests/test_t9_runtime_config.js`, the T9 task/runbook, static topology/CI scripts, and current
predecessor/decision evidence. It adds authenticated/non-local fail-closed connection parsing,
private data networking, and backup/restore instructions; it changes no Prisma model, SQL migration,
data, retention rule, or query. Backend check/Prisma validation and the static topology test pass.
No actual placement, migration, backup, restore, retention, query plan, or provider action occurred.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| One active trip per vehicle required a database guard | Resolved | A partial unique index and T5 status/time checks remain in migrations; Operations uses a consistent vehicle-locking order. |
| Source identity and current assignment lacked structure | Partially Resolved | TrackingSource has type/status/priority/credential/current vehicle and GPSTrack source reference. There is no effective-dated assignment history for later operational explanations. |
| Bounded raw research storage was absent | Resolved | T7 adds ResearchSession, append-only ResearchRawObservation, aggregates and lifecycle run records with session/source/transport/time/dedupe/disposition/index fields. |
| Raw retention had no safe boundary | Partially Resolved | The 90-day backend-receive-time service requires a matching verified backup manifest and writes a lifecycle record. It is not a scheduled or statefully re-run production retention proof. |
| Sampled GPSTrack was raw/high-fidelity history | Still Present | GPSTrack remains throttled canonical samples. It must not be used for raw comparison, event replay, or D-005 receipt-time truth. |
| Route-stop ordering/invalidation safely supported publishing | Resolved | T10 validates active membership, makes the route's delete/create replacement inside one transaction, assigns contiguous order, and invalidates cache after success. No schema migration or stateful DB/cache proof was required for the exact scope. |
| Feedback supported accountable C-scope triage | Partially Resolved | T12 adds lifecycle/owner/deletion/restore/audit fields and deterministic 30/180-day retention code. No migration or purge execution is evidenced. |
| D-007/D-012 role/account lifecycle was represented | Partially Resolved | D-010:A migration/default plus runtime role/fresh-auth support exist and D-012 now fixes the target policy. Enabled/session version, lifecycle audit, promotion/demotion/disable, last-privileged protection, and recovery schema remain absent. |
| T11 timeout/claim/emergency recovery facts were durable | Still Present | No Installation/claim/audit tables or Trip fields for lastAcceptedAt, closeReason, closedAt, admin actor/reason or no-reopen transition exist. |
| Physical/source accuracy claims were ground truth | No Longer Relevant | T7 stores labels/proxies with route/version provenance; the audit retains the rule that route conformance and reported accuracy are not absolute error. |
| Production PostgreSQL/Redis placement and authentication were defined by repository configuration | Partially Resolved | T9 keeps both services off host ports on an internal data network, requires Redis authentication, and validates production connection/authentication inputs before migration. Actual host placement, firewall, secret handling, backup/restore, and runtime connectivity remain Unable to Verify. |

## 4. Data-Product Boundaries

| Product | Durable authority | Invariant |
|---|---|---|
| Master data and RouteStop | PostgreSQL | Route/order uniqueness plus T10 application-level active-membership validation and transactional contiguous replacement; cache invalidation occurs after the committed transaction. |
| Operational Trip and GPSTrack | PostgreSQL/PostGIS via Operations | One active trip, transactional lifecycle and sampled canonical history; no raw/event/timeout state. |
| Latest/canonical live state | Redis | Transient only; never a durable research or history substitute. |
| Research diagnostics | T7 PostgreSQL tables | Session/protocol/metric provenance, receive-time lifecycle, bounded research access; no public state authority. |
| Feedback | PostgreSQL Feedback and content-free audit rows | T12 models and enforces the bounded D-009 lifecycle/deletion/restore/retention policy in source; target migration and retention execution remain unverified. |

## 5. Required Task Placement

- T9 now aligns private PostgreSQL/Redis networking and documents migration/backup/database-recovery
  commands under D-008. The actual host, target, secret, off-host destination and restore result may
  not be inferred from Compose or migrations.
- T10 is complete without a schema migration: its constrained transaction uses the existing RouteStop model. Do not add unrelated role or feedback schema to it.
- T11 needs an exact cross-repository schema/interface contract for Mobile installation/claim,
  lifecycle fields, actor/reason audit, receipt-time update, timeout/no-reopen and concurrent
  recovery. The existing T5 invariant is the baseline to extend, not bypass.
- T12 is complete for its exact additive triage/retention/deletion/audit model and server
  authorization/re-authentication source/test scope; no source/device write model belongs in it and
  runtime migration/retention evidence remains separate.

## 6. Integrity and Operational Risks

Direct database writes could bypass service-level GPSTrack/trip vehicle matching; current application code protects the path but the schema has no composite cross-table constraint. T7 raw records use timezone-aware research timestamps while older operational fields use timestamp fields; future T11 must explicitly preserve backend receipt-time semantics. T7 provides lifecycle records and code-level verification gates, but no production scheduler, disposable target run, or representative query-plan/backup/restore evidence has been re-executed here. Redis loss is a live-state concern and must not be represented as loss of durable T7 evidence.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff under D-008. T10 is complete for exact scope.
T11 needs a complete technical schema/API contract and external Android acceptance evidence. T12
runtime migration, deletion/restore and retention verification remain required. No new owner
decision is proposed.

Confidence is High for schema/migration-visible data boundaries, Medium for unit/contract lifecycle evidence, and Low for migration/rollback, retention execution, query plans, backup/restore, volume, hardware, and production operations.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed. D-012 is approved but general account/source lifecycle and
privileged data-recovery controls are unimplemented; external database/backup evidence remains an
operations fact.

Database is validated at `1eec866...` for the current decision/Mobile evidence. Infrastructure & Device and
every downstream profile through Roadmap have now completed their dependent revalidations.

## 9. T12 Implementation Re-audit — 2026-08-01

**Finding: Feedback lacked triage, privacy lifecycle, deletion/restore, and audit structure —
Partially Resolved.** The reviewed additive migration adds case status/timestamps/responsible actor,
bounded internal note, soft-delete/recovery fields, indexes, and independent content-free audit rows.
The retention service makes the 30-day IP and 180-day content cutoffs deterministic and also expires
the 30-day restore window. The migration intentionally maps only `OPERATOR` to `ADMIN`, changes the
default, retains `SUPER_ADMIN`/`DEV`, and leaves any unexpected historical role for server fail-closed
handling. Prisma validation and tests pass; no target migration, rollback, retention deletion, backup,
or query-plan evidence was run.

**Finding: Feedback audit would retain rider content after purge — Resolved by design/source test.**
Audit rows have no feedback foreign key or message/IP fields; the purge records only a unique stable
retention action before deleting the Feedback row. This is static/deterministic proof, not a live data
purge result.
