# Database Audit: Tram Tracking System

Validation status: **Needs Re-audit**. This legacy report predates T5 transactional lifecycle and
integrity changes and lacks current evidence-baseline metadata.

Re-audited: 2026-07-19

## 1. Executive Summary

PostgreSQL/PostGIS is a sound relational foundation for the controlled MVP. The schema models the
core entities, source attribution is now durable for retained `gps_tracks`, and the latest
tracking-source migration adds meaningful check constraints and access-pattern indexes. Prisma
schema validation passes.

The database is not ready to be treated as a high-fidelity telemetry store or a complete
operations record. `gps_tracks` contains sampled canonical points only; it has no retention or
partitioning policy, no event-time/sequence fields, and no planned playback read contract. The
database does enforce one active trip per vehicle through a partial unique index, but status is
free-form and the application does not make the surrounding trip/vehicle transition atomic.

For the controlled MVP, keep the current sampled-history design. Before daily operations, add the
database part of the Operations/Trip invariant and safe migration/test coverage. Do not introduce
partitioning or a separate time-series database until D-002 selects a higher-fidelity retention
policy and pilot data justifies it.

## Scope, Evidence, and Re-audit Status

Reviewed `docs/project-knowledge-base.md`; current Product, Architecture, and Backend reports; the
previous Database Audit; `schema.prisma`; all five SQL migrations; `prisma/seed.js`; PostGIS
bootstrap/entrypoint files; and current database reads/writes in controllers and tracking services.
`npx prisma validate` passed on 2026-07-19. No live database, `EXPLAIN`, migration deployment, or
production data was accessed.

| Prior finding | Re-audit status | Current evidence |
|---|---|---|
| Source identity/type/status were insufficiently constrained | **Resolved** | `tracking_sources` now checks type, status, priority, credential version, active vehicle, and non-LoRaWAN active credential requirements. |
| One active trip per vehicle needed a DB guard | **Resolved** | Migration `20260714155233_add_tracking_sources` creates `unique_active_trip_per_vehicle` on `trips(vehicle_id)` where status is `in_progress`. |
| Lifecycle remained non-idempotent around the DB guard | **Still Present** | The guard prevents a duplicate final row, but trip and vehicle writes are separate and the backend does not translate uniqueness conflicts. |
| Stored GPS history was too sparse for high-fidelity playback | **Still Present** | Redis throttles durable canonical writes to one per trip per 60 seconds; D-002 remains pending. |
| GPS retention, archive, and partition plan were absent | **Still Present** | No retention column/job, archive table, partition migration, or lifecycle document exists. |
| Playback index `(trip_id, recorded_at)` was absent | **Still Present** | Only `gps_tracks_trip_id_idx` exists; no history API currently uses it, so this is deferred until that read path is approved. |
| Spatial GiST indexes were absent | **No Longer Relevant for current queries** | Current SQL extracts coordinates; no database spatial predicate, nearest-neighbour, or bounding-box query is present. |
| Operational status/coordinate constraints were weak | **Still Present** | Route, vehicle, and trip status remain free-form strings; stop/GPS geography is nullable and no trip-time or cross-row consistency rule exists. |
| Feedback workflow data was missing | **Still Present** | Feedback has type, vehicle, message, IP, and time only; no status, owner, resolution, or route/trip context is stored. |
| Tracking-source history was not durable | **New Finding** | `gps_tracks.source_id` becomes `NULL` on source deletion and source assignment changes have no effective-dated history. |
| Operational timestamps have no timezone contract | **New Finding** | All operational timestamps use PostgreSQL `TIMESTAMP(6)` rather than `timestamptz`; event versus receipt time is also unspecified. |

## 2. Current Database Overview

The PostgreSQL datasource declares PostGIS. PostGIS is enabled idempotently by the initial
migration and Docker initialization. Prisma models `User`, `Route`, `Vehicle`, `Stop`, `RouteStop`,
`Trip`, `GPSTrack`, `TrackingSource`, and `Feedback`; raw SQL handles geography inserts and
lat/lng extraction where Prisma cannot model the geography value directly.

Redis holds current state and throttling keys. PostgreSQL receives sampled canonical locations from
the tracking service, not each incoming source observation. `gps_tracks` therefore supports a
lightweight trip history, not a raw telemetry ledger.

## 3. Database Strengths

- Foreign keys and deletion behavior cover the core route, vehicle, trip, GPS, source, and feedback
  relationships.
- PostGIS `geography` is consistently used for stops and GPS points; writes set SRID 4326.
- Ordered route membership is protected by unique `(route_id, stop_order)`.
- `gps_tracks` is indexed by vehicle/time and source/time; source selection is indexed by vehicle,
  status, priority, and ID.
- The partial unique index is a real final database guard against two `in_progress` trips for one
  vehicle, even though Prisma cannot express that index in the schema file.
- Migrations are small, additive, and readable; the latest migration adds `NOT VALID` checks then
  validates them, avoiding a silent unconstrained registry.
- Seed data is development-only; production permits only an explicit one-time first-admin flow.

## 4. Critical Issues

### High — History and lifecycle lack a complete operational integrity boundary

The partial unique index correctly prevents two exact `in_progress` rows for a vehicle. It does not
make `Trip` status an enum/check-constrained value, coordinate the trip update with vehicle status,
or prove that `gps_tracks.vehicle_id` equals the vehicle of its referenced trip. Current application
code generally supplies matching data, but direct/future writers can create contradictory rows.

Impact: history and active-state reads can disagree after retries, concurrent writes, or a new
writer that bypasses current assumptions.

Recommendation: preserve the partial unique index; add a transactional Operations/Trip write path
first. Then add a migration for accepted trip/vehicle status values, `end_time >= start_time`, and
an integrity test/query for GPS trip-to-vehicle consistency. Use a composite foreign key or trigger
only if multiple direct GPS writers become a real requirement.

Priority: High. Difficulty: Medium.

### High — GPS storage has no lifecycle or fidelity contract

The table is unpartitioned and has no retention/archival process. Sampling at 60 seconds limits the
current controlled-MVP footprint to about 14,400 rows/day for ten continuously active vehicles, but
the stated 1-second target would be about 864,000 rows/day before indexes. The current schema also
does not retain observation event time, receipt time separately, accuracy, sequence, or disposition.

Impact: the project cannot responsibly promise detailed playback, source comparison, or long-lived
diagnostics, and a later sampling increase would change storage/index/retention obligations.

Recommendation: keep canonical samples as D-002 option A unless the owner chooses otherwise. If
D-002 approves raw diagnostics or high-fidelity history, first specify retention/deletion, fields,
query patterns, and then add the matching indexes and date-range partition plan.

Priority: High before a fidelity increase; low operational urgency at the current sampling rate.
Difficulty: Medium to Hard depending on D-002.

### Medium — Historical source attribution can disappear or be reinterpreted

`GPSTrack.sourceId` is a nullable foreign key with `ON DELETE SET NULL`. A source deletion removes
the source identifier from past sampled records; a reassignment leaves the old sample pointing to a
source whose current vehicle is different. No source-assignment history exists.

Impact: a later incident review cannot always explain which device produced a historical point.

Recommendation: for a controlled MVP, retire sources rather than delete them. Before device
comparison or accountable operations, add an effective-dated assignment model or immutable source
snapshot fields to retained observations, consistent with D-002.

Priority: Medium. Difficulty: Medium.

## 5. Schema Review

| Model | Review |
|---|---|
| `User` | Unique username and password hash suit current admin login. No roles, status, or action audit relation. |
| `Route` | Master data with vehicles, stops, and trips; status is free-form and public reads filter `active`. |
| `Vehicle` | Optional assigned route and current status. It has no active-trip pointer; status is free-form. |
| `Stop` | Bilingual master data with nullable geography. Public coordinate reads assume a usable location. |
| `RouteStop` | Ordered junction with unique route/order. It permits the same stop twice on a route, which may be valid for loops but is undefined. |
| `Trip` | Vehicle/route/start/end/status record. The migration partial index protects one exact active status, but no status/time checks exist. |
| `GPSTrack` | Sampled point with trip, vehicle, geography, speed, heading, station, source, and recorded time. Location and telemetry fields are nullable; no event/received time split. |
| `TrackingSource` | Source registry now has type/status/priority/credential lifecycle/last-seen constraints and indexes. Assignment history is absent. |
| `Feedback` | Captures public feedback and optional vehicle. It lacks the case-management fields needed only if staff triage is approved. |

`geography` with SRID 4326 is appropriate for global latitude/longitude and future distance queries.
Use `geometry` only if a future workload needs planar operations; no such workload is evidenced.

## 6. Relationship Review

- Vehicle → Route is optional and uses `ON DELETE SET NULL`, suitable for retaining a vehicle when
  a route is removed.
- Trip → Vehicle and Trip → Route restrict deletion; GPS → Trip cascades and GPS → Vehicle
  restricts deletion, preserving referential history but allowing a trip deletion to erase samples.
- Route → RouteStop cascades while Stop deletion is restricted; this protects route composition.
- TrackingSource → Vehicle uses `SET NULL`; GPSTrack → TrackingSource uses `SET NULL`, causing the
  historical-attribution limitation above.
- Feedback → Vehicle uses `SET NULL`, retaining feedback when a vehicle is deleted.
- User is intentionally isolated from operational rows, so database-level admin-action attribution
  is not implemented.

## 7. Indexing Review

| Query/access pattern | Current support | Assessment |
|---|---|---|
| Active vehicles/stops and vehicles by route | Indexes on `vehicles.status`, `vehicles.assigned_route_id`, and `stops.status` | Appropriate for current reads. |
| Route stops by route ordered by stop order | `(route_id, stop_order)` unique index plus route index | Appropriate. |
| Current source selection | `(vehicle_id, status, priority, id)` | Matches the canonical-selection query. |
| Source health | `(status, last_seen_at DESC)` | Supports status/freshness views when added. |
| Active trip lookup/uniqueness | `trips.vehicle_id`, `trips.status`, and partial unique active-trip index | Correct database guard; a dedicated partial lookup index is not required without observed plans. |
| Sampled history by vehicle or source | `(vehicle_id, recorded_at DESC)` and `(source_id, recorded_at DESC)` | Appropriate for current retention. |
| Playback by trip/time | `trip_id` only | Add `(trip_id, recorded_at)` when an approved history endpoint needs ordered playback. |
| Spatial proximity | No GiST index | Not needed for current coordinate extraction; add only with an actual spatial predicate. |

An index on `routes.status` is not needed for the small current master-data set unless query plans
show it. Avoid adding indexes merely because a column can be filtered: each one adds write cost.

## 8. GPS Time-Series Data Review

The current design is sound for sampled canonical history. Redis admits live observations every
1–3 seconds, while PostgreSQL receives at most one row per trip per 60 seconds. `gps_tracks` is
therefore neither an append-only source-observation ledger nor high-fidelity playback storage.

No partitioning, retention, archive, deletion, or playback read API exists. Partitioning is a table
layout that keeps time-ranged maintenance manageable; it is not needed now because sampling is low.
The simpler next step is D-002 option A: document canonical-only retention and add a deletion job
only when the owner specifies a retention duration. If sampling is increased, design date partitions
and retention before enabling it, rather than retrofitting a large table.

## 9. Multi-Device Readiness Review

Database-level readiness is **partial and suitable for the controlled MVP**. `TrackingSource`
distinguishes mobile, LoRaWAN, ESP32, and simulator sources; each sampled `GPSTrack` can retain a
source ID; and indexes support a vehicle's ordered active-source selection. The latest constraints
resolve the previous invalid-source-type/status and active-credential gaps.

It is not a durable multi-source comparison model: raw observations, source clock/order, selection
reason, source-assignment history, and source state transitions are not stored. D-002 and the
canonical-state contract should settle those requirements before adding an observation table.

## 10. Data Integrity Review

Enforced: primary keys, core foreign keys, username uniqueness, route-stop order uniqueness,
tracking-source lifecycle checks, and the partial active-trip uniqueness index.

Still application-defined: accepted route/vehicle/trip statuses; coordinate non-null/range;
positive route-stop order; no duplicate stop policy; `end_time >= start_time`; speed/heading bounds;
GPS trip/vehicle agreement; and source assignment history. These are not all equally urgent. Add
only rules that express stable business invariants, starting with trip status/time before daily
operations. Keep loop-stop policy and feedback workflow dependent on product scope.

## 11. Migration Review

The history is coherent: initial PostGIS/core schema, additive GPS fields, feedback vehicle link,
tracking-source registry plus active-trip partial index, then tracking-source lifecycle metadata and
validated checks. No destructive migration was found. The PostGIS extension is idempotent both in
the migration and Docker initialization; the backend entrypoint runs `prisma migrate deploy`.

The partial unique index is a raw migration feature not represented in Prisma schema, so it must be
preserved in future migrations and checked in an integration test. The lifecycle migration's
`NOT VALID` then `VALIDATE CONSTRAINT` sequence is safe if deployment succeeds; actual deployment
status is unavailable. Migration rollback/runbook evidence is not found, but additive forward
migrations are appropriate for this project.

## 12. Missing Schema Capabilities

- A database-supported Operations/Trip transition boundary and stable lifecycle checks.
- Canonical freshness/state and event-version facts for operational reads.
- D-002-approved raw observation/retention model, if needed.
- Trip-history/playback read support, including `(trip_id, recorded_at)` when the endpoint exists.
- Effective-dated source assignment or retained source identity for device investigations.
- Feedback triage fields only if D-001 expands beyond controlled feedback capture.

## 13. Recommended Improvements

### Recommendation 1: Complete the active-trip integrity boundary

### Problem

The partial unique index exists, but statuses/times and trip-to-vehicle persistence are not one
atomic database-backed transition.

### Impact

Retries and concurrent writers can leave a correct unique row with inconsistent operational state.

### Recommendation

Keep the partial index; implement the Backend Operations/Trip transaction, then add stable status
and time checks plus an integration test for duplicate-start and end/start races.

### Why

This closes the operational invariant without duplicating state in a new service or database.

### Priority

High — before daily operations.

### Difficulty

Medium.

### Learning Topic

Partial unique indexes, transactions, and invariants across related rows.

### Related Files

`prisma/migrations/20260714155233_add_tracking_sources/migration.sql`, `schema.prisma`, and
`src/controllers/trips.controller.ts`.

### Recommendation 2: Make sampled-history lifecycle explicit

### Problem

`gps_tracks` has no retention or archive policy and cannot represent detailed observation history.

### Impact

Increasing sampling later can create uncontrolled storage growth and misleading playback claims.

### Recommendation

Approve D-002 first. For option A, document canonical-only retention and choose a deletion window;
for options B/C, add event/receipt fields, retention/deletion jobs, ordered playback index, and
date partitioning before raising write frequency.

### Why

Retention policy should drive schema complexity, not an assumed future scale target.

### Priority

High decision gate; implementation is scale-triggered at current sampling.

### Difficulty

Medium for A; Hard for B/C.

### Learning Topic

Time-series retention, partitions, and indexed range queries.

### Related Files

`schema.prisma`, `src/services/tracking.service.ts`, and `docs/decision-queue.md` D-002.

### Recommendation 3: Preserve historical source meaning

### Problem

Source deletion nulls historical `source_id`, and reassignment has no assignment history.

### Impact

Past records can no longer be attributed accurately during device investigation.

### Recommendation

Retire rather than delete sources now. Add assignment history or immutable source snapshot facts
only when D-002/device comparison requires durable source investigations.

### Why

Retirement is the simple current approach; a history model is justified only when operational
questions require it.

### Priority

Medium — before device comparison or accountable operations.

### Difficulty

Easy now; Medium for a history model.

### Learning Topic

Slowly changing relationships and immutable event facts.

### Related Files

`schema.prisma`, `prisma/migrations/20260714155233_add_tracking_sources/migration.sql`, and
`src/controllers/devices.controller.ts`.

### Recommendation 4: Add indexes only with approved read paths

### Problem

Trip playback lacks an ordered composite index and future spatial reads lack GiST indexes.

### Impact

An unplanned history/proximity feature could scan/sort more rows than necessary.

### Recommendation

Add `(trip_id, recorded_at)` with the trip-history endpoint. Add GiST geography indexes only when a
server-side spatial predicate (nearest/proximity/bounding box) is introduced.

### Why

Current queries do not benefit; unnecessary indexes increase GPS write cost.

### Priority

Medium — feature-triggered.

### Difficulty

Easy to Medium.

### Learning Topic

Composite and GiST indexes matched to query plans.

### Related Files

`schema.prisma`, `src/controllers/public.controller.ts`, and future trip-history route.

### Recommendation 5: Establish a timestamp contract before history becomes operational

### Problem

Operational fields use `TIMESTAMP(6)` and a single server-assigned `recorded_at` value.

### Impact

Cross-environment history and delayed source observations can be difficult to compare correctly.

### Recommendation

For new telemetry facts, define UTC event and receipt timestamps. Plan a compatible `timestamptz`
migration only when history/reporting becomes operational; do not rewrite existing sampled data
without a tested conversion plan.

### Why

UTC semantics are a durable contract, while a broad timestamp rewrite is not needed for the pilot.

### Priority

Medium — before operational reporting/playback.

### Difficulty

Medium.

### Learning Topic

UTC storage, event time versus ingestion time, and migration backfills.

### Related Files

`schema.prisma`, all migration SQL, and `src/services/tracking.service.ts`.

## 14. Database Learning Topics

1. Database invariants versus application checks — needed now for active trips.
2. Partial unique indexes and transactional state transitions — needed now.
3. Canonical samples versus raw observations — required to decide D-002.
4. Composite/GiST indexes and `EXPLAIN` — learn when a real read path is added.
5. Time partitions and retention jobs — scale-triggered, after higher-fidelity retention is chosen.

## Roadmap Impact

The database confirms the active-trip database guard already exists; roadmap work should repair the
transactional lifecycle around it, not recreate the index. D-002 gates any telemetry table,
partitioning, or playback-fidelity work. Source-history and feedback-triage schema work remain
feature-triggered. No roadmap task is added or reordered in this audit.

## Assumptions and Unknowns

- Migrations are assumed applied in deployed environments; no migration table or live schema was
  queried.
- The 10-vehicle, 1–3 second target is a design target, not measured database load.
- Retention duration, actual table size, backups, query plans, and production timezone settings are
  unknown.
- D-001 and D-002 remain pending owner decisions.

## Confidence

**High** for schema/migration/query facts and Prisma schema validity. **Medium** for scale,
migration deployment, and query performance because no live data, query plan, or load test was
available.

## Required Decisions

- **D-001 — Operational MVP release scope:** governs whether feedback-triage and daily-operation
  schema work is needed now.
- **D-002 — Telemetry retention and canonical-history fidelity:** governs raw observations,
  retention, partitioning, and playback indexing.

No new owner decision is required for retaining the existing active-trip partial index, adding a
transactional write path, or using source retirement instead of deletion.

## 15. Audit Limitations

No live PostgreSQL/PostGIS instance, migration deployment log, `EXPLAIN ANALYZE`, table statistics,
backup/restore exercise, load test, or production environment was accessed. Database security,
hosting, and credentials are deferred to Security/DevOps and Infrastructure audits.

## 16. Handoff

This report supersedes the previous Database Audit. It corrects one cross-report factual point:
the active-trip partial unique index is present in migration SQL, while the Backend Audit correctly
identifies that lifecycle code around the guard is still non-transactional. Infrastructure & Device
should validate runtime data durability and physical-source behavior; Security/DevOps should review
secrets, backup/restore, and database operations; Roadmap should use only approved D-001/D-002
outcomes before scheduling retention or playback work.
