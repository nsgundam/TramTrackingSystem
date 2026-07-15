# Database Audit: Tram Tracking System

## 1. Executive Summary

Assessment: **MVP-usable, partially ready for multi-source tracking, but not production-ready for trusted lifecycle or continuous GPS history**.

The database has a solid MVP foundation: PostgreSQL/PostGIS is enabled, core domain tables exist, route-stop ordering is modeled, trips and GPS tracks are persisted, and basic indexes support current public/admin reads. Evidence: the Prisma schema defines `User`, `Route`, `Vehicle`, `Stop`, `RouteStop`, `Trip`, `GPSTrack`, and `Feedback` (`shuttle-tracking-backend/prisma/schema.prisma:16-160`), with PostGIS configured in the datasource (`shuttle-tracking-backend/prisma/schema.prisma:8-10`).

The latest schema changes address two earlier structural gaps: `TrackingSource` now identifies sources and `GPSTrack.sourceId` attributes persisted samples, while a PostgreSQL partial unique index now limits each vehicle to one `in_progress` trip (`shuttle-tracking-backend/prisma/schema.prisma:131-172`, `shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql:2-32`). The remaining database risks are incomplete source integrity/operations, non-idempotent application behavior around the database guard, no retention or partitioning plan for GPS time-series growth, missing playback/spatial indexes, and free-form status/coordinate rules.

The backend currently broadcasts GPS every event but persists only one GPS row per trip per 60 seconds through Redis throttling (`shuttle-tracking-backend/src/services/tracking.service.ts:4-25`). That keeps write volume low, but it means stored GPS history is too sparse for high-fidelity playback if the product expects 1-3 second historical traces.

## 2. Current Database Overview

Database stack:

- PostgreSQL with PostGIS extension declared in Prisma (`shuttle-tracking-backend/prisma/schema.prisma:8-10`).
- Prisma 7 client with PostgreSQL adapter, plus raw SQL for geography reads/writes where Prisma cannot model PostGIS directly (`shuttle-tracking-backend/src/services/tracking.service.ts:28-39`, `shuttle-tracking-backend/src/controllers/public.controller.ts:66-77`).
- Initial migration creates the schema and `CREATE EXTENSION IF NOT EXISTS "postgis"`; later migrations add GPS fields, feedback-to-vehicle linkage, and tracking sources (`shuttle-tracking-backend/prisma/migrations/20260217070749_init/migration.sql:1-3`, `shuttle-tracking-backend/prisma/migrations/20260713083424_feedback_vehicle_id/migration.sql:1-11`, `shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql:1-32`).

Model summary:

- `User`: admin auth only, `id`, unique `username`, `passwordHash`, `createdAt` (`shuttle-tracking-backend/prisma/schema.prisma:16-23`).
- `Route`: route master data with `id`, `name`, `color`, `status`, relations to vehicles, route stops, and trips (`shuttle-tracking-backend/prisma/schema.prisma:28-40`).
- `Vehicle`: vehicle master data with optional assigned route, status, trips, and GPS tracks (`shuttle-tracking-backend/prisma/schema.prisma:46-61`).
- `Stop`: stop master data with Thai/English names, optional `geography` location, image URL, status, and route-stop memberships (`shuttle-tracking-backend/prisma/schema.prisma:67-80`).
- `RouteStop`: junction table between routes and stops with `stopOrder`, unique per route/order (`shuttle-tracking-backend/prisma/schema.prisma:86-99`).
- `Trip`: operational trip record with vehicle, route, start/end time, status, and GPS tracks (`shuttle-tracking-backend/prisma/schema.prisma:105-123`).
- `GPSTrack`: sampled time-series location record with trip, vehicle, geography location, speed, heading, station, optional source, and recorded time (`shuttle-tracking-backend/prisma/schema.prisma:131-149`).
- `Feedback`: data-only feedback table with type, message, IP address, and created time (`shuttle-tracking-backend/prisma/schema.prisma:151-160`).

## 3. Database Strengths

1. **PostGIS is the right storage foundation.** Stops and GPS tracks use `geography`, and public APIs extract lat/lng with `ST_Y(location::geometry)` and `ST_X(location::geometry)` (`shuttle-tracking-backend/prisma/schema.prisma:71`, `shuttle-tracking-backend/prisma/schema.prisma:133`, `shuttle-tracking-backend/src/controllers/public.controller.ts:72-73`).

2. **Core operational relationships exist.** Vehicles link to routes, trips link to vehicles and routes, GPS tracks link to trips and vehicles, and route-stop ordering is explicit (`shuttle-tracking-backend/prisma/schema.prisma:55-57`, `shuttle-tracking-backend/prisma/schema.prisma:92-98`, `shuttle-tracking-backend/prisma/schema.prisma:115-117`, `shuttle-tracking-backend/prisma/schema.prisma:139-144`).

3. **Route-stop ordering is protected by a unique constraint.** `@@unique([routeId, stopOrder])` prevents two stops from occupying the same order on one route (`shuttle-tracking-backend/prisma/schema.prisma:96`).

4. **The migration history is small and understandable.** The initial schema is followed by additive GPS, feedback, and tracking-source migrations. The latest migration also adds the active-trip database guard (`shuttle-tracking-backend/prisma/migrations/20260217070749_init/migration.sql:1-160`, `shuttle-tracking-backend/prisma/migrations/20260227072309_add_station_to_gps/migration.sql:1-3`, `shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql:1-32`).

5. **The existing indexes support several current reads.** Vehicles have indexes on status and assigned route, route stops have route/stop indexes, trips have vehicle/route/status/start indexes, and GPS tracks have trip and vehicle/time indexes (`shuttle-tracking-backend/prisma/schema.prisma:59-60`, `shuttle-tracking-backend/prisma/schema.prisma:97-98`, `shuttle-tracking-backend/prisma/schema.prisma:121-124`, `shuttle-tracking-backend/prisma/schema.prisma:147-149`).

## 4. Critical Issues

### Critical Issue 1: Tracking source identity exists but is not fully constrained or operationalized

The schema now has `TrackingSource` with type, status, priority, optional vehicle assignment, secret hash, last-seen timestamp, and `GPSTrack.sourceId` (`shuttle-tracking-backend/prisma/schema.prisma:131-172`). The migration and seed establish multiple source types and multiple sources per vehicle (`shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql:2-29`, `shuttle-tracking-backend/prisma/seed.ts:120-138`).

Impact: source attribution is now possible for persisted samples, but source `type` and `status` remain free-form, assignment history is not modeled, and source ownership is not enforced at the database level. Raw observations remain Redis-only, so the database cannot reconstruct every source report or its freshness history.

### Critical Issue 2: Active-trip constraint exists, but lifecycle behavior is not idempotent

The latest migration adds `unique_active_trip_per_vehicle`, a partial unique index on `trips(vehicle_id)` where `status = 'in_progress'` (`shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql:31-32`). However, `Trip.status` is still free-form, `startTrip` does not return an existing active trip or translate the unique violation into a conflict, and trip/vehicle writes remain separate (`shuttle-tracking-backend/src/controllers/trips.controller.ts:27-39`).

Impact: the database now prevents duplicate active rows, but retries can still produce generic failures and leave the vehicle/trip state transition non-atomic. This is reduced from a critical schema gap but remains a high operational integrity risk.

### Critical Issue 3: GPS history storage does not match high-fidelity playback needs

The target mentions GPS every 1-3 seconds per vehicle, but the current persistence path writes at most one row every 60 seconds per trip (`shuttle-tracking-backend/src/services/tracking.service.ts:4-25`). `GPSTrack` can store time-series data, but the write policy means the stored table is sampled at low frequency.

Impact: the database can support lightweight history and reports, but not detailed GPS playback unless the retention and sampling strategy is changed intentionally.

### Critical Issue 4: No GPS retention, archiving, or partitioning strategy exists

`gps_tracks` is a single unpartitioned table with no retention marker, archive table, deletion job, or documented lifecycle policy (`shuttle-tracking-backend/prisma/schema.prisma:131-149`). No migration or backend code was found for partitioning or retention.

Impact: if persistence is increased from 60-second sampling to 1-3 second storage, table growth becomes a production concern quickly. At 10 vehicles, 1 row every second is about 864,000 rows/day before indexes.

## 5. Schema Review

`User` is sufficient for current admin login, but it has no role, status, last login, or audit relation. Product audit notes admin role/user management is missing (`docs/audits/product-audit.md:74-80`).

`Route` has simple fields and string `status`. Current public reads filter active routes (`shuttle-tracking-backend/src/controllers/public.controller.ts:18-21`). Not Found: database enum or check constraint limiting route statuses.

`Vehicle` captures current assignment and status. It supports public active vehicle reads through `status` and admin route assignment through `assignedRouteId` (`shuttle-tracking-backend/src/controllers/public.controller.ts:42-46`, `shuttle-tracking-backend/src/controllers/route.controller.ts:93-96`). Not Found: capacity, plate number, active trip pointer, device assignment, or last-known location.

`Stop` stores location as nullable `geography`. This is flexible for admin creation, but public map queries assume a location exists and cast it for coordinate extraction (`shuttle-tracking-backend/src/controllers/public.controller.ts:66-77`). Needs Confirmation: whether a stop without location is valid business data.

`RouteStop` correctly models ordered many-to-many route membership. It prevents duplicate stop order per route but does not prevent the same stop being added twice to the same route at different orders. If loops intentionally revisit a stop, this may be acceptable; otherwise add `@@unique([routeId, stopId])`.

`Trip` stores lifecycle fields and the latest migration enforces one `in_progress` row per vehicle, but `status` remains a free-form string and the model has no driver/source reference or summary fields such as distance or sampled point count.

`GPSTrack` has the essential sampled-history fields: trip, vehicle, geography location, speed, heading, station, source, and recorded time. It still lacks device-reported timestamp, accuracy, altitude, battery/signal metadata, and separate ingestion timestamp.

`Feedback` is isolated and data-only. It has no user workflow fields such as status, assigned admin, related route/vehicle/trip, or resolution notes.

## 6. Relationship Review

- Vehicle to Route: optional many vehicles to one route through `assignedRouteId`; FK uses default Prisma behavior reflected in migration as `ON DELETE SET NULL` (`shuttle-tracking-backend/prisma/migrations/20260217070749_init/migration.sql:142-143`).
- Vehicle to Trip: one vehicle has many trips; trips restrict vehicle deletion while trips exist (`shuttle-tracking-backend/prisma/migrations/20260217070749_init/migration.sql:151-152`).
- Route to Trip: one route has many trips; route deletion is restricted while trips exist (`shuttle-tracking-backend/prisma/migrations/20260217070749_init/migration.sql:154-155`).
- Route to Stop: many-to-many through `RouteStop`; deleting a route cascades route-stop rows, deleting a stop is restricted if route-stop rows exist (`shuttle-tracking-backend/prisma/schema.prisma:92-94`).
- Trip to GPSTrack: deleting a trip cascades GPS tracks (`shuttle-tracking-backend/prisma/schema.prisma:140`).
- Vehicle to GPSTrack: deleting a vehicle is restricted while GPS tracks exist (`shuttle-tracking-backend/prisma/migrations/20260217070749_init/migration.sql:160`).
- User isolation: `User` has no relation to operational entities, so admin actions cannot be attributed at the database level.
- Feedback isolation: `Feedback` has no relationship to route, vehicle, stop, trip, or user (`shuttle-tracking-backend/prisma/schema.prisma:151-160`).

## 7. Indexing Review

Current access patterns:

- Public active routes: `WHERE status = 'active' ORDER BY id` (`shuttle-tracking-backend/src/controllers/public.controller.ts:18-21`).
- Public active vehicles: `WHERE status = 'active' include route ORDER BY id` (`shuttle-tracking-backend/src/controllers/public.controller.ts:42-46`).
- Public active stops: `WHERE status = 'active' ORDER BY id` with coordinate extraction (`shuttle-tracking-backend/src/controllers/public.controller.ts:66-77`).
- Public route stops: join `route_stops` to `stops`, filter `rs.route_id` and active stops, order by `rs.stop_order` (`shuttle-tracking-backend/src/controllers/public.controller.ts:103-116`).
- Trip lifecycle: lookup vehicle by primary key, create trip, update vehicle, update trip by primary key (`shuttle-tracking-backend/src/controllers/trips.controller.ts:13-39`, `shuttle-tracking-backend/src/controllers/trips.controller.ts:56-69`).
- GPS ingestion: insert into `gps_tracks` with trip, vehicle, location, speed, heading, station, recorded time (`shuttle-tracking-backend/src/services/tracking.service.ts:28-39`).

Index fit:

- `vehicles.status` supports active vehicle reads (`shuttle-tracking-backend/prisma/schema.prisma:59`).
- `vehicles.assignedRouteId` supports vehicles-by-route admin reads (`shuttle-tracking-backend/prisma/schema.prisma:60`).
- `stops.status` supports active stop reads (`shuttle-tracking-backend/prisma/schema.prisma:79`).
- `route_stops.route_id` plus unique `(route_id, stop_order)` supports route-stop listing ordered by stop order (`shuttle-tracking-backend/prisma/schema.prisma:96-98`).
- `gps_tracks.trip_id` supports trip playback lookups, but a composite `(trip_id, recorded_at)` would better support ordered playback by trip (`shuttle-tracking-backend/prisma/schema.prisma:147-149`).
- `(vehicle_id, recorded_at DESC)` supports latest/history by vehicle (`shuttle-tracking-backend/prisma/schema.prisma:148`).

Index gaps:

- `routes.status` has no index, although public active routes filter by status. With few routes this is fine; add only if route count grows or query plans show benefit.
- No GiST spatial index exists on `stops.location` or `gps_tracks.location`. Current queries only extract coordinates, so this is not hurting current reads, but future nearest stop, route proximity, bounding-box, and spatial analytics queries will need it.
- A partial unique index now enforces one active trip per vehicle, but application conflict handling is not implemented (`shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql:31-32`).
- No `(trip_id, recorded_at)` index for playback-style ordered reads.
- No index supports feedback workflow by unresolved status because feedback status does not exist.

## 8. GPS Time-Series Data Review

For the stated target of 10 vehicles sending every 1-3 seconds:

- Broadcast path receives every event through Socket.IO (`shuttle-tracking-backend/src/server.ts:68-75`).
- Database persistence is throttled to 60 seconds per trip (`shuttle-tracking-backend/src/services/tracking.service.ts:4-25`).
- The schema stores a `recordedAt` timestamp and indexes by vehicle/time (`shuttle-tracking-backend/prisma/schema.prisma:140`, `shuttle-tracking-backend/prisma/schema.prisma:148`).

Conclusion: the current table design is acceptable for sampled operational history, but the current persistence policy is not aligned with detailed playback. If the product wants playback at the same resolution as live updates, the database needs a deliberate time-series plan: composite playback index, retention policy, and likely date-based partitioning before high-frequency storage is enabled.

Not Implemented:

- Retention or archive policy.
- Date partitioning for `gps_tracks`.
- Device timestamp vs server ingestion timestamp.
- Accuracy is accepted in the source observation and carried in Redis, but is not persisted in `gps_tracks` (`shuttle-tracking-backend/src/services/tracking.service.ts:13-22`, `shuttle-tracking-backend/src/services/tracking.service.ts:64-73`).

## 9. Multi-Device Readiness Review

Current status: **partially structurally ready**.

At the database level, a sampled GPS row can identify `tripId`, `vehicleId`, and optional `sourceId`; `TrackingSource` supports source type, priority, status, vehicle assignment, and last-seen time (`shuttle-tracking-backend/prisma/schema.prisma:131-172`). The backend pipeline selects the highest-priority fresh source and persists the selected source ID (`shuttle-tracking-backend/src/services/tracking.service.ts:101-160`, `shuttle-tracking-backend/src/services/tracking.service.ts:226-237`).

Remaining schema gaps:

- Constrained source type/status values and a rule for valid source-to-vehicle assignments.
- Historical assignment model if a source can move between vehicles.
- Durable raw `LocationObservation` history if every source report must be auditable; current raw observations are Redis-only.
- Database-backed current-location read model if Redis loss must not remove operational state.

## 10. Data Integrity Review

Integrity currently enforced:

- Primary keys and FKs exist for all core tables.
- Username uniqueness exists (`shuttle-tracking-backend/prisma/schema.prisma:18`).
- Route stop order uniqueness exists per route (`shuttle-tracking-backend/prisma/schema.prisma:96`).
- GPS tracks cascade when a trip is deleted (`shuttle-tracking-backend/prisma/schema.prisma:140`).

Integrity relying on application logic:

- Allowed values for route, vehicle, and trip statuses.
- Coordinate validity and non-null stop/GPS location.
- Whether the active-trip rule is respected by all writers; the partial unique index now protects the final insert.
- Whether `GPSTrack.vehicleId` matches the vehicle on `GPSTrack.tripId` or whether `GPSTrack.sourceId` belongs to that vehicle.
- Whether route-stop duplicates are allowed.
- Whether stop order must be positive.
- Whether `endTime >= startTime`.
- Whether speed and heading ranges are valid.

High-risk example: the canonical persistence path selects an active trip by `vehicleId`, but the database has no composite constraint proving that a future or direct insert keeps `gps_tracks.vehicle_id` aligned with `trips.vehicle_id` (`shuttle-tracking-backend/src/services/tracking.service.ts:167-237`).

## 11. Migration Review

The migration history is coherent:

- `20260217070749_init` creates PostGIS, tables, indexes, and foreign keys in a logical initial schema (`shuttle-tracking-backend/prisma/migrations/20260217070749_init/migration.sql:1-160`).
- `20260227072309_add_station_to_gps` adds nullable `heading` and `station`, a safe additive change (`shuttle-tracking-backend/prisma/migrations/20260227072309_add_station_to_gps/migration.sql:1-3`).
- `20260713083424_feedback_vehicle_id` adds an optional vehicle relation and index to feedback (`shuttle-tracking-backend/prisma/migrations/20260713083424_feedback_vehicle_id/migration.sql:1-11`).
- `20260714155233_add_tracking_sources` adds source attribution, the source registry, foreign keys, indexes, and the partial unique active-trip index (`shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql:1-32`).

Safety observations:

- PostGIS extension setup is idempotent through `CREATE EXTENSION IF NOT EXISTS`.
- No destructive migrations were found.
- The latest migration creates a unique index directly on `trips`; deployment will fail if existing duplicate `in_progress` rows are present. No pre-index duplicate check or cleanup step is included (`shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql:31-32`).
- Not Found: migration notes, rollback notes, or data backfill documentation.
- Not Found: spatial GiST indexes in migrations.
- Needs Confirmation: whether production migration workflow is `prisma migrate deploy`, because this audit only inspected repository files.

## 12. Missing Schema Capabilities

- Trip History: partially supported by `Trip` and `GPSTrack`; active-trip uniqueness now exists, but there are no summary metrics and GPS persistence remains sparse.
- GPS Playback: partially supported, but missing `(trip_id, recorded_at)` index and high-fidelity persistence policy.
- Device Registration: partially supported by `TrackingSource` and admin device CRUD; no assignment history or constrained type/status model.
- Device Health: partially supported by `lastSeenAt` and `status`; no event/history/read model for stale or offline transitions.
- Reports: partially supported by trips/GPS/feedback, but no aggregates, event tables, or lifecycle/status fields for feedback.
- Feedback Workflow: `Feedback` exists, but no status, assignment, relation to route/vehicle/trip/stop, or resolution fields.
- Admin User/Roles: not implemented beyond username/password.
- Current Vehicle State: not implemented as a database read model.
- Audit Log: not implemented for admin changes.

## 13. Recommended Improvements

### Recommendation 1: Complete tracking source integrity and operations

### Problem

The database now distinguishes source types and can attribute sampled GPS rows, but source type/status are free-form and there is no assignment history or durable raw observation history.

### Impact

Source attribution exists for sampled rows, but invalid source categories, reassignment history, and every raw observation cannot be reliably audited from PostgreSQL.

### Recommendation

Keep `TrackingSource` and `GPSTrack.sourceId`. Add database checks for supported source types/statuses, define assignment integrity, and add a raw observation table only if audit/replay requires every incoming report.

### Why

The latest schema links sampled GPS to a source and supports multiple sources per vehicle (`shuttle-tracking-backend/prisma/schema.prisma:131-172`). The remaining gap is operational completeness, not absence of the core entity.

### Priority

High

### Difficulty

Medium

### Learning Topic

Device registry and source attribution.

### Related Files

`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql`, `shuttle-tracking-backend/src/services/tracking.service.ts`

### Recommendation 2: Enforce one active trip per vehicle

### Problem

The database now prevents multiple `in_progress` trips per vehicle, but application behavior does not treat the constraint as an idempotency mechanism.

### Impact

Retries can return generic errors, and separate trip/vehicle writes can still leave state transitions non-atomic.

### Recommendation

Keep the existing PostgreSQL partial unique index and update application logic to return the existing active trip or a clear 409, handle unique-violation errors, and use a transaction for trip plus vehicle updates.

### Why

The index is present in the latest migration, but the controller still creates blindly and updates the vehicle separately (`shuttle-tracking-backend/src/controllers/trips.controller.ts:27-39`, `shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql:31-32`).

### Priority

High

### Difficulty

Medium

### Learning Topic

Partial unique indexes and idempotent writes.

### Related Files

`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/prisma/migrations/20260714155233_add_tracking_sources/migration.sql`, `shuttle-tracking-backend/src/controllers/trips.controller.ts`

### Recommendation 3: Define GPS retention and sampling policy

### Problem

The database has no documented lifecycle policy for `gps_tracks`.

### Impact

If GPS persistence is increased toward 1-3 second intervals, `gps_tracks` can grow rapidly and make playback/report queries harder to manage.

### Recommendation

Decide the intended storage resolution and retention window. For MVP, keep sampled history but document it. For playback, persist more frequently and add retention plus monthly or daily partitioning.

### Why

Current Redis throttle stores one GPS row every 60 seconds per trip (`shuttle-tracking-backend/src/services/tracking.service.ts:4-25`), but product gaps include trip history and GPS playback.

### Priority

High

### Difficulty

Medium

### Learning Topic

Time-series retention and table partitioning.

### Related Files

`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/services/tracking.service.ts`

### Recommendation 4: Add playback and spatial indexes when those features begin

### Problem

The schema lacks a composite playback index and spatial GiST indexes.

### Impact

Playback by trip and future spatial queries may degrade as GPS and stop data grows.

### Recommendation

Add `(trip_id, recorded_at)` for playback queries. Add GiST indexes on `stops.location` and `gps_tracks.location` when nearest-stop, geofence, route-proximity, or spatial filtering moves backend-side.

### Why

Current queries extract coordinates only, but the product direction includes trip history/playback and location-aware features.

### Priority

High

### Difficulty

Easy

### Learning Topic

Composite indexes and GiST spatial indexes.

### Related Files

`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/prisma/migrations/`

### Recommendation 5: Add database constraints for operational validity

### Problem

Important data rules exist only in application code or not at all.

### Impact

Bad status strings, invalid coordinates, negative stop order, mismatched trip/vehicle GPS rows, and invalid timestamps can enter the database.

### Recommendation

Add check constraints for status values, coordinate range where practical, `stop_order > 0`, speed/heading ranges, and `end_time IS NULL OR end_time >= start_time`. Consider composite FK or trigger logic to ensure GPS vehicle matches trip vehicle.

### Why

Schema fields such as `status` are free-form strings (`shuttle-tracking-backend/prisma/schema.prisma:32`, `shuttle-tracking-backend/prisma/schema.prisma:51`, `shuttle-tracking-backend/prisma/schema.prisma:111`), and GPS insert accepts payload values directly.

### Priority

Medium

### Difficulty

Medium

### Learning Topic

Database-level constraints vs application validation.

### Related Files

`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/services/tracking.service.ts`

### Recommendation 6: Expand feedback schema when workflow is implemented

### Problem

`Feedback` stores raw message data but no workflow state.

### Impact

Admins cannot triage, assign, resolve, report, or relate feedback to operational entities.

### Recommendation

Add `status`, optional `routeId`, `vehicleId`, `tripId`, `stopId`, `assignedUserId`, `resolvedAt`, and resolution notes when feedback moves from planned to implemented.

### Why

Product audit identifies feedback workflow as missing, while the schema currently contains only type/message/IP/time.

### Priority

Medium

### Difficulty

Medium

### Learning Topic

Workflow schema design.

### Related Files

`shuttle-tracking-backend/prisma/schema.prisma`, `docs/audits/product-audit.md`

## 14. Database Learning Topics

**Spatial index / GiST**

What it is: a PostgreSQL index type used by PostGIS to speed up spatial searches such as nearby points or intersections.

Problem it solves: without it, spatial queries can scan large tables.

Does this project need it now? Not for current coordinate extraction queries. It will need it when nearest-stop, geofence, route proximity, or spatial reporting runs in the backend.

Simpler alternative: keep current B-tree indexes until backend spatial filtering exists.

Learning order: basic indexes -> composite indexes -> PostGIS geography vs geometry -> GiST indexes -> `EXPLAIN ANALYZE`.

**Table partitioning**

What it is: splitting a logical table into child tables, commonly by time.

Problem it solves: large GPS history tables become easier to query, archive, and delete by date.

Does this project need it now? Not while persisting one point per trip per 60 seconds. It becomes important if saving every 1-3 seconds for months.

Simpler alternative: keep a sampled history and scheduled deletion job first.

Learning order: retention policy -> query patterns -> range partitioning -> partition maintenance.

**Partial unique index**

What it is: a unique index that applies only to rows matching a condition, such as `status = 'in_progress'`.

Problem it solves: enforces rules like "one active trip per vehicle" directly in the database.

Does this project need it now? Yes, because duplicate active trips are a core data integrity risk.

Simpler alternative: application-only check, but that is vulnerable to race conditions.

Learning order: unique constraints -> race conditions -> partial indexes -> transaction conflict handling.

**Database constraints**

What it is: database rules such as foreign keys, check constraints, unique constraints, and not-null constraints.

Problem it solves: prevents invalid data even if application code has a bug or two processes race.

Does this project need it now? Yes for trip lifecycle and status values; coordinate constraints can follow.

Simpler alternative: validation in controllers, but keep database constraints for invariants that must never be violated.

Learning order: not-null/foreign key -> unique -> check constraints -> triggers only when constraints cannot express the rule.

**Retention policy**

What it is: a rule for how long data is kept, at what resolution, and when it is archived or deleted.

Problem it solves: prevents time-series tables from growing forever without a purpose.

Does this project need it now? Yes as a decision, even if implementation is simple.

Simpler alternative: document a 30/90-day policy and run scheduled deletion before building partitions.

Learning order: product need -> storage estimate -> retention window -> deletion/archive job -> partitioning.

## 15. Audit Limitations

- No production query plans or `EXPLAIN ANALYZE` output were available.
- No production traffic or GPS retention requirements were found; the 10 vehicles at 1-3 second interval target comes from the Database Audit Agent instructions.
- No live database was inspected; this audit is repository-based.
- Security findings such as unauthenticated trip/GPS routes are noted only where they affect database integrity; detailed security review belongs to the Security & DevOps Audit Agent.
- Performance benchmarking and load testing were out of scope.

## 16. Handoff

Recommended next agents:

- **Infrastructure & Device Audit Agent**: should review database findings around device/source identity, retention, and ingestion volume because these determine how Mobile, LoRaWAN, ESP32, and production data pipelines should be introduced.
- **Security & DevOps Audit Agent**: should review database integrity risks that overlap with trust boundaries, especially unauthenticated GPS writes, migration deployment policy, backups, secrets, and operational observability.
- **Master Refactoring Roadmap Agent**: should use this audit to sequence schema changes before feature work such as device registration, trip history, GPS playback, reports, and feedback workflow.

Completion note: `docs/audits/database-audit.md` has been updated after re-inspecting the latest schema, migrations, seed data, and database-relevant backend queries.
