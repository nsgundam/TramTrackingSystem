# Backend Audit: Tram Tracking System

## 1. Executive Summary

Backend ปัจจุบันเป็น MVP ที่ใช้งาน flow หลักได้: admin login, public data API, admin CRUD, vehicle login, start trip, WebSocket GPS update, และ end trip. โครงสร้างหลักใช้ Express, Socket.IO, Prisma/PostGIS และ Redis ซึ่งสอดคล้องกับ architecture audit ว่าเหมาะกับ MVP และ phase ถัดไปขนาดเล็ก (`docs/audits/architecture-audit.md:5-17`).

Assessment: **partially ready for MVP, not production-ready yet**.

จุดแข็งคือ route/API แยกเป็นหมวดชัดเจน, admin routes ถูก protect ด้วย JWT, public API มี Redis cache, GPS track เก็บลง PostGIS, และ Socket.IO Redis adapter ถูกเตรียมไว้สำหรับหลาย process (`shuttle-tracking-backend/src/server.ts:50-62`, `shuttle-tracking-backend/src/server.ts:84-96`, `shuttle-tracking-backend/prisma/schema.prisma:129-145`).

ความเสี่ยงหลักก่อนใช้งานจริงคือ trip/device flow ยังเปิดเกินไป, ไม่มี device/source identity สำหรับ Mobile/LoRaWAN/ESP32, validation ยังบาง, Socket.IO ไม่มี auth/ack/error event, start/end trip ยังไม่กัน duplicate/idempotency, route-stop mutation ไม่ invalidate public cache, และ GPS history ถูก throttle เหลือ 1 record ต่อ trip ต่อ 60 วินาที แม้ simulator ส่งทุก 1 วินาที (`shuttle-tracking-backend/src/services/tracking.service.ts:4-25`, `shuttle-tracking-web/simulate.js:105-130`).

## 2. Current Backend Overview

Backend entrypoint คือ `server.ts` สร้าง Express app, HTTP server, Socket.IO server, CORS, JSON body parser, route mounts, Redis connection, และ Socket.IO Redis adapter (`shuttle-tracking-backend/src/server.ts:22-48`, `shuttle-tracking-backend/src/server.ts:64-96`).

REST route groups:

- Auth: `/api/auth/login`, `/api/auth/vehicle-login`, `/api/auth/me` (`shuttle-tracking-backend/src/routes/auth.route.ts:8-13`).
- Public: active routes, active vehicles, route stops, stops (`shuttle-tracking-backend/src/routes/public.route.ts:6-16`).
- Protected admin: vehicles, routes, stops, route-stops mounted with `authenticateToken` (`shuttle-tracking-backend/src/server.ts:53-57`).
- Trips: `/api/trips/start` and `/api/trips/:id/end` mounted without auth middleware (`shuttle-tracking-backend/src/server.ts:62`, `shuttle-tracking-backend/src/routes/trips.route.ts:6-8`).

Database entities are User, Route, Vehicle, Stop, RouteStop, Trip, GPSTrack, and Feedback. Stop and GPSTrack use PostGIS geography fields (`shuttle-tracking-backend/prisma/schema.prisma:16-160`).

Redis responsibilities:

- Public API cache with 300 second TTL (`shuttle-tracking-backend/src/controllers/public.controller.ts:5-24`).
- Public cache invalidation after route, stop, vehicle admin mutations (`shuttle-tracking-backend/src/services/cache.service.ts:8-27`).
- GPS DB write throttle using `trip:last_saved:<tripId>` and 60 second expiration (`shuttle-tracking-backend/src/services/tracking.service.ts:4-25`).
- Socket.IO Redis adapter for cross-process broadcast (`shuttle-tracking-backend/src/server.ts:89-96`).

Realtime flow:

- Client emits `send-location`.
- Server calls `handleLocationData(rawData)`.
- Server emits `location-update` globally to all Socket.IO clients (`shuttle-tracking-backend/src/server.ts:68-75`).

## 3. Backend Strengths

1. **MVP stack is appropriate and simple.** Express REST + Socket.IO + PostgreSQL/PostGIS + Redis is coherent for a small real-time tracking system (`docs/audits/architecture-audit.md:5-17`).

2. **Admin CRUD is grouped and protected.** Vehicles, routes, stops, and route-stops are mounted behind `authenticateToken` (`shuttle-tracking-backend/src/server.ts:53-57`).

3. **PostGIS foundation exists.** Stops and GPS tracks use geography fields, and public/admin stop APIs convert locations to lat/lng with PostGIS functions (`shuttle-tracking-backend/prisma/schema.prisma:67-80`, `shuttle-tracking-backend/prisma/schema.prisma:129-145`, `shuttle-tracking-backend/src/controllers/public.controller.ts:66-77`).

4. **Trip and GPS history tables already exist.** This supports future trip history/playback APIs without replacing the storage model (`shuttle-tracking-backend/prisma/schema.prisma:105-145`).

5. **Redis is already used for the right MVP concerns.** The project uses Redis for public cache, Socket.IO adapter, and GPS write throttle (`shuttle-tracking-backend/src/server.ts:84-96`, `shuttle-tracking-backend/src/controllers/public.controller.ts:11-24`, `shuttle-tracking-backend/src/services/tracking.service.ts:19-25`).

## 4. Critical Issues

### Critical Issue 1: Trip and GPS sender identity is too weak

Vehicle login only checks that a vehicle ID exists and returns vehicle data; it does not issue a token or session (`shuttle-tracking-backend/src/controllers/auth.controller.ts:68-88`). Trip routes are mounted without auth middleware (`shuttle-tracking-backend/src/server.ts:62`). Socket.IO accepts raw `send-location` without sender authentication (`shuttle-tracking-backend/src/server.ts:72-75`).

Impact: any client that can reach the backend can try to start/end trips or emit location for a known `vehicleId`. This is not ready for real devices.

### Critical Issue 2: No device/source abstraction

The schema has Vehicle and GPSTrack, but no Device, TrackingSource, source type, source health, priority, or assignment model (`shuttle-tracking-backend/prisma/schema.prisma:46-61`, `shuttle-tracking-backend/prisma/schema.prisma:129-145`). Architecture audit also identifies this as the main architecture risk (`docs/audits/architecture-audit.md:7-17`).

Impact: backend cannot distinguish Mobile, LoRaWAN, ESP32, simulator, or multiple devices reporting for one vehicle.

### Critical Issue 3: Trip lifecycle is not idempotent

`startTrip` creates a new in-progress trip every time a valid vehicle calls it, then sets vehicle status active (`shuttle-tracking-backend/src/controllers/trips.controller.ts:27-39`). It does not check for an existing in-progress trip. `endTrip` updates by trip ID directly to completed and inactive without checking current status or ownership (`shuttle-tracking-backend/src/controllers/trips.controller.ts:52-72`).

Impact: duplicate start requests can create multiple active trips for one vehicle. Duplicate or wrong end requests can produce confusing operational state.

## 5. API Review

API structure is clear enough for MVP. Public routes are separated from admin routes, and protected admin route mounting is centralized (`shuttle-tracking-backend/src/server.ts:50-62`).

Validation is inconsistent. Examples:

- `login` does not explicitly validate missing username/password before querying and comparing (`shuttle-tracking-backend/src/controllers/auth.controller.ts:6-23`).
- `createVehicle`, `createRoute`, and many updates pass request body fields directly into Prisma with little validation (`shuttle-tracking-backend/src/controllers/vehicles.controller.ts:40-57`, `shuttle-tracking-backend/src/controllers/route.controller.ts:36-54`, `shuttle-tracking-backend/src/controllers/vehicles.controller.ts:60-74`).
- `createStop` checks required fields, but `!lat || !lng` rejects valid numeric `0` and does not validate ranges (`shuttle-tracking-backend/src/controllers/stops.controller.ts:53-64`).
- `handleLocationData` only checks presence of tripId, vehicleId, lat, and lng; it does not validate UUID, coordinate range, speed range, bearing range, or whether trip/vehicle match (`shuttle-tracking-backend/src/services/tracking.service.ts:6-10`).

Status codes are partially correct: 400 for missing trip vehicleId, 404 for missing vehicle, 201 for successful trip start (`shuttle-tracking-backend/src/controllers/trips.controller.ts:9-44`). However, many Prisma errors such as duplicate IDs, missing records on update/delete, and FK violations become 500 responses (`shuttle-tracking-backend/src/controllers/vehicles.controller.ts:54-57`, `shuttle-tracking-backend/src/controllers/route.controller.ts:68-86`, `shuttle-tracking-backend/src/controllers/stops.controller.ts:118-136`).

Response shapes are inconsistent: auth vehicle login returns `{ success, message, vehicle }`, admin login returns `{ token, user }`, trip errors return `{ error }`, and CRUD mostly returns raw records (`shuttle-tracking-backend/src/controllers/auth.controller.ts:35-40`, `shuttle-tracking-backend/src/controllers/auth.controller.ts:84-92`, `shuttle-tracking-backend/src/controllers/trips.controller.ts:41-48`).

Not Found: OpenAPI/Swagger or dedicated API contract documentation was not found; the knowledge base also records this limitation (`docs/project-knowledge-base.md:411-424`).

## 6. Trip Lifecycle Review

Vehicle login:

- Implemented as `POST /api/auth/vehicle-login`.
- Verifies only that `vehicleId` exists (`shuttle-tracking-backend/src/controllers/auth.controller.ts:68-88`).
- No token/session is issued.

Start trip:

- Implemented as `POST /api/trips/start`.
- Requires `vehicleId`.
- Checks vehicle exists and has assigned route.
- Creates Trip with status `in_progress`.
- Updates Vehicle status to `active` (`shuttle-tracking-backend/src/controllers/trips.controller.ts:5-44`).

Send location:

- Implemented through Socket.IO `send-location`.
- Calls `handleLocationData`.
- Writes GPS track only if Redis throttle key does not already exist.
- Broadcasts `location-update` (`shuttle-tracking-backend/src/server.ts:72-75`, `shuttle-tracking-backend/src/services/tracking.service.ts:19-46`).

End trip:

- Implemented as `PUT /api/trips/:id/end`.
- Updates trip to `completed`.
- Updates vehicle to `inactive`.
- Deletes Redis throttle key (`shuttle-tracking-backend/src/controllers/trips.controller.ts:52-80`).

Gaps:

- No active-trip lookup API.
- No trip status API.
- No trip history API.
- No guard against duplicate start/end.
- No transaction around trip create + vehicle update or trip end + vehicle update.
- No validation that a location's `vehicleId` belongs to the supplied `tripId`.

## 7. WebSocket and GPS Review

The WebSocket path is minimal and easy to understand. It can handle simple realtime display for 10 vehicles if the Node process and DB/Redis are healthy, because broadcast is simple and Redis adapter exists for future multi-process operation (`shuttle-tracking-backend/src/server.ts:68-96`).

Important behavior:

- `send-location` has no acknowledgement callback, no error event, and no client-visible rejection path (`shuttle-tracking-backend/src/server.ts:72-75`).
- `handleLocationData` catches errors and returns original data, so invalid or failed writes can still be broadcast (`shuttle-tracking-backend/src/services/tracking.service.ts:48-50`).
- GPS save uses `parseFloat(lng)` and `parseFloat(lat)` but does not reject `NaN`, out-of-range values, or swapped coordinates (`shuttle-tracking-backend/src/services/tracking.service.ts:28-39`).
- Moving station is normalized to `En Route` when speed is at least 2 (`shuttle-tracking-backend/src/services/tracking.service.ts:12-15`).

GPS every 1-3 seconds:

- Simulator emits `send-location` once per second while moving (`shuttle-tracking-web/simulate.js:105-130`).
- Backend can broadcast every event because it calls `io.emit` for every `send-location` (`shuttle-tracking-backend/src/server.ts:72-75`).
- Backend persists only once every 60 seconds per trip because `THROTTLE_SECONDS = 60` (`shuttle-tracking-backend/src/services/tracking.service.ts:4-25`).

Conclusion: realtime display may satisfy 1-3 second updates, but GPS history/playback will not preserve that detail with the current throttle.

## 8. Redis Review

Redis is used in three places:

- Main client with `REDIS_URL` defaulting to local Redis (`shuttle-tracking-backend/src/config/redis.ts:1-5`).
- Socket.IO adapter clients duplicated at server start (`shuttle-tracking-backend/src/server.ts:89-96`).
- Public cache and GPS throttle (`shuttle-tracking-backend/src/controllers/public.controller.ts:11-24`, `shuttle-tracking-backend/src/services/tracking.service.ts:19-25`).

Good:

- Cache TTL is explicit at 300 seconds.
- Cache invalidation is best-effort, so admin mutation is not blocked by cache errors (`shuttle-tracking-backend/src/services/cache.service.ts:23-27`).
- GPS write throttle uses Redis `SET NX EX`, which works across multiple Node processes (`shuttle-tracking-backend/src/services/tracking.service.ts:19-25`).

Risks:

- `invalidatePublicCache` uses `KEYS public:route_stops:*`, which can block Redis when key count grows (`shuttle-tracking-backend/src/services/cache.service.ts:17-20`). Acceptable for MVP, but should be changed before production.
- Route-stop create/delete does not call `invalidatePublicCache`, although public route stops are cached per route (`shuttle-tracking-backend/src/controllers/routeStops.controller.ts:43-70`, `shuttle-tracking-backend/src/controllers/public.controller.ts:90-122`).
- Redis startup failure stops the whole server (`shuttle-tracking-backend/src/server.ts:84-103`). That is acceptable if Redis is required for realtime scaling/throttle, but production should make this policy explicit.

## 9. Multiple Device Support Review

Current support: **partial only**.

Implemented:

- Vehicle ID verification.
- Trip start/end.
- Socket.IO location submission.
- Simulator for one vehicle (`docs/project-knowledge-base.md:218-222`, `shuttle-tracking-web/simulate.js:3-6`).

Not Implemented:

- Device registration.
- Device secret/token provisioning.
- Device health.
- Device type/source type.
- LoRaWAN/TTN endpoint or payload decoder.
- ESP32 HTTP/MQTT ingestion endpoint.
- Source priority/failover.
- Canonical current vehicle location.

The architecture audit states that Mobile, LoRaWAN/TTN, and ESP32 are not present as separate modules and that the system currently treats vehicle and tracking source as the same concept (`docs/audits/architecture-audit.md:7-17`, `docs/audits/architecture-audit.md:75-84`).

## 10. Reliability Review

Duplicate GPS:

- Redis throttle reduces DB writes per trip to once per 60 seconds, but all events are still broadcast (`shuttle-tracking-backend/src/services/tracking.service.ts:19-46`).
- No event ID or timestamp-based dedupe exists.

Late GPS:

- Backend stamps `recordedAt = new Date()` on server receive, not device-reported time (`shuttle-tracking-backend/src/services/tracking.service.ts:17`).
- There is no check for stale or out-of-order device timestamps.

Unexpected disconnect:

- Server only logs disconnect (`shuttle-tracking-backend/src/server.ts:77-79`).
- No trip/device status update, stale marker, or heartbeat timeout exists.

Server restart:

- Trips and GPS tracks persist in DB.
- No current location table/read model exists; live state depends on new incoming events.

Database/Redis errors:

- REST controllers generally catch and return 500.
- `handleLocationData` catches errors and returns raw data, causing possible broadcast of unsaved/unvalidated location (`shuttle-tracking-backend/src/services/tracking.service.ts:48-50`).

10 vehicle target:

- For realtime display, 10 vehicles sending every 1-3 seconds is modest for Socket.IO if deployment resources are reasonable.
- For DB persistence, current throttle greatly reduces writes, so DB pressure is low.
- For correctness, missing sender auth, trip ownership checks, stale detection, and device source separation are the bigger risks than raw capacity.

## 11. Missing Backend Capabilities

- Trip History API: Not Implemented. Trip and GPSTrack models exist, but no trip history route/controller was found (`shuttle-tracking-backend/prisma/schema.prisma:105-145`, `shuttle-tracking-backend/src/routes/trips.route.ts:6-8`).
- GPS Playback API: Not Implemented. GPSTrack exists, but no playback endpoint was found.
- Feedback API: Not Implemented. Feedback model exists, but no route/controller usage was found (`shuttle-tracking-backend/prisma/schema.prisma:151-160`, `docs/project-knowledge-base.md:407-410`).
- Device Registration: Not Implemented.
- Device Health: Not Implemented.
- Alerts: Not Implemented.
- Reports: Not Implemented.
- Admin Roles: Not Implemented. User model has username/password only (`shuttle-tracking-backend/prisma/schema.prisma:16-23`).
- API contract docs: Not Found (`docs/project-knowledge-base.md:411-424`).
- Automated backend tests: Not Implemented; `npm test` is a placeholder that exits with error (`shuttle-tracking-backend/package.json:6-8`).

## 12. Recommended Improvements

### Recommendation 1: Add device/session authentication for trip and GPS sender flow

Problem: Vehicle login only verifies `vehicleId`, trip routes are public, and Socket.IO accepts raw locations.

Impact: Real devices cannot be trusted. Anyone with a vehicle ID can spoof trip and GPS state if they can reach the backend.

Recommendation: Make vehicle/device login issue a short-lived token. Require it for `POST /api/trips/start`, `PUT /api/trips/:id/end`, and Socket.IO connection or `send-location`. At MVP level, one shared device secret per vehicle is enough before building full provisioning.

Why: Admin JWT already exists, so the team can reuse the same learning pattern for device-side auth with a narrower payload.

Priority: Critical

Difficulty: Medium

Learning Topic: JWT for devices, Socket.IO auth middleware

Related Files: `shuttle-tracking-backend/src/controllers/auth.controller.ts`, `shuttle-tracking-backend/src/routes/trips.route.ts`, `shuttle-tracking-backend/src/server.ts`

### Recommendation 2: Make trip lifecycle idempotent and transactional

Problem: Repeated start creates multiple trips; repeated/wrong end can update state blindly.

Impact: Vehicle status and trip history can become incorrect under retries, double-clicks, mobile reconnects, or duplicate device requests.

Recommendation: Before creating a trip, check if the vehicle already has an `in_progress` trip and return it or reject with 409. End only trips currently `in_progress`. Wrap trip + vehicle updates in a Prisma transaction.

Why: Idempotency makes retry safe. A transaction keeps trip and vehicle status consistent.

Priority: Critical

Difficulty: Medium

Learning Topic: Idempotency, database transactions, conflict status code 409

Related Files: `shuttle-tracking-backend/src/controllers/trips.controller.ts`, `shuttle-tracking-backend/prisma/schema.prisma`

### Recommendation 3: Add request validation DTOs for REST and GPS payloads

Problem: Controllers accept raw `req.body`, and GPS payload validation only checks a few required fields.

Impact: Invalid coordinates, bad statuses, duplicate IDs, wrong types, and unexpected fields become 500s or bad data.

Recommendation: Add a small validation layer using a schema library such as Zod or a simple local validator. Start with `createVehicle`, `createRoute`, `createStop`, `startTrip`, `endTrip`, and `send-location`.

Why: Validation gives better 400 responses and prevents bad data from entering Prisma/PostGIS.

Priority: High

Difficulty: Easy to Medium

Learning Topic: Request validation, DTOs, data contracts

Related Files: `shuttle-tracking-backend/src/controllers/*.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`

### Recommendation 4: Introduce minimal TrackingSource/Device model before LoRaWAN or ESP32

Problem: Vehicle and GPS source are currently the same concept.

Impact: The backend cannot support phone GPS, LoRaWAN, and ESP32 at the same time for one vehicle.

Recommendation: Add `Device` or `TrackingSource` with `id`, `vehicleId`, `type`, `status`, `lastSeenAt`, `priority`, and optional `secretHash`. Add `sourceId` to GPS records or a separate raw observation table.

Why: This is the simplest foundation for source health, failover, and multi-device support.

Priority: High

Difficulty: Medium

Learning Topic: Device registry, source priority, canonical state

Related Files: `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/services/tracking.service.ts`

### Recommendation 5: Fix route-stop cache invalidation

Problem: Public route stops are cached, but admin route-stop create/delete does not invalidate public cache.

Impact: Public users can see stale stop order or route membership for up to 5 minutes or longer if invalidation is expected to be immediate.

Recommendation: Call `invalidatePublicCache()` after route-stop create/delete. Later, replace Redis `KEYS` with `SCAN` or targeted route cache deletion.

Why: Route-stop changes directly affect public map data.

Priority: High

Difficulty: Easy

Learning Topic: Cache invalidation, Redis key scanning

Related Files: `shuttle-tracking-backend/src/controllers/routeStops.controller.ts`, `shuttle-tracking-backend/src/services/cache.service.ts`, `shuttle-tracking-backend/src/controllers/public.controller.ts`

### Recommendation 6: Separate realtime broadcast from persistence result

Problem: If GPS persistence fails, `handleLocationData` returns raw data and the server still broadcasts it.

Impact: Clients may trust bad or unsaved data, and sender receives no clear error.

Recommendation: Return a typed result such as `{ ok, location, error }`. Broadcast only validated location data. Emit `location-error` or ack callback to the sender when rejected.

Why: Realtime systems should distinguish "received" from "accepted".

Priority: High

Difficulty: Medium

Learning Topic: Socket.IO acknowledgements, error handling, ingestion pipeline

Related Files: `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`

### Recommendation 7: Add trip history and GPS playback read APIs

Problem: Trip and GPS data are stored, but no backend endpoints expose history/playback.

Impact: Admins cannot investigate completed service, debug device behavior, or build reports.

Recommendation: Add protected admin endpoints: `GET /api/admin/trips`, `GET /api/admin/trips/:id`, and `GET /api/admin/trips/:id/gps-tracks`.

Why: Product audit marks trip history as a critical gap, and the schema already supports it (`docs/audits/product-audit.md:147-153`).

Priority: Medium

Difficulty: Medium

Learning Topic: Pagination, filtering, read models

Related Files: `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/routes`, `shuttle-tracking-backend/src/controllers`

### Recommendation 8: Add basic automated backend tests

Problem: `npm test` is only a placeholder and exits with error.

Impact: Students must manually verify every change, and regressions in trip or GPS behavior are easy to miss.

Recommendation: Add a small test suite for validation, trip start/end rules, cache invalidation, and tracking service behavior. Start with unit tests before full integration tests.

Why: A few focused tests will protect the riskiest backend flows without making the project too complex.

Priority: Medium

Difficulty: Medium

Learning Topic: Unit tests, integration tests, test database

Related Files: `shuttle-tracking-backend/package.json`, `shuttle-tracking-backend/src/controllers/trips.controller.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`

## 13. Backend Learning Topics

### Request Validation and DTO

What it is: A DTO is a defined request/response shape. Validation checks incoming data before business logic.

What problem it solves: Prevents invalid coordinates, missing fields, wrong types, and unexpected values from reaching the database.

Needed now: Yes. Start small with trip and GPS payloads.

Simpler approach: Write local helper functions first; add Zod later if the team is comfortable.

Learning order: required fields -> type checks -> enum/status checks -> coordinate ranges -> reusable schemas.

### Idempotency

What it is: A request can be repeated and still produce one correct result.

What problem it solves: Mobile reconnects, double taps, and network retries.

Needed now: Yes for start/end trip.

Simpler approach: Check for existing in-progress trip before creating a new one.

Learning order: duplicate request examples -> 409 conflict -> returning existing active resource -> idempotency keys.

### Service Layer

What it is: A place for domain rules outside controllers.

What problem it solves: Keeps trip lifecycle, validation, and state updates consistent across REST, Socket.IO, and future device adapters.

Needed now: Partially. Tracking has a service, but trip lifecycle is still in controller.

Simpler approach: Extract `trip.service.ts` only for start/end rules first.

Learning order: controller vs service responsibility -> transactions -> reusable domain functions.

### Retry and Timeout

What it is: Retry repeats a failed operation; timeout stops waiting forever.

What problem it solves: Mobile/device network instability and external service delays.

Needed now: Basic client retries need backend idempotency first.

Simpler approach: Start by making start/end safe to repeat.

Learning order: timeout -> retry -> exponential backoff -> idempotency.

### Device Registry

What it is: A database record for each GPS sender, separate from vehicle.

What problem it solves: Supports Mobile, LoRaWAN, ESP32, health status, and source priority.

Needed now: Yes before real LoRaWAN/ESP32 integration.

Simpler approach: One `devices` table with type, vehicleId, status, lastSeenAt, and priority.

Learning order: vehicle vs device -> assignment -> token/secret -> health -> source priority.

## 14. Audit Limitations

- This audit is based on repository code and docs only. No running database, Redis instance, or live device was tested.
- No load test was performed, because the backend agent scope excludes real load testing.
- Database index deep review is out of scope, but obvious schema evidence was read.
- Mobile app, LoRaWAN/TTN, and ESP32 implementation could not be audited because the repository documents that those modules are not present (`docs/project-knowledge-base.md:407-422`).
- Production deployment readiness is limited to Docker Compose and env examples; external production provider configs were not found (`docs/project-knowledge-base.md:411-418`).
- Architecture audit exists and was used as input; therefore this backend audit is not missing architecture context (`docs/audits/architecture-audit.md:1-17`).

## 15. Handoff

For Database Audit Agent:

- Review whether `Trip` needs a unique constraint or partial unique index for one active trip per vehicle.
- Review whether GPSTrack should store `sourceId`, device timestamp, raw accuracy, and canonical/current location fields.
- Review GPS retention and playback sampling strategy because backend currently saves only once per 60 seconds.

For Infrastructure & Device Audit Agent:

- Define device identity/provisioning for Mobile, LoRaWAN/TTN, and ESP32.
- Decide whether Socket.IO, HTTP, MQTT, or TTN webhook should be the ingestion path per device type.
- Define heartbeat/last-seen behavior and offline thresholds.

For Security & DevOps Audit Agent:

- Review public trip routes and Socket.IO authentication.
- Review JWT secret handling, token expiry policy, CORS policy, rate limiting, and production env separation.
- Add basic automated tests and CI once backend validation/idempotency is implemented.

For Master Roadmap Agent:

- Phase 1 should prioritize sender auth, idempotent trip lifecycle, validation, route-stop cache invalidation, and trip history read APIs.
- Phase 2 should add device registry, device health, stale/offline alerts, feedback API, and GPS playback.
- Phase 3 should add reports, admin roles, audit logs, and production observability.
