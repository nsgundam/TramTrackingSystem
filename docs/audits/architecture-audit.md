# Architecture Audit: Tram Tracking System

## 1 Executive Summary

Overall assessment: the current architecture is suitable for a real-time tracking MVP and can support the next small product phases if the team keeps the design simple. The core shape is appropriate: Next.js frontend, Express REST API, Socket.IO realtime channel, PostgreSQL/PostGIS for operational and spatial data, and Redis for public read caching, Socket.IO scale-out, and GPS write throttling.

The main architectural risk is not the technology stack. The risk is that the system currently treats "vehicle" and "tracking source" as the same concept. Product and discovery documents expect mobile, LoRaWAN/TTN, and ESP32 sources, possibly multiple sources for one vehicle. The repository currently has only one implemented ingestion path: Socket.IO `send-location` to `handleLocationData`, then `location-update` broadcast. There is no device/source model, source priority, source health, failover, or canonical "current vehicle position" concept.

The second major risk is responsibility placement. Some domain behavior is in backend services, but significant operational rules live directly in controllers and frontend map components. This is acceptable for an MVP, but it will become harder to add trip history, stale/offline status, replay, analytics, and multiple tracking sources without duplicating logic.

Recommended production-before-growth focus:

1. Introduce a minimal tracking-source/device concept.
2. Create a backend-owned tracking domain service for trip lifecycle, location ingestion, source selection, current vehicle state, and stale/offline status.
3. Add query/read models for active vehicles and trip history.
4. Move route geometry/ETA ownership toward a stable contract, even if final visualization remains frontend-side.
5. Keep the deployment architecture simple; the current monolith backend is still the right level of complexity.

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

- Express app mounts auth, public, admin vehicle/route/stop/route-stop, and trip routes.
- Socket.IO receives `send-location`, passes raw payload to `handleLocationData`, and broadcasts the result as `location-update`.

Evidence:

- Route mounting is centralized in `server.ts` (`shuttle-tracking-backend/src/server.ts:50-62`).
- Socket.IO location event flow is in `server.ts` (`shuttle-tracking-backend/src/server.ts:68-80`).

Database:

- PostgreSQL/PostGIS via Prisma schema.
- Domain entities include User, Route, Vehicle, Stop, RouteStop, Trip, GPSTrack, and Feedback.
- Stop and GPSTrack use PostGIS geography fields.

Evidence:

- Prisma models and relationships are defined in `schema.prisma` (`shuttle-tracking-backend/prisma/schema.prisma:16-160`).
- Stop has `location Unsupported("geography")` (`shuttle-tracking-backend/prisma/schema.prisma:67-80`).
- GPSTrack has trip, vehicle, location, speed, heading, station, and recorded time (`shuttle-tracking-backend/prisma/schema.prisma:129-145`).

Redis:

- Used for public API cache, GPS write throttle, and Socket.IO Redis adapter.

Evidence:

- Server connects Redis and attaches Socket.IO Redis adapter (`shuttle-tracking-backend/src/server.ts:84-96`).
- Public API caches reads for 300 seconds (`shuttle-tracking-backend/src/controllers/public.controller.ts:5-24`).
- GPS write throttle uses `trip:last_saved:<tripId>` with 60-second expiration (`shuttle-tracking-backend/src/services/tracking.service.ts:4-25`).

Realtime:

- Socket.IO is the single realtime channel.
- Backend emits all location updates globally with `io.emit("location-update", result)`.

Evidence:

- Socket handler uses `io.emit` after processing `send-location` (`shuttle-tracking-backend/src/server.ts:72-75`).

Devices:

- Implemented device path is vehicle verification, trip start/end, and Socket.IO location submission.
- Mobile app, LoRaWAN, TTN, and ESP32 are not present as separate modules.

Evidence:

- Vehicle login only verifies vehicle ID and returns vehicle data (`shuttle-tracking-backend/src/controllers/auth.controller.ts:68-88`).
- Trip API exposes only start and end (`shuttle-tracking-backend/src/routes/trips.route.ts:6-8`).
- Knowledge base states mobile, LoRaWAN, and ESP32 source modules are not implemented (`docs/project-knowledge-base.md:218-222`).

External services:

- Runtime external services include PostgreSQL/PostGIS, Redis, map tiles, CARTO tiles, OSRM fallback, and Flaticon icons.
- Production hosting targets and TTN integration are not evidenced in repo.

Evidence:

- Knowledge base lists external runtime services and missing TTN/production provider evidence (`docs/project-knowledge-base.md:345-411`).

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

Trip and GPSTrack entities already exist. Product features like trip history, reports, and playback can be added without replacing the data store.

Evidence:

- Trip model includes vehicle, route, start/end, status, and indexes (`shuttle-tracking-backend/prisma/schema.prisma:105-123`).
- GPSTrack links to trip and vehicle with recorded time (`shuttle-tracking-backend/prisma/schema.prisma:129-145`).
- Product audit recommends trip history because trips and GPS tracks are already stored (`docs/audits/product-audit.md:240-266`).

## 4 Architecture Risks

### Critical: No tracking-source/device abstraction

Problem

The architecture models `Vehicle` but not `Device`, `TrackingSource`, or `VehicleDeviceAssignment`. All current GPS ingestion assumes a payload with `tripId`, `vehicleId`, `lat`, `lng`, speed, bearing, accuracy, and station.

Current Impact

The current simulator/mobile-like flow can send live locations, but the backend cannot distinguish phone GPS, LoRaWAN, TTN, ESP32, or future devices for the same vehicle.

Future Risk

Multiple tracking sources for one vehicle will create ambiguity: which source is authoritative, which one is stale, which one should be shown, and how failover should work.

Recommendation

Add a small device/source model before implementing LoRaWAN/ESP32:

- TrackingSource or Device: source ID, type, vehicle assignment, status, last seen, priority.
- LocationObservation: raw observation from one source.
- CurrentVehicleLocation: selected canonical position per vehicle.

Reason

The knowledge base says future mobile, LoRaWAN, and ESP32 integrations are expected but not implemented (`docs/project-knowledge-base.md:218-222`). Current schema has Vehicle and GPSTrack but no device/source entity (`shuttle-tracking-backend/prisma/schema.prisma:46-61`, `shuttle-tracking-backend/prisma/schema.prisma:129-145`).

Difficulty

Medium.

Priority

Critical.

Research Topic

Device registry and source priority for GPS systems.

Expected Benefit

The system can support phone, LoRaWAN, and ESP32 simultaneously without rewriting public/admin realtime flows.

Mentor Mode

What is it? A tracking-source abstraction separates the physical/technical GPS sender from the vehicle being tracked.

Why does it exist? One vehicle can be reported by multiple devices, and each source may have different latency, accuracy, and reliability.

Does this project need it? Yes, because future requirements explicitly mention LoRaWAN, TTN, and ESP32, while current code only has one Socket.IO payload path.

Should it be implemented now? Yes, before real multi-device work begins.

What happens if postponed? Every new device integration will likely add special-case code and make failover harder.

Estimated learning difficulty: Medium.

Learning priority: Critical.

### High: Location ingestion and canonical location are conflated

Problem

`handleLocationData` both normalizes incoming location data, throttles DB writes, writes GPS history, and returns the broadcast payload. The server then immediately broadcasts that payload globally.

Current Impact

It works for a simple live map. The last received payload becomes the truth shown to clients.

Future Risk

The architecture cannot safely support source comparison, quality checks, stale detection, route validation, or failover because there is no separate canonical selection step.

Recommendation

Separate the tracking pipeline into stages:

1. Ingest raw observation.
2. Validate/normalize observation.
3. Persist raw or sampled track.
4. Select canonical current vehicle state.
5. Broadcast public/admin event.

Reason

The current service writes and returns a broadcast shape in one function (`shuttle-tracking-backend/src/services/tracking.service.ts:6-46`). The server broadcasts that result immediately (`shuttle-tracking-backend/src/server.ts:72-75`).

Difficulty

Medium.

Priority

High.

Research Topic

Location ingestion pipeline and current-state read model.

Expected Benefit

Clean support for stale/offline dashboard status, trip history, source priority, and source comparison.

Mentor Mode

What is it? A pipeline splits one complex operation into clear stages with one responsibility each.

Why does it exist? Realtime systems need to treat "received a signal" differently from "this is the location users should trust."

Does this project need it? Yes for multi-source tracking and offline/stale alerts.

Should it be implemented now? Phase 1, before adding more tracking clients.

What happens if postponed? Public and admin screens may display whichever source reported last, even if that source is low-quality or stale.

Estimated learning difficulty: Medium.

Learning priority: High.

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

Product audit identifies missing alerts, feedback, reports, device health, and admin user/role management (`docs/audits/product-audit.md:405-430`). Current schema includes only User, Route, Vehicle, Stop, RouteStop, Trip, GPSTrack, and Feedback (`shuttle-tracking-backend/prisma/schema.prisma:16-160`).

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
- Missing distinction between vehicle and tracking source/device.
- Vehicle status currently doubles as operational state and live tracking status.

Trip:

- Strong MVP foundation: vehicle, route, start/end time, status.
- Missing active trip constraints, driver/source association, and derived current state.

Route:

- Good MVP entity with ID, name, color, status, vehicles, route stops, and trips.
- Missing route geometry as backend-owned data. Geometry currently lives as frontend static JSON/localStorage/OSRM fallback.

Stop:

- Good MVP entity with names, image, status, and PostGIS location.
- Works with RouteStop for ordered routes.

GPS Track:

- Good history foundation.
- Needs source/device ID, raw accuracy, raw received timestamp, selected/canonical flag, and possibly ingestion source metadata for future comparison.

Feedback:

- Exists as data model only.
- Needs product workflow before deep architecture work. Status/assignment may be needed if feedback becomes an admin inbox.

User:

- Suitable for one admin role MVP.
- Future admin roles are not modeled.

Missing Concepts:

- TrackingSource/Device.
- VehicleDeviceAssignment.
- CurrentVehicleLocation.
- LocationObservation/raw source event.
- DeviceHealth or SourceHealth.
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

- Client/device emits `send-location`.
- Backend service validates minimal fields, writes sampled GPS track, returns normalized payload.
- Server broadcasts `location-update`.

Assessment: clear MVP flow. Needs source-aware ingestion, canonical current location, route-scoped rooms, and stale/offline handling.

Trip flow:

- Device starts trip through REST.
- Backend creates trip and sets vehicle active.
- Device sends GPS.
- Device ends trip through REST.
- Backend completes trip, sets vehicle inactive, clears throttle key.

Assessment: enough for simulator. Needs active-trip read path, driver workflow support, source association, and history/replay APIs.

GPS flow:

- Writes are throttled to 60 seconds per trip.
- All realtime updates are still broadcast.

Assessment: write throttling protects DB volume for MVP. For analytics/replay, fixed 60-second sampling may be too coarse; decide retention and sampling policy before production.

Feedback flow:

- Feedback model exists.
- No API/UI flow found.

Assessment: data-only placeholder.

Future IoT flow:

- No TTN/LoRaWAN/ESP32 adapter exists.
- Architecture should not wire TTN directly into the same raw Socket.IO event without a source adapter boundary.

Assessment: not ready yet, but can be made ready with a small source adapter architecture.

## 7 Module Review

Authentication:

- Admin auth and vehicle verification are grouped under auth.
- Vehicle verification is not a full device identity/session model.

Tracking:

- Tracking service exists, which is good.
- It should evolve into an ingestion/current-state service rather than only a write throttle and broadcast normalizer.

Trip:

- Trip lifecycle currently lives in controller.
- Should move to a trip/operations service.

Vehicle:

- Vehicle controller handles CRUD and public cache invalidation.
- Vehicle assignment to route exists.
- Device association does not exist.

Admin:

- Admin API areas are separated by entity.
- Future operations dashboard needs cross-entity read models, not only entity CRUD.

Feedback:

- Schema exists.
- Module does not exist.

Public:

- Public API is read-focused and cached.
- Should eventually expose active vehicle/current state from backend-owned read models.

## 8 Device Architecture Review

Phone:

- Current flow resembles a phone/mobile client: vehicle login, trip start, Socket.IO location, trip end.
- Missing full driver session and device identity.

LoRaWAN:

- Not implemented.
- TTN adapter, payload decoder, source identity, and latency/accuracy rules are missing.

ESP32:

- Not implemented.
- Needs HTTP/MQTT/Socket adapter decision later, but the core backend should first accept normalized source observations.

Multiple devices:

- Not supported architecturally yet because GPSTrack ties only to vehicle/trip, not source/device.

Failover:

- Not supported. The system shows whatever update is broadcast.

Device Registration:

- Not supported. Vehicle login verifies vehicle ID only.

Tracking Source:

- Missing and should be the first device architecture improvement.

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
- Not possible cleanly if every new device/source is wired directly into current `send-location` handling.

## 10 Maintainability Review

Coupling:

- Frontend map component is coupled to route geometry, ETA, snapping, event handling, and UI state.
- Backend controller logic is coupled to domain state transitions.

Modularity:

- Basic module structure exists: routes, controllers, services, config, middleware.
- Service layer is thin and unevenly applied.

Extensibility:

- Entity CRUD is extensible.
- Multi-source tracking is not extensible yet.

Technical Debt:

- Acceptable MVP debt: frontend-heavy live map logic, global realtime broadcasts, one source event.
- Production-risk debt: no device/source model, no current vehicle state, no stale/offline concept.

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

- Not ready until tracking source/device is modeled.
- Readiness: Low.

Production:

- MVP architecture is promising, but production needs device/source model, stale/offline state, route-stop cache correctness, operational read models, and clearer deployment ownership.
- Readiness: Medium-Low.

## 12 Architecture Score

Architecture: 7/10

Reason: Good MVP stack and clear high-level client/server/realtime/database structure. Missing source-aware tracking and domain service boundaries.

Scalability: 6/10

Reason: Redis adapter and write throttling help. Global broadcasts, frontend-heavy computation, and no current-state model limit growth.

Maintainability: 6/10

Reason: Repository has recognizable module organization, but business rules are split across controllers, services, and frontend.

Extensibility: 5/10

Reason: CRUD modules are extensible. Device/source expansion is not yet architecturally prepared.

Realtime: 6/10

Reason: Socket.IO flow is simple and works for MVP. Needs rooms, canonical current state, and source/failover logic.

Device Support: 3/10

Reason: Vehicle/mobile-like sender path exists, but no device registration, source priority, health, failover, LoRaWAN, TTN, or ESP32 adapter.

Overall: 6/10

Reason: Strong enough for MVP and near-term learning, not yet ready for production multi-source operations.

## 13 Refactoring Roadmap

### Phase 1

- Add tracking-source/device domain concept.
- Create tracking ingestion/current-state service.
- Move trip lifecycle rules from controller into a trip/operations service.
- Add stale/offline current vehicle state.
- Fix route-stop cache invalidation when route-stop APIs mutate data.
- Add route-stop management support using existing ordered relationship.

### Phase 2

- Add active trip and trip history read models.
- Add route-scoped Socket.IO rooms.
- Add device health fields and admin visibility.
- Add source priority/failover rules.
- Add feedback module if feedback remains in product scope.

### Phase 3

- Add trip replay architecture and retention policy.
- Add reporting/analytics aggregation.
- Add announcements/incidents/alerts model if operations require it.
- Add admin role/audit model if multiple staff roles are introduced.

## 14 Learning Topics

Tracking Source Modeling

What: Separating vehicle identity from GPS sender identity.

Why: Required for mobile, LoRaWAN, and ESP32 support.

When: Phase 1.

Difficulty: Medium.

Priority: Critical.

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

