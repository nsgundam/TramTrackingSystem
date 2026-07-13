# Database Audit: Tram Tracking System

## 1. Executive Summary

Assessment: **MVP-usable, not production-ready for continuous GPS history or multi-device tracking**.

The database has a solid MVP foundation: PostgreSQL/PostGIS is enabled, core domain tables exist, route-stop ordering is modeled, trips and GPS tracks are persisted, and basic indexes support current public/admin reads. Evidence: the Prisma schema defines `User`, `Route`, `Vehicle`, `Stop`, `RouteStop`, `Trip`, `GPSTrack`, and `Feedback` (`shuttle-tracking-backend/prisma/schema.prisma:16-160`), with PostGIS configured in the datasource (`shuttle-tracking-backend/prisma/schema.prisma:8-10`).

The biggest database risks are structural rather than raw capacity. The schema cannot identify which device/source produced a GPS row, cannot enforce one active trip per vehicle, has no retention or partitioning plan for GPS time-series growth, lacks spatial GiST indexes for geography columns, and depends heavily on application validation for status values, coordinate validity, and lifecycle rules.

The backend currently broadcasts GPS every event but persists only one GPS row per trip per 60 seconds through Redis throttling (`shuttle-tracking-backend/src/services/tracking.service.ts:4-25`). That keeps write volume low, but it means stored GPS history is too sparse for high-fidelity playback if the product expects 1-3 second historical traces.

## 2. Current Database Overview

Database stack:

- PostgreSQL with PostGIS extension declared in Prisma (`shuttle-tracking-backend/prisma/schema.prisma:8-10`).
- Prisma 7 client with PostgreSQL adapter, plus raw SQL for geography reads/writes where Prisma cannot model PostGIS directly (`shuttle-tracking-backend/src/services/tracking.service.ts:28-39`, `shuttle-tracking-backend/src/controllers/public.controller.ts:66-77`).
- Initial migration creates the schema and `CREATE EXTENSION IF NOT EXISTS "postgis"` (`shuttle-tracking-backend/prisma/migrations/20260217070749_init/migration.sql:1-3`).

Model summary:

- `User`: admin auth only, `id`, unique `username`, `passwordHash`, `createdAt` (`shuttle-tracking-backend/prisma/schema.prisma:16-23`).
- `Route`: route master data with `id`, `name`, `color`, `status`, relations to vehicles, route stops, and trips (`shuttle-tracking-backend/prisma/schema.prisma:28-40`).
- `Vehicle`: vehicle master data with optional assigned route, status, trips, and GPS tracks (`shuttle-tracking-backend/prisma/schema.prisma:46-61`).
- `Stop`: stop master data with Thai/English names, optional `geography` location, image URL, status, and route-stop memberships (`shuttle-tracking-backend/prisma/schema.prisma:67-80`).
- `RouteStop`: junction table between routes and stops with `stopOrder`, unique per route/order (`shuttle-tracking-backend/prisma/schema.prisma:86-99`).
- `Trip`: operational trip record with vehicle, route, start/end time, status, and GPS tracks (`shuttle-tracking-backend/prisma/schema.prisma:105-123`).
- `GPSTrack`: time-series location record with trip, vehicle, geography location, speed, heading, station, and recorded time (`shuttle-tracking-backend/prisma/schema.prisma:129-145`).
- `Feedback`: data-only feedback table with type, message, IP address, and created time (`shuttle-tracking-backend/prisma/schema.prisma:151-160`).

## 3. Database Strengths

1. **PostGIS is the right storage foundation.** Stops and GPS tracks use `geography`, and public APIs extract lat/lng with `ST_Y(location::geometry)` and `ST_X(location::geometry)` (`shuttle-tracking-backend/prisma/schema.prisma:71`, `shuttle-tracking-backend/prisma/schema.prisma:133`, `shuttle-tracking-backend/src/controllers/public.controller.ts:72-73`).

2. **Core operational relationships exist.** Vehicles link to routes, trips link to vehicles and routes, GPS tracks link to trips and vehicles, and route-stop ordering is explicit (`shuttle-tracking-backend/prisma/schema.prisma:55-57`, `shuttle-tracking-backend/prisma/schema.prisma:92-98`, `shuttle-tracking-backend/prisma/schema.prisma:115-117`, `shuttle-tracking-backend/prisma/schema.prisma:139-144`).

3. **Route-stop ordering is protected by a unique constraint.** `@@unique([routeId, stopOrder])` prevents two stops from occupying the same order on one route (`shuttle-tracking-backend/prisma/schema.prisma:96`).

4. **The migration history is small and understandable.** One initial migration creates tables, indexes, and FKs; one later migration adds `heading` and `station` to `gps_tracks` (`shuttle-tracking-backend/prisma/migrations/20260217070749_init/migration.sql:1-160`, `shuttle-tracking-backend/prisma/migrations/20260227072309_add_station_to_gps/migration.sql:1-3`).

5. **The existing indexes support several current reads.** Vehicles have indexes on status and assigned route, route stops have route/stop indexes, trips have vehicle/route/status/start indexes, and GPS tracks have trip and vehicle/time indexes (`shuttle-tracking-backend/prisma/schema.prisma:59-60`, `shuttle-tracking-backend/prisma/schema.prisma:97-98`, `shuttle-tracking-backend/prisma/schema.prisma:119-122`, `shuttle-tracking-backend/prisma/schema.prisma:143-144`).

## 4. Critical Issues

### Critical Issue 1: No database-level tracking source or device identity

The schema has `Vehicle` and `GPSTrack`, but no `Device`, `TrackingSource`, source type, source health, source priority, or vehicle-device assignment (`shuttle-tracking-backend/prisma/schema.prisma:46-61`, `shuttle-tracking-backend/prisma/schema.prisma:129-145`). Architecture and backend audits also identify this as a major risk for Mobile, LoRaWAN, and ESP32 support (`docs/audits/architecture-audit.md:7-17`, `docs/audits/backend-audit.md:61-63`).

Impact: the database cannot answer which source produced a GPS row, whether a source is stale, or which source should be trusted when multiple devices report for one vehicle.

### Critical Issue 2: No database constraint prevents multiple active trips per vehicle

`Trip.status` is a free-form string and there is no partial unique index such as one `in_progress` trip per `vehicle_id` (`shuttle-tracking-backend/prisma/schema.prisma:105-123`). The start trip controller creates a new `in_progress` trip every time and then updates the vehicle status separately (`shuttle-tracking-backend/src/controllers/trips.controller.ts:27-39`).

Impact: retries, duplicate requests, or device reconnects can create conflicting active trips for the same vehicle. This is a data integrity issue, not only a controller issue.

### Critical Issue 3: GPS history storage does not match high-fidelity playback needs

The target mentions GPS every 1-3 seconds per vehicle, but the current persistence path writes at most one row every 60 seconds per trip (`shuttle-tracking-backend/src/services/tracking.service.ts:4-25`). `GPSTrack` can store time-series data, but the write policy means the stored table is sampled at low frequency.

Impact: the database can support lightweight history and reports, but not detailed GPS playback unless the retention and sampling strategy is changed intentionally.

### Critical Issue 4: No GPS retention, archiving, or partitioning strategy exists

`gps_tracks` is a single unpartitioned table with no retention marker, archive table, deletion job, or documented lifecycle policy (`shuttle-tracking-backend/prisma/schema.prisma:129-145`). No migration or backend code was found for partitioning or retention.

Impact: if persistence is increased from 60-second sampling to 1-3 second storage, table growth becomes a production concern quickly. At 10 vehicles, 1 row every second is about 864,000 rows/day before indexes.

## 5. Schema Review

`User` is sufficient for current admin login, but it has no role, status, last login, or audit relation. Product audit notes admin role/user management is missing (`docs/audits/product-audit.md:74-80`).

`Route` has simple fields and string `status`. Current public reads filter active routes (`shuttle-tracking-backend/src/controllers/public.controller.ts:18-21`). Not Found: database enum or check constraint limiting route statuses.

`Vehicle` captures current assignment and status. It supports public active vehicle reads through `status` and admin route assignment through `assignedRouteId` (`shuttle-tracking-backend/src/controllers/public.controller.ts:42-46`, `shuttle-tracking-backend/src/controllers/route.controller.ts:93-96`). Not Found: capacity, plate number, active trip pointer, device assignment, or last-known location.

`Stop` stores location as nullable `geography`. This is flexible for admin creation, but public map queries assume a location exists and cast it for coordinate extraction (`shuttle-tracking-backend/src/controllers/public.controller.ts:66-77`). Needs Confirmation: whether a stop without location is valid business data.

`RouteStop` correctly models ordered many-to-many route membership. It prevents duplicate stop order per route but does not prevent the same stop being added twice to the same route at different orders. If loops intentionally revisit a stop, this may be acceptable; otherwise add `@@unique([routeId, stopId])`.

`Trip` stores lifecycle fields but uses string `status` and has no uniqueness rule for active trips. It has no driver/device reference, no source, and no summary fields such as distance or sampled point count.

`GPSTrack` has the essential playback fields: trip, vehicle, geography location, speed, heading, station, and recorded time. It lacks source identity, device-reported timestamp, accuracy, altitude, battery/signal metadata, and ingestion timestamp separation.

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
- `gps_tracks.trip_id` supports trip playback lookups, but a composite `(trip_id, recorded_at)` would better support ordered playback by trip (`shuttle-tracking-backend/prisma/schema.prisma:143`).
- `(vehicle_id, recorded_at DESC)` supports latest/history by vehicle (`shuttle-tracking-backend/prisma/schema.prisma:144`).

Index gaps:

- `routes.status` has no index, although public active routes filter by status. With few routes this is fine; add only if route count grows or query plans show benefit.
- No GiST spatial index exists on `stops.location` or `gps_tracks.location`. Current queries only extract coordinates, so this is not hurting current reads, but future nearest stop, route proximity, bounding-box, and spatial analytics queries will need it.
- No partial unique index enforces one active trip per vehicle.
- No `(trip_id, recorded_at)` index for playback-style ordered reads.
- No index supports feedback workflow by unresolved status because feedback status does not exist.

## 8. GPS Time-Series Data Review

For the stated target of 10 vehicles sending every 1-3 seconds:

- Broadcast path receives every event through Socket.IO (`shuttle-tracking-backend/src/server.ts:68-75`).
- Database persistence is throttled to 60 seconds per trip (`shuttle-tracking-backend/src/services/tracking.service.ts:4-25`).
- The schema stores a `recordedAt` timestamp and indexes by vehicle/time (`shuttle-tracking-backend/prisma/schema.prisma:137`, `shuttle-tracking-backend/prisma/schema.prisma:144`).

Conclusion: the current table design is acceptable for sampled operational history, but the current persistence policy is not aligned with detailed playback. If the product wants playback at the same resolution as live updates, the database needs a deliberate time-series plan: composite playback index, retention policy, and likely date-based partitioning before high-frequency storage is enabled.

Not Implemented:

- Retention or archive policy.
- Date partitioning for `gps_tracks`.
- Device timestamp vs server ingestion timestamp.
- Accuracy persisted, even though the socket payload includes `accuracy` and the broadcast result returns it (`shuttle-tracking-backend/src/services/tracking.service.ts:8`, `shuttle-tracking-backend/src/services/tracking.service.ts:43-45`).

## 9. Multi-Device Readiness Review

Current status: **not structurally ready**.

At the database level, a GPS row can identify only `tripId` and `vehicleId`, not which device or source generated it (`shuttle-tracking-backend/prisma/schema.prisma:129-145`). The backend audit confirms Mobile/LoRaWAN/ESP32 are not modeled as device sources (`docs/audits/backend-audit.md:188-206`).

Minimum schema concepts needed:

- `Device` or `TrackingSource`: id, type (`mobile`, `lorawan`, `esp32`, `simulator`), status, secret/token metadata, created time.
- `VehicleDeviceAssignment`: current and historical assignment between vehicles and devices.
- `GPSTrack.sourceId` or a separate raw `LocationObservation` table to attribute each observation.
- `CurrentVehicleLocation`: optional read model for the selected canonical position per vehicle, including source, freshness, and quality.

## 10. Data Integrity Review

Integrity currently enforced:

- Primary keys and FKs exist for all core tables.
- Username uniqueness exists (`shuttle-tracking-backend/prisma/schema.prisma:18`).
- Route stop order uniqueness exists per route (`shuttle-tracking-backend/prisma/schema.prisma:96`).
- GPS tracks cascade when a trip is deleted (`shuttle-tracking-backend/prisma/schema.prisma:140`).

Integrity relying on application logic:

- Allowed values for route, vehicle, and trip statuses.
- Coordinate validity and non-null stop/GPS location.
- One active trip per vehicle.
- Whether `GPSTrack.vehicleId` matches the vehicle on `GPSTrack.tripId`.
- Whether route-stop duplicates are allowed.
- Whether stop order must be positive.
- Whether `endTime >= startTime`.
- Whether speed and heading ranges are valid.

High-risk example: `handleLocationData` inserts `tripId` and `vehicleId` from the socket payload without checking that the trip belongs to that vehicle (`shuttle-tracking-backend/src/services/tracking.service.ts:8-39`).

## 11. Migration Review

The migration history is coherent:

- `20260217070749_init` creates PostGIS, tables, indexes, and foreign keys in a logical initial schema (`shuttle-tracking-backend/prisma/migrations/20260217070749_init/migration.sql:1-160`).
- `20260227072309_add_station_to_gps` adds nullable `heading` and `station`, a safe additive change (`shuttle-tracking-backend/prisma/migrations/20260227072309_add_station_to_gps/migration.sql:1-3`).

Safety observations:

- PostGIS extension setup is idempotent through `CREATE EXTENSION IF NOT EXISTS`.
- No destructive migrations were found.
- Not Found: migration notes, rollback notes, or data backfill documentation.
- Not Found: spatial GiST indexes in migrations.
- Needs Confirmation: whether production migration workflow is `prisma migrate deploy`, because this audit only inspected repository files.

## 12. Missing Schema Capabilities

- Trip History: partially supported by `Trip` and `GPSTrack`, but no active-trip uniqueness, no summary metrics, and sparse GPS persistence.
- GPS Playback: partially supported, but missing `(trip_id, recorded_at)` index and high-fidelity persistence policy.
- Device Registration: not implemented at schema level.
- Device Health: not implemented at schema level.
- Reports: partially supported by trips/GPS/feedback, but no aggregates, event tables, or lifecycle/status fields for feedback.
- Feedback Workflow: `Feedback` exists, but no status, assignment, relation to route/vehicle/trip/stop, or resolution fields.
- Admin User/Roles: not implemented beyond username/password.
- Current Vehicle State: not implemented as a database read model.
- Audit Log: not implemented for admin changes.

## 13. Recommended Improvements

### Recommendation 1: Add tracking source/device schema

### Problem

The database cannot distinguish Mobile, LoRaWAN, ESP32, simulator, or multiple sources for one vehicle.

### Impact

GPS rows cannot be attributed, source health cannot be tracked, and future failover/source-priority logic has no durable data model.

### Recommendation

Add `Device` or `TrackingSource`, `VehicleDeviceAssignment`, and a `sourceId` reference on GPS observations or a new raw `LocationObservation` table.

### Why

Current schema only links GPS to trip and vehicle (`shuttle-tracking-backend/prisma/schema.prisma:129-145`), while architecture/backend audits identify multi-device support as planned and currently missing.

### Priority

Critical

### Difficulty

Medium

### Learning Topic

Device registry and source attribution.

### Related Files

`shuttle-tracking-backend/prisma/schema.prisma`, `docs/audits/architecture-audit.md`, `docs/audits/backend-audit.md`

### Recommendation 2: Enforce one active trip per vehicle

### Problem

The database allows multiple `in_progress` trips for one vehicle.

### Impact

Trip history, active vehicle state, and playback can become inconsistent under retries or duplicate start requests.

### Recommendation

Add a PostgreSQL partial unique index on `trips(vehicle_id)` where `status = 'in_progress'`. Also update application logic to handle conflict/idempotency.

### Why

The controller creates a trip without checking for an existing active one (`shuttle-tracking-backend/src/controllers/trips.controller.ts:27-34`), and the schema has no uniqueness rule for this lifecycle invariant.

### Priority

Critical

### Difficulty

Medium

### Learning Topic

Partial unique indexes and idempotent writes.

### Related Files

`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/controllers/trips.controller.ts`

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

Completion note: `docs/audits/database-audit.md` has been created.
