# Database Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/roadmap/master-refactoring-roadmap.md`, `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/prisma.config.ts`, `shuttle-tracking-backend/prisma/migrations/20260217070749_init/migration.sql`, `shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql`, `shuttle-tracking-backend/prisma/migrations/20260716170000_operationalize_tracking_sources/migration.sql`, `shuttle-tracking-backend/prisma/migrations/20260722120000_transactional_trip_lifecycle/migration.sql`, `shuttle-tracking-backend/src/services/operations.service.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/controllers/devices.controller.ts`, `shuttle-tracking-backend/src/controllers/public.controller.ts`, `shuttle-tracking-backend/src/controllers/feedback.controller.ts`, `shuttle-tracking-backend/src/services/feedback.service.ts`, `shuttle-tracking-backend/test_t5_operations.js`, and `shuttle-tracking-backend/Dockerfile`.
- Reviewed at: `2026-07-22T21:25:57+07:00`
- Validation state: **Validated**
- Predecessor baselines: Discovery, Product, and Architecture, each `@ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Legacy report commit: `85fe892`

## 1. Executive Summary

The PostgreSQL/PostGIS schema is proportionate for the controlled demonstration. It has separate route, stop, route-stop, vehicle, trip, sampled GPS, tracking-source, feedback, and admin-user models; PostGIS geography supports the current coordinate storage; source and route-order indexes match current selection/read paths; and T5 adds database trip lifecycle/time checks while the partial unique active-trip index remains.

T5 resolves the prior system-level lifecycle gap when used through `operations.service.ts`: concurrent starts/end operations are serialized and idempotent, and sampled history is transactionally tied to the active trip. The database is still not a research telemetry store. `gps_tracks` is sampled canonical history, not raw observation history; there are no event/receive timestamps, sequence/deduplication identity, payload version, transport/disposition, experiment/session, reported accuracy, or radio metadata fields. No retention, deletion, archive, partition, playback read, assignment-history, or bounded research-export model exists.

Keep the current schema for D-001=A. D-002=B and D-004 require a bounded raw diagnostics design, but implementation must wait for explicit retention/deletion/access/clock/session parameters and the T6 canonical contract.

## 2. Scope, Freshness, and Predecessor Gate

This review covers Prisma schema/migrations, PostGIS geography, foreign keys, unique/check constraints, indexes, trip/history writes, source identity/assignment, timestamp types, telemetry fidelity, retention posture, and migration/deployment evidence. It does not run migrations against a live target, inspect query plans at representative volume, or certify backup/restore/deployment rollback.

Discovery, Product, and Architecture are Complete and Validated at the same baseline, so the Database predecessor gate passes. The current evidence includes the T5 lifecycle migration/service, source operationalization migrations, research scope, and current data-flow report. The current uncommitted changes are audit documentation only.

## 3. Prior-Finding Revalidation

| Prior finding | State | Current evidence and implication |
|---|---|---|
| Source identity/type/status were insufficiently constrained | **Resolved** | Tracking-source migrations constrain type, status, priority, credential version, active vehicle assignment, and active non-LoRaWAN credentials; supporting indexes exist. |
| One active trip per vehicle needed a database guard | **Resolved** | `unique_active_trip_per_vehicle` remains a partial unique index for `status = 'in_progress'`. |
| Lifecycle remained non-idempotent around the database guard | **Resolved** | T5 service transactions, vehicle row locks, idempotent start/end behavior, and lifecycle/time checks close the prior system-level gap; direct future writers must still use the service. |
| Stored GPS history was too sparse for high-fidelity playback | **Still Present** | Redis admission persists canonical history at most once per vehicle/trip sampling window of approximately 60 seconds; no raw/high-fidelity record exists. |
| GPS retention, archive, and partition plan were absent | **Still Present** | No retention policy field, deletion job, archive table, partition migration, or operational lifecycle document is present. |
| Playback index `(trip_id, recorded_at)` was absent | **Still Present** | Only the trip ID index and vehicle/source descending-time indexes exist; no playback endpoint currently justifies the composite index, so this remains a deferred capability rather than an immediate scale fix. |
| Operational status/coordinate constraints were weak | **Partially Resolved** | T5 constrains trip status/time and source migrations add checks. Route/vehicle/stop statuses remain free-form, geography is nullable, and cross-row GPS trip/vehicle consistency is not database-enforced. |
| Feedback workflow data was missing | **Still Present** | Feedback stores type, vehicle, message, IP, and creation time only; no status, assignee, resolution, deletion/retention marker, route/trip context, or response target exists. |
| Tracking-source history was not durable | **Still Present** | `GPSTrack.sourceId` is nullable with `ON DELETE SET NULL`; source assignment changes have no effective-dated history or immutable assignment snapshot. |
| Operational timestamps had no timezone/event-time contract | **Still Present** | Schema fields use PostgreSQL `TIMESTAMP(6)` rather than `timestamptz`, and GPS `recordedAt` is backend-derived canonical time with no separate producer/receive time. |

## 4. Schema and Relationship Review

| Model/product | Current assessment |
|---|---|
| User | Unique username and password hash support current admin login. There is no role/status/action-audit relation. |
| Route / Stop | Durable master data with free-form status; Stop geography is nullable and public reads assume usable coordinates. |
| RouteStop | Ordered junction with unique `(routeId, stopOrder)` and route/stop foreign keys. Duplicate stop IDs on one route remain a product decision for loops. |
| Vehicle | Optional assigned route and free-form status; no persisted active-trip pointer or source-health read model. |
| Trip | Vehicle/route/start/end/status record. T5 migration restricts status to `in_progress`/`completed`, requires matching end-time presence, and prevents end before start. |
| GPSTrack | BigInt sample ID, trip/vehicle, nullable geography, speed, heading, station, nullable source, and backend-derived recorded time. It cannot represent raw observation fidelity or a source-selection disposition. |
| TrackingSource | Source type/status/priority/credential lifecycle/last-seen and optional vehicle assignment. Assignment history and raw producer metadata are absent. |
| Feedback | Public capture record only; no case-management state. IP is stored as `inet` without a declared retention/deletion process. |

Foreign keys preserve core ownership: route-stop deletes cascade from routes and stop deletion is restricted; trip deletion cascades GPS samples; vehicle/trip relationships restrict deletion; source and feedback references use `SET NULL`. `GPSTrack.sourceId` therefore loses historical source attribution when a source is deleted. Source retirement is safer than deletion for current operations.

The database does not enforce GPS trip/vehicle equality as a composite relationship. Current `recordCanonicalHistory` supplies matching values, but a future direct writer could create a contradictory sample. Add a database invariant only if more direct writers are approved; otherwise keep the service as the required write boundary.

## 5. Indexing and Query-Shape Review

Current indexes support active vehicle/stop filters, vehicle route assignment, ordered route stops, active source selection `(vehicle_id, status, priority, id)`, source last-seen lookup, active-trip lookup/uniqueness, and sampled history by vehicle/source/time. `gps_tracks_trip_id_idx` supports a basic trip lookup but not ordered trip playback; add `(trip_id, recorded_at)` only with an approved history endpoint and observed query plan.

There is no GiST index because current reads extract coordinates and do not issue spatial predicates. Add spatial indexes only when route-conformance, checkpoint, bounding-region, or nearest-neighbor research queries are defined. Do not add indexes solely because columns can be filtered; write cost and migration impact must be justified by bounded read paths.

At the current 60-second sampling rate, ten continuously active vehicles would create roughly 14,400 samples/day before index overhead. A one-second raw/canonical history would be roughly 864,000 rows/day, but this is a design illustration, not a measured load. Storage/retention planning must precede any fidelity increase.

## 6. T5 Integrity and Migration Review

The lifecycle migration is additive and validates three checks: accepted trip status, status/end-time consistency, and `end_time >= start_time`. The existing raw partial unique index is not represented by Prisma schema and must be preserved in future migrations. `operations.service.ts` locks the vehicle row and performs lifecycle/history mutations in transactions; the T5 integration artifact checks concurrent start/end behavior, stale end behavior, ownership rejection, active-trip uniqueness, history insertion, and cleanup.

Migration history is coherent: initial PostGIS/core tables, additive GPS/feedback/source fields, source lifecycle checks/indexes, then T5 lifecycle checks. No destructive migration was observed. Actual deploy/rollback/backup evidence remains unverified; do not run migration or reset commands against a non-approved target.

## 7. Telemetry, Retention, and Research Readiness

The current durable products are master data, trips, sampled canonical GPS history, source registry, and feedback. Redis latest-source/canonical values and source-selection counters are transient. There is no durable raw observation table or event ledger.

D-002=B and D-004 require research facts sufficient to compare Mobile, ESP32, and LoRaWAN. The schema currently lacks source/vehicle/trip assignment at receipt, experiment/session identity, producer event time, backend receive time, processing/selection time, sequence/deduplication identity, transport, payload version, accepted/rejected/canonical disposition, reported accuracy semantics, route-geometry version, or allowlisted battery/network/radio metadata. It also lacks retention windows, deletion ownership, anonymized export rules, aggregate reproducibility, and research roles.

The approved accuracy vocabulary must remain separate: route distance is route-conformance evidence, device accuracy is reported uncertainty, pairwise disagreement is source difference, and ground-truth error requires a surveyed or higher-quality synchronized reference. The schema must not silently map-snap raw research points or compare HDOP as meters.

## 8. Actionable Recommendations

| Capability | Measurable outcome | Owner | Acceptance signal | Privacy/data boundary | Stage |
|---|---|---|---|---|---|
| Preserve T5 database invariant | All lifecycle/history writes use the transactional service and keep status/time/active-trip constraints | Backend + Database | T5 concurrency/constraint integration test passes on an approved disposable target | No new public data | Complete foundation / protect in future migrations |
| Define canonical/history products | Current state, sampled canonical history, and research raw facts have separate authority/retention statements | Database + Backend | Data-product contract reviewed against T6/T7 tests | Public canonical-only; research restricted | Phase 2 / T6/T7 |
| Bounded raw diagnostics | Raw facts include source/vehicle/trip/session, event/receive times, sequence, transport, schema, disposition, and allowlisted metadata | Database + Backend + Research | Migration, bounded query/export, duplicate/order, and deletion tests pass | Research role, redaction, retention/deletion owner | Phase 2/5 / T7/T15 |
| Durable source assignment meaning | Historical queries can explain which source was assigned to a vehicle at receipt | Database + Device owner | Effective-dated assignment or immutable snapshot test | Device identity retained per approved policy | Before comparison/accountable operations |
| History read path | Staff can query trips/samples by bounded vehicle/trip/time filters with ordered results | Database + Backend + Dashboard | Pagination, time-bound, index/query-plan, and auth tests pass | Admin role and retention policy | Phase 3 / T11 |
| Timestamp contract | Stored timestamps distinguish producer event, backend receive, processing, and canonical selection semantics with explicit timezone | Database + Backend + Device owner | Clock-skew/order tests and schema precision checks pass | No extra personal data | Phase 2 / T6/T7 |

These are audit handoffs, not implementation authorization. No Level 2 consultation is required unless an owner requests a focused retention, clock, assignment, or research-access decision.

## 9. Roadmap and Decision Impact

This audit revalidates Database inputs for T5, T6, T7, T8, T11, T13, and T15. T5 is complete and should be protected from direct-writer bypass. T6 must define canonical state before raw/research schema work; T7 must wait for approved retention/deletion/access parameters. T10–T12 remain deferred under D-001=A. D-002=B and D-004 remain approved scope decisions, not complete database implementation.

No new owner decision is proposed. Existing D-001 through D-004 remain the source of truth.

## 10. Assumptions, Unknowns, and Confidence

- No live migration, backup/restore, query plan, retention job, or production database target was observed.
- PostgreSQL timestamp behavior, deployment timezone, physical source clocks, and future research volume are not validated in runtime.
- The current sample-volume estimate is a planning calculation, not a capacity measurement.
- Confidence is **high** for schema/migration-visible relationships and constraints, **medium** for runtime transaction/deployment behavior, and **low** for future research volume and physical telemetry fidelity.

## 11. Audit Limitations and Handoff

No schema or migration changes are authorized by this report. Database is now Complete and Validated. Infrastructure & Device is now eligible because Backend, Frontend, and Database have current validated predecessor reports; Dashboard & UX remains gated by Product, Frontend, and Infrastructure & Device.
