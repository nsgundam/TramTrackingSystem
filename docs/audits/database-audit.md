# Database Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 82f4d97d8609d73f79aa74eea6efaadaa34238d9
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture/Backend/Frontend audits, docs/decision-queue.md, docs/research/, task records, shuttle-tracking-backend/prisma/, shuttle-tracking-backend/src/services/, shuttle-tracking-backend/src/middleware/research-access.ts, shuttle-tracking-backend/src/routes/research.route.ts, and shuttle-tracking-backend/tests/
- Reviewed at: 2026-08-07T16:40:54+07:00
- Validation state: Validated
- Predecessor baselines: Discovery, Product, Architecture, Backend, and Frontend revalidated at 82f4d97d8609d73f79aa74eea6efaadaa34238d9

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

All predecessors are validated at 82f4d97. D-008 chooses PostgreSQL/PostGIS as durable production
data and private/authenticated Redis as transient coordination under University Server/Network
operations. No actual database placement, migration, backup, restore, retention, or provider action
was performed.

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
| D-007 role/account lifecycle was represented | Partially Resolved | D-010:A migration/default plus runtime ADMIN/SUPER_ADMIN/DEV enforcement and fresh-auth support exist. Provisioning/promotion/demotion and general account lifecycle remain outside scope. |
| T11 timeout/claim/emergency recovery facts were durable | Still Present | No Installation/claim/audit tables or Trip fields for lastAcceptedAt, closeReason, closedAt, admin actor/reason or no-reopen transition exist. |
| Physical/source accuracy claims were ground truth | No Longer Relevant | T7 stores labels/proxies with route/version provenance; the audit retains the rule that route conformance and reported accuracy are not absolute error. |

## 4. Data-Product Boundaries

| Product | Durable authority | Invariant |
|---|---|---|
| Master data and RouteStop | PostgreSQL | Route/order uniqueness plus T10 application-level active-membership validation and transactional contiguous replacement; cache invalidation occurs after the committed transaction. |
| Operational Trip and GPSTrack | PostgreSQL/PostGIS via Operations | One active trip, transactional lifecycle and sampled canonical history; no raw/event/timeout state. |
| Latest/canonical live state | Redis | Transient only; never a durable research or history substitute. |
| Research diagnostics | T7 PostgreSQL tables | Session/protocol/metric provenance, receive-time lifecycle, bounded research access; no public state authority. |
| Feedback | PostgreSQL Feedback | Capture-only personal-data-bearing record; D-009 supplies the required lifecycle/deletion policy, which T12 must model and enforce. |

## 5. Required Task Placement

- T9 may align private PostgreSQL/Redis networking and document migration/backup/rollback commands
  under D-008. The actual host, target, secret, off-host destination and restore result may not be
  inferred from Compose or migrations.
- T10 is complete without a schema migration: its constrained transaction uses the existing RouteStop model. Do not add unrelated role or feedback schema to it.
- T11 needs an approved exact schema/interface contract for Mobile installation/claim, lifecycle fields, actor/reason audit, receipt-time update, timeout/no-reopen and concurrent recovery. The existing T5 invariant is the baseline to extend, not bypass.
- T12 has D-009 policy. It needs an additive triage/retention/deletion/audit model and server authorization/re-authentication evidence; no source/device write model belongs in this task.

## 6. Integrity and Operational Risks

Direct database writes could bypass service-level GPSTrack/trip vehicle matching; current application code protects the path but the schema has no composite cross-table constraint. T7 raw records use timezone-aware research timestamps while older operational fields use timestamp fields; future T11 must explicitly preserve backend receipt-time semantics. T7 provides lifecycle records and code-level verification gates, but no production scheduler, disposable target run, or representative query-plan/backup/restore evidence has been re-executed here. Redis loss is a live-state concern and must not be represented as loss of durable T7 evidence.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is eligible for an exact repository-side handoff under D-008. T10 is complete for exact scope.
T11 needs a complete technical schema/API contract and external Android acceptance evidence. T12
runtime migration, deletion/restore and retention verification remain required. No new owner
decision is proposed.

Confidence is High for schema/migration-visible data boundaries, Medium for unit/contract lifecycle evidence, and Low for migration/rollback, retention execution, query plans, backup/restore, volume, hardware, and production operations.

## 8. Handoff

Database is validated at 82f4d97 for the D-008 decision impact. Infrastructure & Device is now
eligible because Backend, Frontend, and Database predecessor reports are current.

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
