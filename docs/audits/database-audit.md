# Database Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `d94abb3a4d80c2174d87df4d006dfbe7c814a6bc`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/research/T7-owner-input-questionnaire.md`, `docs/tasks/T7-raw-research-observations.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/roadmap/master-refactoring-roadmap.md`, `docs/audits/specialized/T7-data-lifecycle-access.md`, `docs/audits/specialized/T7-product-research-accuracy-protocol.md`, `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/prisma.config.ts`, `shuttle-tracking-backend/prisma/migrations/`, `shuttle-tracking-backend/src/services/operations.service.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/controllers/public.controller.ts`, `shuttle-tracking-backend/tests/test_t5_operations.js`, `shuttle-tracking-backend/tests/test_t6_canonical_state.js`, and `shuttle-tracking-backend/tests/test_t6_realtime.js`
- Reviewed at: `2026-07-29T14:33:30+07:00`
- Validation state: **Validated**
- Predecessor baselines: Discovery, Product, Architecture, Backend, and Frontend `@ d94abb3a4d80c2174d87df4d006dfbe7c814a6bc`

## T7 Re-audit Addendum — 2026-07-29

The additive migration introduces `research_sessions`, append-only `research_raw_observations`,
metric aggregates, and lifecycle manifests with session/source/receive-time, dedupe, and PostGIS
indexes. Receive time governs the approved 90-day raw-retention process; canonical `Trip` and
`GPSTrack` records are not mutated by the research model. Recorded D-006 disposable evidence covers
migration, representative query plans, retention/deletion, and backup/restore using synthetic data.
This resolves the prior bounded-raw-storage finding; production backup, retention scheduling, and
restoration remain **Unable to Verify** outside the disposable target. Prisma validation passed.
- Previous report baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`

## 1. Executive Summary

The PostgreSQL/PostGIS design remains proportionate for the controlled MVP. Relational ownership,
the T5 trip lifecycle constraints, source registry constraints, PostGIS coordinate storage, and
current lookup indexes are present. The T6 backend now reaches the database through the transactional
operations boundary for sampled canonical history; Redis still controls the approximately 60-second
sampling admission and remains transient.

The database is not yet a research telemetry store. `gps_tracks` is sampled canonical history, not
an append-only raw observation ledger. It lacks producer/receive/process/selection timestamps,
sequence and deduplication identity, experiment/session identity, transport/schema facts,
validation/canonical disposition, reported-accuracy semantics, allowlisted radio metadata,
assignment snapshots, retention execution, protected research reads, and export products. D-006 now
resolves the previously ambiguous disposable-target and safer-export owner gate, but it does not
implement these products or authorize a stateful run. The exact Redis image digest and complete
disposable-run evidence are still required before T7 validation.

## 2. Scope, Freshness, and Predecessor Gate

The previous Database report was based at `847a18c...`. The required predecessor reports are now
current: Discovery and Product remain validated at `847a18c...`, while Architecture and Backend are
validated at `fa9441b...`; Frontend is also validated at `fa9441b...`. The predecessor gate therefore
passes.

The evidence comparison from the previous Database baseline to the current commit included the T5
operations/history boundary, T6 public read and canonical-state changes, project knowledge and
pipeline documentation, the roadmap, and the T5/T6 test artifacts. The current worktree also contains
uncommitted D-006 owner/coordination documentation; it is treated as coordination evidence only and
not as implemented database or runtime evidence. No schema/migration change was made in this
re-audit.

This review covers Prisma schema and migration integrity, PostGIS geography, foreign keys,
constraints, indexes, trip/history writes, source identity, timestamp semantics, telemetry fidelity,
retention, export/access boundaries, and T7 database readiness. It does not certify a live database,
query plans at representative volume, backup/restore, deletion, deployment rollback, Redis version,
provider behavior, or physical-device behavior.

## 3. Prior-Finding Revalidation

| Prior finding | State | Current evidence and implication |
|---|---|---|
| Tracking-source identity/type/status constraints were insufficient | **Resolved** | The source migrations constrain identifiers, type, lifecycle status, priority, credential version, active vehicle assignment, and active non-LoRaWAN credentials; the source-selection indexes remain present. |
| One active trip per vehicle needed a database guard | **Resolved** | `unique_active_trip_per_vehicle` remains a partial unique index for `status = 'in_progress'`. |
| Trip lifecycle was non-idempotent around the database guard | **Resolved** | `operations.service.ts` locks the vehicle row, serializes start/end/history paths, reuses active trips, and makes repeated end deterministic. T5 test coverage passes statically; live integration still requires an approved disposable target. |
| Stored GPS history was too sparse for high-fidelity playback | **Still Present** | `persistSampledHistory` admits at most one canonical sample per vehicle sampling window of about 60 seconds. No raw observation ledger or playback read path exists. |
| GPS retention, archive, and partition plan were absent | **Still Present** | D-006 and the T7 briefs now define a 90-day raw receive-time policy, aggregate deletion, backup verification, and temporary-artifact cleanup, but no retention job, archive/partition migration, lifecycle run record, or deletion test exists. |
| Playback index `(trip_id, recorded_at)` was absent | **Still Present** | Only the trip ID index and vehicle/source descending-time indexes exist. Add the composite index only with an approved bounded playback/research query and representative query-plan evidence. |
| Operational status/coordinate constraints were weak | **Partially Resolved** | Trip status/time checks and source checks are validated in migrations. Route, vehicle, and stop statuses remain free-form; geography remains nullable; and the database does not enforce GPS trip/vehicle equality as a composite invariant. |
| Feedback workflow data was missing | **Still Present** | Feedback has type, vehicle, message, IP, and creation time only. There is no status, owner, resolution, retention marker, or case-management relation. |
| Tracking-source assignment history was not durable | **Still Present** | `TrackingSource.vehicleId` is a current pointer and `GPSTrack.sourceId` is nullable with `ON DELETE SET NULL`; assignment changes have no effective-dated history or immutable receipt snapshot. |
| Operational timestamps lacked timezone/event-time contract | **Still Present** | Existing fields use PostgreSQL `TIMESTAMP(6)`. `GPSTrack.recordedAt` is canonical backend input time; producer event time and backend receive time are not separately durable. |
| T7 retention/access/export parameters were incomplete | **Partially Resolved** | D-006 approves the isolated `t7-disposable` target, 90-day receive-time retention, safer bounded default exports, break-glass full export, fixed allowlists, streaming/backpressure, manifests, and seven-day temporary-artifact cleanup. The schema, role model, protected API, retention job, export, and verification implementation remain absent. |

## 4. Schema and Relationship Review

| Product | Current assessment |
|---|---|
| User | Unique username and password hash support the current admin login. There is no role/status/action-audit relation, so T7 `DEV`/`SUPER_ADMIN` authorization cannot yet be represented by the current model. |
| Route / Stop | Durable master data with nullable PostGIS stop geography and free-form status. Public reads still depend on usable coordinates. |
| RouteStop | Ordered junction with unique `(routeId, stopOrder)` and route/stop foreign keys. Duplicate stop IDs on one route remain a product decision for loops. |
| Vehicle | Current route assignment and status are durable; there is no persisted assignment history or active-trip pointer. |
| Trip | Vehicle/route/start/end/status record. The T5 migration restricts status to `in_progress`/`completed`, requires matching end-time presence, and prevents end before start. |
| GPSTrack | Sampled canonical point with trip/vehicle, optional geography, speed, heading, station, source, and canonical `recordedAt`. It must not be repurposed as T7 raw research storage. |
| TrackingSource | Source type/status/priority/credential lifecycle/last-seen and optional current vehicle assignment. Historical assignment and raw producer facts are absent. |
| Feedback | Public capture record only; no case workflow or retention/deletion lifecycle. IP storage has no documented deletion execution. |

Foreign keys preserve core ownership: route-stop deletes cascade from routes and stop deletion is
restricted; trip deletion cascades GPS samples; vehicle/trip relationships restrict vehicle deletion;
and source/feedback references use `SET NULL`. Source retirement is safer than deleting a source when
historical attribution matters. The database does not enforce that `GPSTrack.vehicleId` matches the
referenced trip's vehicle; the T5 service validates this write boundary, but a future direct writer
could bypass it.

## 5. Indexing and Query-Shape Review

Current indexes support active vehicle/stop filters, vehicle route assignment, ordered route stops,
active source selection `(vehicle_id, status, priority, id)`, source last-seen lookup, active-trip
lookup/uniqueness, and sampled history by vehicle/source/time. There is no composite trip playback
index and no GiST index because current reads do not issue the bounded spatial research predicates
described by the T7 brief.

T7 should begin with ordinary PostgreSQL tables and deterministic, batched queries. Required research
indexes are `(session_id, received_at, id)`, source/vehicle receive-time filters, a partial
deduplication key, and a receive-time deletion path; a PostGIS GiST index needs a representative
fixture and `EXPLAIN (ANALYZE, BUFFERS)` evidence on the approved disposable target. Do not add
indexes, partitioning, TimescaleDB, or a second analytics store without a measured bounded query or
deletion need.

The existing sampling estimate is planning evidence only: ten continuously active vehicles at one
sample per 60 seconds would create roughly 14,400 canonical samples/day before index overhead. The
T7 specialist upper-bound estimate for raw observations is not a measured capacity result.

## 6. T5 Integrity and T6 History Boundary

The T5 migration is additive and preserves the existing partial active-trip index while adding trip
status, status/end-time, and end-after-start checks. `operations.service.ts` uses a consistent vehicle
row-lock order for explicit start, virtual-trip creation, end, and sampled canonical-history writes.
When T6 selects a canonical observation, Redis admission controls the sampled write window and the
transaction then validates or creates the active trip and inserts the canonical sample atomically.

This boundary is a material improvement, but history persistence remains best effort relative to live
canonical publication: a failed PostgreSQL transaction is logged and does not change the already
published T6 state. The current design therefore does not prove durable capture of every observation,
and Redis sampling admission is not a raw-diagnostic backup. A T7 raw write must remain a separate
append-only operation with an explicit failure/disposition contract and must not alter T6 selection,
state version, or public payloads.

Migration history is additive and coherent: PostGIS/core tables, GPS/source/feedback additions,
source lifecycle constraints/indexes, and T5 lifecycle checks. Actual migration deployment,
rollback, backup/restore, and constraint validation against representative data remain unverified.
No migration, reset, or live target was run.

## 7. T7 Telemetry, Retention, and Research Readiness

The current durable products are master data, trips, sampled canonical GPS history, source registry,
and feedback. Redis latest-source snapshots, canonical state, freshness, selection counters, and
sampling admission are transient runtime products. There is no durable raw observation table,
session/run model, typed metric aggregate, lifecycle/backup manifest, protected research query, or
CSV stream.

D-002=B and D-004 remain approved scope decisions. D-006 is now an approved implementation-target
decision and supersedes the less restrictive export/temporary-artifact choices where they conflict:
use synthetic/redacted fixtures, isolated non-ambient targets, server-authorized fixed-field CSV,
session/time-scoped defaults, controlled break-glass full exports, backpressure, and minimal
manifests. The exact Redis image/digest, credentials/data scope, expected mutations, cleanup, and
rollback record must still be attached to the task evidence before stateful validation.

The minimum T7 database products remain separate and additive:

- a session/run and protocol/metric-version record;
- append-only typed raw observations with source/vehicle/trip/session identity at receipt, producer
  and backend receive times, sequence/deduplication facts, transport/schema, disposition, reported
  accuracy semantics, route-geometry version, and allowlisted metadata;
- typed reproducible aggregates with no raw coordinates or direct identifiers after raw retention;
- a lifecycle run/backup verification manifest sufficient to fail closed before deletion.

All raw retention must use backend `received_at`, not producer or display time. Route distance remains
a route-conformance proxy; device-reported accuracy remains reported uncertainty; pairwise distance is
source disagreement; and ground-truth error remains unavailable without surveyed/reference evidence.
No raw point may be silently map-snapped or promoted to canonical state by being retained.

Coordination note: D-006 is present in the Decision Queue and follow-up sections of the T7 task, but
the task's earlier approved-decision summary does not yet list D-006. This documentation mismatch is
a **New Finding** for the T7 handoff; synchronize the task metadata before Level 3 consumes it.

## 8. Actionable Recommendations

| Capability | Measurable outcome | Owner | Acceptance signal | Stage |
|---|---|---|---|---|
| Protect T5 database boundary | All lifecycle/history writes retain the service lock order and T5 invariants | Backend + Database | Prisma validation and T5 tests pass; disposable integration race test passes when target is approved | Foundation / complete protection |
| Add T7 additive research schema | Raw, session, aggregate, and lifecycle products have typed fields and timezone-aware new timestamps without changing `GPSTrack` | Database + Backend + Research | Additive migration, schema inspection, and rollback/restore checks pass on `t7-disposable` | T7 |
| Preserve historical source meaning | Each raw row carries receipt-time assignment snapshot or effective-dated assignment reference | Database + Device owner | Assignment-change fixture reconstructs source/vehicle identity at receipt | T7 |
| Implement protected research reads/export | Server enforces `DEV`/`SUPER_ADMIN`, fixed fields, session/time scope, streamed CSV, backpressure, and manifest | Backend + Security + Research | 403 boundary, CSV injection, deterministic ordering, disconnect, and memory/backpressure tests pass | T7 |
| Implement retention safely | Raw rows expire from backend receive time only after backup/restore/hash/count verification; aggregate deletion is explicit | Database + Operations | Stable cutoff, fail-closed deletion, restart/idempotency, and seven-day artifact cleanup evidence | T7 |
| Add bounded history/playback query only when needed | Ordered trip/time reads have a measured plan and pagination/time bounds | Database + Backend | `EXPLAIN (ANALYZE, BUFFERS)` on disposable representative fixture | T11 / research follow-up |

These are audit handoffs, not implementation authorization. No new owner decision is proposed.

## 9. Roadmap and Decision Impact

This re-audit validates the Database inputs for T5, T6, T7, T8, T11, T13, and T15. T5 remains
complete and must be protected from direct-writer bypass. T6's canonical contract is accepted and
does not turn sampled `GPSTrack` into raw research history. T7's owner parameters and disposable
target recommendation are now documented by D-006, but T7 implementation remains gated on the
remaining exact-target evidence, all required Level 1 freshness, and final roadmap revalidation.

No migration or application-code change is authorized by this report. Existing D-001 through D-006
remain the source of truth.

## 10. Assumptions, Unknowns, and Confidence

- No live migration, backup/restore, query plan, retention job, or deletion run was observed.
- PostgreSQL timezone behavior in deployment, physical source clocks, Redis server version, and
  future research volume are not validated in runtime.
- Sampling and raw-volume estimates are planning calculations, not capacity measurements.
- Confidence is **high** for schema/migration-visible relationships, constraints, and static service
  boundaries; **medium** for transaction/runtime behavior; and **low** for deployment, provider,
  physical-device, clock, and research-fidelity outcomes.

## 11. Audit Limitations and Handoff

Database is **Complete / Validated** at the current evidence baseline. Infrastructure & Device is the
next sequential profile because Backend, Frontend, and Database now have current validated
predecessors. Dashboard & UX, Security/DevOps/Observability, Production Readiness, and Roadmap must
continue to consume only revalidated reports. T7 remains an implementation handoff, not an approved
stateful execution.
