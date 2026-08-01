# Database Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 671b71209ad3ba3341de78f836b6ec057813280c
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture/Backend/Frontend audits, docs/decision-queue.md, docs/research/, roadmap/task records, shuttle-tracking-backend/prisma/, shuttle-tracking-backend/src/services/, shuttle-tracking-backend/src/middleware/research-access.ts, shuttle-tracking-backend/src/routes/research.route.ts, and shuttle-tracking-backend/tests/
- Reviewed at: 2026-08-01T13:15:00+07:00
- Validation state: Validated
- Predecessor baselines: Discovery, Product, Architecture, Backend, and Frontend @ 671b71209ad3ba3341de78f836b6ec057813280c

## 1. Executive Summary

PostgreSQL/PostGIS remains the durable system of record for master data, Trips, sampled canonical GPSTrack history, Feedback, TrackingSource registry, and T7 research records. Redis remains transient for latest source/canonical state and sampling admission. The additive T7 schema correctly keeps bounded research sessions, raw observations, aggregates, and lifecycle manifests distinct from public canonical state and sampled operational history.

D-001=C does not make the schema ready for T10-T12. RouteStop has unique route/order but no atomic ordered replacement model. Trip lacks receipt-time lastAcceptedAt, close reason, closed-at, Mobile installation/claim linkage, and force-close audit. Feedback lacks case state, ownership, resolution, privacy/retention/deletion controls. The User role column and T7 research role check do not constitute the approved D-007 role/account lifecycle or privileged-action model.

## 2. Scope and Freshness

This profile reviews schema, migrations, constraints, indexes, data lifecycle/retention code, and database-facing services/tests. It does not certify a live migration, query plan, backup/restore, deletion, rollback, provider, hardware, or production database.

All predecessors are validated at 671b712. The earlier code baseline already includes T7 research diagnostics; this re-audit is required because D-001=C, D-005=B, D-007, D-008, and T11 policy constraints alter the required future data boundaries. No decision document is treated as a migration or runtime proof.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| One active trip per vehicle required a database guard | Resolved | A partial unique index and T5 status/time checks remain in migrations; Operations uses a consistent vehicle-locking order. |
| Source identity and current assignment lacked structure | Partially Resolved | TrackingSource has type/status/priority/credential/current vehicle and GPSTrack source reference. There is no effective-dated assignment history for later operational explanations. |
| Bounded raw research storage was absent | Resolved | T7 adds ResearchSession, append-only ResearchRawObservation, aggregates and lifecycle run records with session/source/transport/time/dedupe/disposition/index fields. |
| Raw retention had no safe boundary | Partially Resolved | The 90-day backend-receive-time service requires a matching verified backup manifest and writes a lifecycle record. It is not a scheduled or statefully re-run production retention proof. |
| Sampled GPSTrack was raw/high-fidelity history | Still Present | GPSTrack remains throttled canonical samples. It must not be used for raw comparison, event replay, or D-005 receipt-time truth. |
| Route-stop ordering/invalidation safely supported publishing | Still Present | Unique route/order prevents duplicate order but cannot validate/order-replace as one business command; cache invalidation is outside the transaction. T10 owns this. |
| Feedback supported accountable C-scope triage | Still Present | Feedback only has type, vehicle, message, IP address and created time; no case status, assignment, SLA, resolution, retention/deletion marker, or audit relation. |
| D-007 role/account lifecycle was represented | Still Present | User role allows legacy OPERATOR, DEV, SUPER_ADMIN and research middleware checks only the latter two. ADMIN hierarchy, provisioning/promotion/demotion/re-authentication/audit and privileged deletion model are absent. |
| T11 timeout/claim/emergency recovery facts were durable | Still Present | No Installation/claim/audit tables or Trip fields for lastAcceptedAt, closeReason, closedAt, admin actor/reason or no-reopen transition exist. |
| Physical/source accuracy claims were ground truth | No Longer Relevant | T7 stores labels/proxies with route/version provenance; the audit retains the rule that route conformance and reported accuracy are not absolute error. |

## 4. Data-Product Boundaries

| Product | Durable authority | Invariant |
|---|---|---|
| Master data and RouteStop | PostgreSQL | Route/order uniqueness exists; T10 must add validated ordered mutation and public-cache invalidation. |
| Operational Trip and GPSTrack | PostgreSQL/PostGIS via Operations | One active trip, transactional lifecycle and sampled canonical history; no raw/event/timeout state. |
| Latest/canonical live state | Redis | Transient only; never a durable research or history substitute. |
| Research diagnostics | T7 PostgreSQL tables | Session/protocol/metric provenance, receive-time lifecycle, bounded research access; no public state authority. |
| Feedback | PostgreSQL Feedback | Capture-only personal-data-bearing record; T12 needs approved lifecycle and deletion/restore controls. |

## 5. Required Task Placement

- T9 remains blocked. No production database/Redis placement, backup/restore ownership, migration/rollback target, or topology may be inferred from the current Compose/migrations.
- T10 needs a narrow migration only if an atomic order-replacement representation requires one; first define and test the transactional command, membership/order constraints, and cache/public-read behavior. Do not add unrelated role or feedback schema.
- T11 needs an approved exact schema/interface contract for Mobile installation/claim, lifecycle fields, actor/reason audit, receipt-time update, timeout/no-reopen and concurrent recovery. The existing T5 invariant is the baseline to extend, not bypass.
- T12 is blocked by feedback privacy/retention/deletion/restore and device action policies. It needs only the approved triage/device data model and authorization/audit fields once decided.

## 6. Integrity and Operational Risks

Direct database writes could bypass service-level GPSTrack/trip vehicle matching; current application code protects the path but the schema has no composite cross-table constraint. T7 raw records use timezone-aware research timestamps while older operational fields use timestamp fields; future T11 must explicitly preserve backend receipt-time semantics. T7 provides lifecycle records and code-level verification gates, but no production scheduler, disposable target run, or representative query-plan/backup/restore evidence has been re-executed here. Redis loss is a live-state concern and must not be represented as loss of durable T7 evidence.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is blocked by D-008. T10 may become eligible once downstream re-audits and an exact task contract resolve its data paths. T11 needs fresh downstream evidence, a complete technical schema/API contract, and external Android acceptance evidence; its general role-policy coupling remains an owner gate. T12 remains owner-policy blocked. No new owner decision is proposed.

Confidence is High for schema/migration-visible data boundaries, Medium for unit/contract lifecycle evidence, and Low for migration/rollback, retention execution, query plans, backup/restore, volume, hardware, and production operations.

## 8. Handoff

Database is validated at 671b712. Infrastructure & Device is now eligible because Backend, Frontend, and Database predecessor reports are current.
