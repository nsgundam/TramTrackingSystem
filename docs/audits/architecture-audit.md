# Architecture Audit: Tram Tracking System

Last re-audited: 2026-07-15.

## 1 Executive Summary

Overall assessment after the latest repository changes: the architecture is stronger than the previous audit. The project is still a simple monolith-style web system, which remains appropriate for this MVP, but it now includes the beginning of a real multi-source tracking architecture. The core shape is Next.js frontend, Express REST API, Socket.IO realtime channel, PostgreSQL/PostGIS for operational and spatial data, Redis for public read/current-location state, Socket.IO scale-out, GPS write throttling, and source-selection analytics.

The previous critical risk, "vehicle and tracking source are the same concept," has been partially addressed. The database now has `TrackingSource`, `GPSTrack.sourceId`, source priority, status, secret hash, and last-seen fields. The backend now has Socket.IO, generic HTTP, and TTN ingestion paths that feed a shared `processObservation` pipeline. That pipeline stores per-source last location in Redis, evaluates the highest-priority fresh source for a vehicle, writes canonical current vehicle location to Redis, and persists sampled GPS history with `source_id`.

The remaining architectural risk is now subtler: the new source-selection pipeline exists, but it is not yet fully surfaced as an operations model. Stale/offline state returns `null` instead of becoming an explicit vehicle status event, current canonical location is Redis-only, route-scoped realtime subscriptions are still absent, route-stop cache invalidation is still missing, and frontend map logic still owns ETA/snapping/next-stop behavior.

Recommended production-before-growth focus:

1. Finish operationalizing the tracking-source model: stale/offline state, device health, admin visibility, and source failover reporting.
2. Keep developing the backend-owned tracking pipeline into the source of truth for current vehicle state.
3. Add query/read models for active vehicles, active trips, and trip history.
4. Fix route-stop cache invalidation and add route-stop management support.
5. Move route geometry/ETA ownership toward a stable contract, even if final visualization remains frontend-side.
6. Keep the deployment architecture simple; the current monolith backend is still the right level of complexity.

## 2 Architecture Overview

Frontend:

- Next.js app with a public tracker and admin pages.
- Public tracker loads stops from public REST endpoints, listens to Socket.IO `location-update`, renders Leaflet maps, and calculates ETA/route snapping in `ShuttleTracker.tsx`.
- Admin pages cover dashboard, vehicles, routes, and stops. The sidebar exposes only those four areas.

Evidence:

- Knowledge base identifies the frontend as a Next.js app with public map and admin pages (`docs/project-knowledge-base.md:26-35`).
- Public tracker subscribes to `location-update` through Socket.IO (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`).
- Admin live map also subscribes to `location-update` (`shuttle-tracking-web/components/admin/LiveMap.tsx:27-43`).
- Admin sidebar contains Dashboard, Vehicles, Routes, and Stops only (`shuttle-tracking-web/components/admin/Sidebar.tsx:15-36`).

Backend:

- Express app mounts auth, public, admin vehicle/route/stop/route-stop/device, trip, and ingest routes.
- Socket.IO receives legacy `send-location`, adapts it into source-based observation input, calls `processObservation`, and broadcasts the returned canonical location.
- HTTP and TTN ingestion routes also call the same tracking pipeline and broadcast the canonical location when one is selected.
- Health and readiness endpoints are present.

Evidence:

- Route mounting is centralized in `server.ts` (`shuttle-tracking-backend/src/server.ts:53-67`).
- Socket.IO adapts `send-location` into `processObservation` and emits `location-update` (`shuttle-tracking-backend/src/server.ts:97-126`).
- HTTP and TTN ingest routes feed `processObservation` (`shuttle-tracking-backend/src/routes/ingest.route.ts:10-61`, `shuttle-tracking-backend/src/routes/ingest.route.ts:67-142`).
- Health and readiness checks exist (`shuttle-tracking-backend/src/server.ts:68-89`).

Database:

- PostgreSQL/PostGIS via Prisma schema.
- Domain entities include User, Route, Vehicle, Stop, RouteStop, Trip, GPSTrack, TrackingSource, and Feedback.
- Stop and GPSTrack use PostGIS geography fields.
- GPSTrack can now reference the selected tracking source that produced the canonical persisted location.

Evidence:

- Prisma models and relationships are defined in `schema.prisma` (`shuttle-tracking-backend/prisma/schema.prisma:16-193`).
- Stop has `location Unsupported("geography")` (`shuttle-tracking-backend/prisma/schema.prisma:67-80`).
- GPSTrack has trip, vehicle, source, location, speed, heading, station, and recorded time (`shuttle-tracking-backend/prisma/schema.prisma:131-149`).
- TrackingSource has type, vehicle assignment, priority, status, secret hash, and last seen time (`shuttle-tracking-backend/prisma/schema.prisma:155-173`).

Redis:

- Used for public API cache, per-source last location, canonical current vehicle location, source-selection analytics, GPS write throttle, and Socket.IO Redis adapter.

Evidence:

- Server connects Redis and attaches Socket.IO Redis adapter (`shuttle-tracking-backend/src/server.ts:130-142`).
- Public API caches route and stop reads for 300 seconds (`shuttle-tracking-backend/src/controllers/public.controller.ts:5-24`, `shuttle-tracking-backend/src/controllers/public.controller.ts:73-143`).
- Source last location is stored in `source:last_location:<sourceId>` (`shuttle-tracking-backend/src/services/tracking.service.ts:63-77`).
- Current canonical location is stored in `vehicle:current_location:<vehicleId>` (`shuttle-tracking-backend/src/services/tracking.service.ts:151-155`).
- GPS write throttle uses `trip:last_saved:<tripId>` with 60-second expiration (`shuttle-tracking-backend/src/services/tracking.service.ts:218-240`).

Realtime:

- Socket.IO remains the realtime channel to browsers.
- Backend emits selected canonical location updates globally with `io.emit("location-update", canonicalLocation)`.
- Ingestion is no longer Socket.IO-only; HTTP and TTN can produce the same realtime event.

Evidence:

- Socket handler emits after `processObservation` returns a canonical location (`shuttle-tracking-backend/src/server.ts:101-116`).
- HTTP and TTN ingest routes emit the same event through the app-shared Socket.IO instance (`shuttle-tracking-backend/src/routes/ingest.route.ts:37-43`, `shuttle-tracking-backend/src/routes/ingest.route.ts:118-124`).

Devices:

- Implemented device architecture now includes a `TrackingSource` registry and admin device CRUD API.
- Supported ingestion paths are legacy Socket.IO `send-location`, generic HTTP `/api/ingest/http`, and TTN webhook `/api/ingest/ttn`.
- Device/source priority and freshness are used to choose canonical vehicle location.
- Admin frontend still does not expose device management in the sidebar, so the device capability is backend/API-level.

Evidence:

- TrackingSource model exists (`shuttle-tracking-backend/prisma/schema.prisma:155-173`).
- Admin device routes exist under `/api/admin/devices` (`shuttle-tracking-backend/src/server.ts:56-62`, `shuttle-tracking-backend/src/routes/devices.route.ts:13-21`).
- HTTP and TTN ingestion routes exist (`shuttle-tracking-backend/src/routes/ingest.route.ts:10-142`).
- Source priority and 30-second freshness selection are implemented (`shuttle-tracking-backend/src/services/tracking.service.ts:97-160`).
- Admin sidebar still exposes only Dashboard, Vehicles, Routes, and Stops (`shuttle-tracking-web/components/admin/Sidebar.tsx:15-36`).

External services:

- Runtime external services include PostgreSQL/PostGIS, Redis, map tiles, CARTO tiles, OSRM fallback, Flaticon icons, and optional TTN webhook integration.
- Production hosting targets are still not evidenced in repo.

Evidence:

- Knowledge base lists external runtime services and missing TTN/production provider evidence (`docs/project-knowledge-base.md:345-411`).
- TTN webhook route expects a TTN-like uplink payload and optional `TTN_WEBHOOK_SECRET` (`shuttle-tracking-backend/src/routes/ingest.route.ts:67-142`).

## 3 Architecture Strengths

### Strength 1: MVP stack is simple and coherent

The current stack uses a conventional single backend with REST for request/response flows and Socket.IO for live GPS updates. For the current MVP, this is simpler and more maintainable than introducing distributed architecture.

Evidence:

- Express routes are grouped by API area (`shuttle-tracking-backend/src/server.ts:50-62`).
- Socket.IO event flow is direct and easy to reason about (`shuttle-tracking-backend/src/server.ts:68-80`).
- Docker Compose expresses the logical local stack as frontend, backend, database, and Redis (`docker-compose.yml:1-99`).

### Strength 2: PostGIS is the right data foundation for location features

The project stores stop and GPS locations in geography fields. This supports future distance, nearest stop, route proximity, and spatial analytics better than storing only plain lat/lng columns.

Evidence:

- Stop has a PostGIS geography field (`shuttle-tracking-backend/prisma/schema.prisma:67-80`).
- GPSTrack has a PostGIS geography field and time indexes (`shuttle-tracking-backend/prisma/schema.prisma:129-145`).
- Public API extracts coordinates from PostGIS geography with `ST_Y` and `ST_X` (`shuttle-tracking-backend/src/controllers/public.controller.ts:66-77`).

### Strength 3: Ordered route-stop relationship exists

The route-stop model already captures many-to-many route membership with `stopOrder`. This is architecturally necessary for route display and ETA.

Evidence:

- RouteStop has `routeId`, `stopId`, `stopOrder`, and uniqueness on route/order (`shuttle-tracking-backend/prisma/schema.prisma:86-99`).
- Product audit identifies route-stop UI as product-missing but backend API-present (`docs/audits/product-audit.md:180-198`).

### Strength 4: Redis adapter prepares Socket.IO for modest horizontal scaling

The backend already attaches the Socket.IO Redis adapter. This is a good fit if the backend later runs more than one Node process.

Evidence:

- Server duplicates Redis clients and attaches `createAdapter` (`shuttle-tracking-backend/src/server.ts:89-96`).

### Strength 5: GPS track persistence supports trip history and replay foundations

Trip and GPSTrack entities already exist, and GPS tracks now optionally record source identity. Product features like trip history, reports, device comparison, and playback can be added without replacing the data store.

Evidence:

- Trip model includes vehicle, route, start/end, status, and indexes (`shuttle-tracking-backend/prisma/schema.prisma:105-123`).
- GPSTrack links to trip, vehicle, optional tracking source, and recorded time (`shuttle-tracking-backend/prisma/schema.prisma:131-149`).
- Product audit recommends trip history because trips and GPS tracks are already stored (`docs/audits/product-audit.md:240-266`).

### Strength 6: Multi-source tracking architecture has started

The repository now has an actual tracking-source registry, source-aware ingestion, source priority selection, and canonical current vehicle location cache. This directly addresses the biggest device architecture concern from the first architecture audit.

Evidence:

- `TrackingSource` captures device/source identity, type, priority, status, secret hash, vehicle assignment, and last seen time (`shuttle-tracking-backend/prisma/schema.prisma:155-173`).
- `processObservation` authenticates/validates a source observation, stores per-source last location, updates last seen, evaluates canonical vehicle location, and persists sampled history (`shuttle-tracking-backend/src/services/tracking.service.ts:24-245`).
- HTTP and TTN ingestion routes share the same observation pipeline (`shuttle-tracking-backend/src/routes/ingest.route.ts:10-142`).

## 4 Architecture Risks

### High: Tracking-source architecture exists but is not fully operationalized

Problem

The architecture now models `TrackingSource`, source priority, source status, source secrets, and `GPSTrack.sourceId`. However, the model is still mostly backend/API-level. It is not yet fully exposed as an operational capability for admins, and stale/offline source state is not represented as an explicit event or durable vehicle state.

Current Impact

The backend can distinguish phone-like, HTTP, TTN/LoRaWAN, ESP32-style, and simulator sources if they are registered as tracking sources. It can choose a canonical location by priority and 30-second freshness. Admin users still cannot manage devices from the frontend, and dashboards do not yet show device/source health.

Future Risk

Multiple tracking sources can now be ingested, but operational questions remain: why did failover happen, which sources are stale, which source is currently authoritative, and whether a vehicle is live, stale, or offline. Without surfacing those states, the system can silently stop broadcasting when all sources are stale.

Recommendation

Finish the tracking-source operating model:

- Add admin UI/API read models for source health, last seen, assigned vehicle, priority, and active source.
- Emit or expose stale/offline vehicle state when `evaluateCanonicalLocation` finds no fresh source.
- Decide whether source health/current vehicle state should remain Redis-only or be periodically persisted.
- Add a clear failover/audit view showing which source was selected and why.

Reason

The schema now has `TrackingSource` and `GPSTrack.sourceId` (`shuttle-tracking-backend/prisma/schema.prisma:131-173`). `evaluateCanonicalLocation` selects the highest-priority source with a fresh Redis observation and returns `null` if all sources are stale (`shuttle-tracking-backend/src/services/tracking.service.ts:97-160`). Admin device routes exist, but admin navigation still does not expose device management (`shuttle-tracking-backend/src/routes/devices.route.ts:13-21`, `shuttle-tracking-web/components/admin/Sidebar.tsx:15-36`).

Difficulty

Medium.

Priority

High.

Research Topic

Device health, source failover, and realtime operational state.

Expected Benefit

Admins can trust the live map because they can see not only the chosen location, but also whether source data is fresh, stale, failed over, or offline.

Mentor Mode

What is it? Operationalizing tracking sources means turning device/source data into states people can monitor and act on.

Why does it exist? A source registry is useful only when the system can explain which source is being trusted and whether other sources are healthy.

Does this project need it? Yes. The source abstraction now exists, so the next architectural need is making it visible and reliable for operations.

Should it be implemented now? Yes, before relying on multiple physical devices in daily operation.

What happens if postponed? Failover may happen invisibly or stale sources may simply disappear from realtime output without a clear operator-facing explanation.

Estimated learning difficulty: Medium.

Learning priority: High.

### Medium: Location ingestion pipeline is improved but raw observation history is not durable

Problem

The location pipeline now separates ingestion, validation/authentication, per-source Redis observation, canonical source selection, current-location cache, and sampled GPS persistence. However, raw source observations are stored only in Redis as last-known values, while the database stores sampled canonical history.

Current Impact

The live map receives a cleaner canonical location, and GPSTrack rows include `source_id`. This is enough for MVP live tracking and basic trip history.

Future Risk

Detailed source comparison, debugging, and replay may be limited because non-selected source observations are not durably stored. A LoRaWAN source and a phone source can both report, but only the selected sampled canonical location is persisted to `gps_tracks`.

Recommendation

Keep the current simple design for MVP, but make an explicit retention decision:

1. Store only canonical sampled history for normal operations.
2. Store raw source observations for a short debug window.
3. Store raw source observations only for selected vehicles/incidents.

Reason

`processObservation` stores raw latest source data in Redis (`shuttle-tracking-backend/src/services/tracking.service.ts:63-77`). `persistSampledHistory` writes only the selected canonical location to `gps_tracks` with source ID (`shuttle-tracking-backend/src/services/tracking.service.ts:167-245`).

Difficulty

Medium.

Priority

Medium.

Research Topic

Raw observation retention versus canonical history.

Expected Benefit

The team can balance storage cost and debugging needs without over-building the data model.

Mentor Mode

What is it? Raw observation retention is the decision of whether to store every source report, not only the selected location.

Why does it exist? Debugging GPS quality and source failover often requires seeing rejected or lower-priority source data.

Does this project need it? Maybe. It is valuable for production diagnostics, but not always needed for the first MVP.

Should it be implemented now? Decide now; implement durable raw history only if operations require it.

What happens if postponed? Source comparison and incident investigation will rely on Redis last-known state and sampled canonical GPS history only.

Estimated learning difficulty: Medium.

Learning priority: Medium.

### High: Trip lifecycle logic is spread across controller and tracking service

Problem

Trip start/end changes trip rows, vehicle status, and Redis throttle keys directly inside the controller. Tracking service separately writes GPS tracks and decides station normalization.

Current Impact

Trip start/end works. However, the trip domain has no single owner.

Future Risk

Adding active trip monitor, trip history, driver workflow, alerts, and device health will require logic that touches trip status, vehicle status, location recency, and GPS tracks. If those rules remain spread out, changes will be fragile.

Recommendation

Create a Trip/Operations domain service that owns:

- start trip
- end trip
- active trip lookup
- vehicle operational status
- current trip state
- stale trip/location rules

Reason

Trip controller starts trips and sets vehicle status active (`shuttle-tracking-backend/src/controllers/trips.controller.ts:27-39`). It ends trips, sets vehicle inactive, and clears Redis throttle (`shuttle-tracking-backend/src/controllers/trips.controller.ts:52-72`). Product audit marks trip history and stale/offline visibility as MVP-critical/important gaps (`docs/audits/product-audit.md:240-266`, `docs/audits/product-audit.md:314-340`).

Difficulty

Medium.

Priority

High.

Research Topic

Domain service boundaries.

Expected Benefit

Trip history, active trip monitor, and driver workflow can grow without duplicating business rules.

Mentor Mode

What is it? A domain service centralizes rules that do not belong purely to HTTP or database code.

Why does it exist? Controllers should translate HTTP, while services protect business meaning.

Does this project need it? Yes, because trip lifecycle affects multiple product areas.

Should it be implemented now? Yes during Phase 1 architecture cleanup.

What happens if postponed? Each feature may implement its own interpretation of active/inactive/completed/stale.

Estimated learning difficulty: Medium.

Learning priority: High.

### High: Frontend owns important tracking intelligence

Problem

Public tracker calculates ETA, snaps vehicle markers to route geometry, infers previous/next stops, and manages route geometry cache in one large frontend component.

Current Impact

The public experience works without heavy backend computation.

Future Risk

Admin, public, reports, notifications, and APIs may disagree about ETA, next stop, route position, and stale status because the backend does not own these concepts.

Recommendation

Keep map rendering frontend-side, but move shared tracking facts behind API/realtime contracts:

- vehicle current route
- current/next stop
- last seen time
- source status
- backend timestamp
- optional ETA estimate when stable enough

Reason

ETA calculation is in `ShuttleTracker.tsx` (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:92-171`). Route snapping and next/previous stop inference are also frontend-side (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:315-480`). Route geometry fallback calls OSRM directly from the browser (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:578-590`).

Difficulty

Medium to High.

Priority

High.

Research Topic

Backend read models for realtime UI.

Expected Benefit

Consistent public/admin/reports behavior and cleaner frontend modules.

Mentor Mode

What is it? A read model is a backend-owned view of data shaped for screens or realtime clients.

Why does it exist? It lets many clients share the same interpretation of operational state.

Does this project need it? Yes, once trip history, alerts, and reports depend on the same state as the map.

Should it be implemented now? Start with last seen and current vehicle state now; ETA can be moved later.

What happens if postponed? Screens will keep reimplementing tracking logic independently.

Estimated learning difficulty: Medium.

Learning priority: High.

### Medium: Realtime broadcast is global and not route-scoped

Problem

Every `location-update` is emitted to every Socket.IO client.

Current Impact

For a small MVP, this is simple and acceptable.

Future Risk

At 50-100 vehicles and more public clients, all clients receive updates they may not need. Public route-specific screens and admin views cannot subscribe narrowly.

Recommendation

Introduce Socket.IO rooms by route and possibly admin/public channel:

- `route:R01`
- `route:R02`
- `admin:live`

Reason

Server uses global `io.emit` (`shuttle-tracking-backend/src/server.ts:72-75`). Public UI filters vehicles by selected route after receiving data (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:223-230`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:409-415`).

Difficulty

Low to Medium.

Priority

Medium.

Research Topic

Socket.IO rooms and subscription design.

Expected Benefit

Lower client noise and cleaner realtime ownership when vehicles/routes increase.

Mentor Mode

What is it? A room is a named realtime channel clients can join.

Why does it exist? It avoids sending irrelevant events to every client.

Does this project need it? Not urgently for MVP, but yes before scaling public usage.

Should it be implemented now? Not first. Do it after tracking-source and current-state design.

What happens if postponed? More browser CPU/network use and harder realtime evolution.

Estimated learning difficulty: Low to Medium.

Learning priority: Medium.

### Medium: Public cache invalidation is coarse and misses route-stop mutations

Problem

Public cache invalidation exists for route, stop, and vehicle controllers, but route-stop mutations do not call it. Cache invalidation deletes all public caches and scans route-stop keys with `KEYS`.

Current Impact

Most admin CRUD can refresh public data. Route-stop API changes may leave stale public route stop data until TTL expires.

Future Risk

Route-stop management is Phase 1 critical in Product Audit. If admin users reorder stops, stale route data can mislead public ETA and maps.

Recommendation

Make route-stop mutations invalidate affected route cache. Prefer targeted key deletion over global `KEYS` as data grows.

Reason

Cache invalidation deletes `public:route_stops:*` keys using Redis `keys` (`shuttle-tracking-backend/src/services/cache.service.ts:8-21`). Route-stop controller creates/deletes route stops without invalidation (`shuttle-tracking-backend/src/controllers/routeStops.controller.ts:43-71`). Product audit marks route-stop UI as Phase 1 Critical (`docs/audits/product-audit.md:180-198`).

Difficulty

Low.

Priority

Medium.

Research Topic

Cache invalidation strategy.

Expected Benefit

Public route data remains accurate after route-stop administration.

Mentor Mode

What is it? Cache invalidation is the rule for removing old cached data after writes.

Why does it exist? Cached reads are fast, but wrong cache is worse than slow data.

Does this project need it? Yes, because public route stops are cached.

Should it be implemented now? Yes when route-stop UI/API is improved.

What happens if postponed? Admin route changes may not appear immediately on public maps.

Estimated learning difficulty: Low.

Learning priority: Medium.

### Medium: Missing operational concepts for production

Problem

The domain model lacks announcements, incidents, alerts, device health, admin roles, and audit logs.

Current Impact

The MVP can show positions and manage base data, but cannot explain service problems or operational health.

Future Risk

Reports, notifications, and production support may be built as unrelated one-off features instead of coherent operational modules.

Recommendation

Add these concepts only when product phase requires them, starting with stale/offline status and device health. Do not add a large operations model prematurely.

Reason

Product audit identifies missing alerts, reports, device health, and admin user/role management (`docs/audits/product-audit.md:405-430`). Current schema now includes TrackingSource and Feedback, but does not yet include alert, incident, announcement, admin role, or audit-log concepts (`shuttle-tracking-backend/prisma/schema.prisma:16-193`).

Difficulty

Medium.

Priority

Medium.

Research Topic

Operational monitoring domain model.

Expected Benefit

Future production features fit a clear model instead of being scattered.

Mentor Mode

What is it? Operational concepts represent things staff need to monitor or act on.

Why does it exist? A live tracking product is also an operations product.

Does this project need it? Yes, but incrementally.

Should it be implemented now? Implement stale/offline and device health first; postpone reports/announcements until Phase 2/3.

What happens if postponed? Production support will rely on manual inspection.

Estimated learning difficulty: Medium.

Learning priority: Medium.

## 5 Domain Model Review

Vehicle:

- Current model is good for fleet identity and route assignment.
- Vehicle is now distinct from TrackingSource.
- Vehicle status currently doubles as operational state and live tracking status.

Trip:

- Strong MVP foundation: vehicle, route, start/end time, status.
- A database partial unique index now prevents more than one `in_progress` trip per vehicle.
- Missing explicit driver/source association at the trip level and derived trip/current-state read models.

Route:

- Good MVP entity with ID, name, color, status, vehicles, route stops, and trips.
- Missing route geometry as backend-owned data. Geometry currently lives as frontend static JSON/localStorage/OSRM fallback.

Stop:

- Good MVP entity with names, image, status, and PostGIS location.
- Works with RouteStop for ordered routes.

GPS Track:

- Good history foundation.
- Now records optional source ID.
- Still needs an explicit decision on raw observation history, accuracy history, raw received timestamp, selected/canonical flag, and ingestion metadata if source comparison becomes important.

Feedback:

- Public feedback submission API and service now exist.
- Still needs admin review workflow, feedback status, assignment, or triage fields if it becomes an operational inbox.

User:

- Suitable for one admin role MVP.
- Future admin roles are not modeled.

Missing Concepts:

- Durable CurrentVehicleLocation if Redis-only state is not enough for operations.
- LocationObservation/raw source event if source comparison/debugging is required.
- Explicit DeviceHealth or SourceHealth read model.
- Alert/Incident/Announcement.
- Admin role/permission if staff grows.
- AuditLog if operational accountability is needed.

## 6 Data Flow Review

Public flow:

- Browser loads public tracker.
- Fetches route stops.
- Loads local route geometry or calls OSRM.
- Receives `location-update`.
- Frontend calculates map snapping, next/previous stop, and ETA.

Assessment: suitable for MVP; risky for consistency once public/admin/reports need shared tracking facts.

Admin flow:

- Admin logs in.
- Protected admin pages call REST CRUD APIs.
- Admin live map receives global `location-update`.

Assessment: simple and appropriate for MVP. Missing route-stop UI and trip/alerts pages are product gaps, but architecture should prepare a shared operations service.

Realtime flow:

- Socket client can emit legacy `send-location`.
- HTTP/ESP32-style client can post to `/api/ingest/http`.
- TTN can post uplink data to `/api/ingest/ttn`.
- Backend validates/authenticates source observations, stores per-source last location in Redis, evaluates canonical current vehicle location, persists sampled canonical GPS track, and broadcasts `location-update`.

Assessment: much stronger than the previous audit. Needs route-scoped rooms and explicit stale/offline handling.

Trip flow:

- Device starts trip through REST.
- Backend creates trip and sets vehicle active.
- Device sends GPS.
- Device ends trip through REST.
- Backend completes trip, sets vehicle inactive, clears throttle key.

Assessment: enough for simulator. Needs active-trip read path, driver workflow support, source association, and history/replay APIs.

GPS flow:

- Source observations update Redis last-known source state.
- Canonical vehicle location is written to Redis.
- Canonical GPS history writes are throttled to 60 seconds per trip.
- All selected realtime updates are still broadcast globally.

Assessment: write throttling protects DB volume for MVP. For analytics/replay, fixed 60-second sampling may be too coarse; decide retention and sampling policy before production.

Feedback flow:

- Public feedback API exists at `/api/public/feedback`.
- Feedback service validates vehicle existence before creating feedback.
- No admin review UI/API flow was found.

Assessment: no longer data-only, but still not a full feedback workflow.

Future IoT flow:

- TTN webhook path exists.
- Generic HTTP ingest path exists for ESP32/mobile-style sources.
- All source types use the same `processObservation` boundary.

Assessment: architecture is directionally ready for early IoT experiments. Production still needs source health, failover visibility, and payload contract documentation.

## 7 Module Review

Authentication:

- Admin auth and vehicle verification are grouped under auth.
- Vehicle verification is not a full device identity/session model.

Tracking:

- Tracking service now owns source observation processing, source priority selection, canonical current location, analytics counters, and sampled GPS persistence.
- It should next expose explicit stale/offline state and clearer read models.

Trip:

- Trip lifecycle currently lives in controller.
- Should move to a trip/operations service.

Vehicle:

- Vehicle controller handles CRUD and public cache invalidation.
- Vehicle assignment to route exists.
- Device association exists through TrackingSource.vehicleId.

Admin:

- Admin API areas are separated by entity.
- Admin device API exists.
- Future operations dashboard needs cross-entity read models, not only entity CRUD.

Feedback:

- Public feedback module exists.
- Admin review/triage module does not exist.

Public:

- Public API is read-focused and cached.
- Active vehicles now include current location from Redis when available.
- Should eventually expose stale/offline and source-health state, not just active vehicles with optional location.

## 8 Device Architecture Review

Phone:

- Legacy Socket.IO still supports a phone/mobile-like sender.
- Generic HTTP ingest can also support mobile-style sources if they are registered as TrackingSource.
- Missing full driver UI/session.

LoRaWAN:

- TTN webhook route exists and maps TTN `device_id`/`dev_eui` to `sourceId`.
- Production payload decoder contract, source provisioning, and latency/accuracy rules still need to be documented.

ESP32:

- Generic HTTP ingest route exists and can support ESP32-style posting.
- MQTT is not present, but not required by current evidence.

Multiple devices:

- Supported at the domain level through multiple TrackingSource rows assigned to one vehicle.
- Canonical source selection uses priority and freshness.

Failover:

- Basic failover is implemented by choosing the first fresh source by priority.
- Failover is not yet visible as an admin/operations event.

Device Registration:

- Admin device CRUD API exists.
- Admin frontend device management is not exposed.

Tracking Source:

- Present and now one of the architecture strengths.

## 9 Scalability Review

10 vehicles:

- Current architecture should work.
- Global broadcasts and frontend calculations are acceptable.
- 60-second DB write throttle limits GPS history volume.

50 vehicles:

- Backend stack can likely handle it with Redis adapter and PostGIS.
- Global broadcast becomes noisy, especially for public clients viewing one route.
- Frontend-heavy route snapping/ETA may become harder on low-end phones.

100 vehicles:

- Architecture needs route-scoped realtime rooms, current-location read model, source-aware ingestion, and explicit retention/sampling policies.
- Still does not require microservices or Kubernetes based on current evidence.

Future expansion without changing architecture:

- Possible if "architecture" evolves inside the monolith: domain services, source adapters, read models, and scoped realtime subscriptions.
- More possible than before because new source types can feed `processObservation`; still limited by route-scoped realtime, stale/offline state, and operational read models.

## 10 Maintainability Review

Coupling:

- Frontend map component is coupled to route geometry, ETA, snapping, event handling, and UI state.
- Backend controller logic is coupled to domain state transitions.

Modularity:

- Basic module structure exists: routes, controllers, services, config, middleware.
- Service layer is thin and unevenly applied.

Extensibility:

- Entity CRUD is extensible.
- Multi-source tracking is now extensible at the ingestion/domain level.
- Operational visibility is not yet extensible enough for production support.

Technical Debt:

- Acceptable MVP debt: frontend-heavy live map logic and global realtime broadcasts.
- Production-risk debt: Redis-only current state, no stale/offline event/read model, no device UI, and trip lifecycle still split between controller and tracking service.

## 11 Future Readiness

Trip History:

- Data exists. Needs API/read model and admin UI.
- Readiness: Medium.

Replay:

- GPSTrack supports basic replay.
- 60-second sampling may limit playback quality.
- Readiness: Medium-Low.

Analytics:

- Trips and GPS tracks support simple metrics.
- Need retention and aggregation decisions.
- Readiness: Medium-Low.

Reports:

- Data foundation exists, but no reporting module.
- Readiness: Low.

Notifications:

- No alert/notification model.
- Readiness: Low.

Multiple Device Sources:

- Tracking source/device model now exists, with HTTP and TTN ingestion.
- Needs operational health/failover visibility before production.
- Readiness: Medium.

Production:

- MVP architecture is promising, but production still needs stale/offline state, route-stop cache correctness, operational read models, admin device visibility, and clearer deployment ownership.
- Readiness: Medium-Low.

## 12 Architecture Score

Architecture: 7.5/10

Reason: Good MVP stack, clear high-level client/server/realtime/database structure, and a new source-aware tracking pipeline. Domain service boundaries and operational read models still need work.

Scalability: 6.5/10

Reason: Redis adapter, write throttling, and Redis current-location state help. Global broadcasts and frontend-heavy computation still limit growth.

Maintainability: 6/10

Reason: Repository has recognizable module organization, but business rules are split across controllers, services, and frontend.

Extensibility: 6.5/10

Reason: CRUD modules are extensible, and device/source expansion now has a shared ingestion pipeline. Operations visibility and raw observation decisions remain open.

Realtime: 6.5/10

Reason: Socket.IO flow is simple and now broadcasts canonical source-selected locations. Needs rooms and explicit stale/offline events.

Device Support: 6/10

Reason: TrackingSource registry, source priority, HTTP ingest, and TTN ingest exist. Needs admin UI, device health, failover visibility, and production payload contracts.

Overall: 6.8/10

Reason: Stronger than the first audit and now directionally ready for multi-source experiments, but not yet production-ready for operations.

## 13 Refactoring Roadmap

### Phase 1

- Add admin device/source management UI or at least an operations device-health page.
- Add explicit stale/offline current vehicle state.
- Move trip lifecycle rules from controller into a trip/operations service.
- Fix route-stop cache invalidation when route-stop APIs mutate data.
- Add route-stop management support using existing ordered relationship.

### Phase 2

- Add active trip and trip history read models.
- Add route-scoped Socket.IO rooms.
- Add failover history/analytics visible to admins.
- Add feedback admin inbox if feedback remains in product scope.
- Decide raw observation retention policy.

### Phase 3

- Add trip replay architecture and retention policy.
- Add reporting/analytics aggregation.
- Add announcements/incidents/alerts model if operations require it.
- Add admin role/audit model if multiple staff roles are introduced.

## 14 Learning Topics

Tracking Source Modeling

What: Separating vehicle identity from GPS sender identity.

Why: Required for mobile, LoRaWAN, and ESP32 support.

When: Already started; continue in Phase 1 through device health and admin visibility.

Difficulty: Medium.

Priority: High.

Domain Services

What: A service layer that owns business rules independent of HTTP controllers.

Why: Trip lifecycle and tracking rules cross multiple entities.

When: Phase 1.

Difficulty: Medium.

Priority: High.

Realtime Subscription Design

What: Using Socket.IO rooms/channels based on route or audience.

Why: Avoid sending every vehicle update to every client.

When: Phase 2.

Difficulty: Low to Medium.

Priority: Medium.

Current-State Read Models

What: A backend-owned model optimized for "what is happening now."

Why: Dashboard, public map, alerts, and reports need shared truth.

When: Phase 1-2.

Difficulty: Medium.

Priority: High.

Cache Invalidation

What: Rules for clearing stale cached data after writes.

Why: Route-stop changes must update public maps quickly.

When: Phase 1.

Difficulty: Low.

Priority: Medium.

Operational Staleness

What: Rules for deciding whether a vehicle/source is live, stale, or offline.

Why: Live maps can mislead users if old locations remain visible.

When: Phase 1.

Difficulty: Medium.

Priority: High.

## 15 Architecture Questions

1. What tracking sources are required for production: phone, LoRaWAN/TTN, ESP32, or all three?
2. Can one vehicle have more than one active tracking source at the same time?
3. Which source wins if phone GPS and ESP32 disagree?
4. What is the acceptable stale threshold for public users and admins?
5. What GPS update frequency is expected from each source?
6. Should GPSTrack store every raw observation, sampled observations, or only canonical observations?
7. How long should GPS history be retained?
8. Should route geometry be owned by backend/admin data instead of frontend static files and OSRM fallback?
9. Is ETA intended to be an approximate frontend display or an official backend-provided value?
10. What production hosting topology is intended for frontend, backend, database, Redis, and TTN webhook?
11. Is feedback part of MVP or Phase 2?
12. Will admin users need roles, permissions, or audit logs?

## 16 Handoff

Next recommended agents:

Backend Audit Agent

Reason: Backend should review service boundaries, trip lifecycle ownership, tracking ingestion design, route-stop cache invalidation, current-state APIs, and Socket.IO rooms.

Database Audit Agent

Reason: Database should review whether schema supports tracking sources, device health, current vehicle state, GPS retention, trip history, route geometry, and reporting.

Infrastructure & Device Audit Agent

Reason: Device/infrastructure review should design TTN/LoRaWAN/ESP32 ingestion, deployment topology, Redis/Postgres production ownership, and realtime scaling constraints.
