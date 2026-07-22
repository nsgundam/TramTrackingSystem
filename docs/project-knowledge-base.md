# Tram Tracking System Project Knowledge Base

Evidence status: **Needs Refresh**. This legacy discovery snapshot predates the completed T5
lifecycle boundary and does not yet contain the evidence-baseline metadata required by the current
audit contract. Use `docs/audits/README.md` as the coordination authority.

Discovery refresh: 2026-07-18

This document describes the current repository state from source code, configuration, schema,
migrations, seed data, and repository documentation. It is a discovery artifact, not an audit or
recommendation report.

## Executive Summary

Tram Tracking System is an MVP full-stack university shuttle/tram tracking application. It provides
a public live map for shuttle users and an authenticated administration area for operational data.
The repository also contains a multi-source location ingestion pipeline for mobile, ESP32,
LoRaWAN/TTN, and simulator sources.

The current implementation contains:

- Next.js public tracking and admin frontend.
- Express and Socket.IO backend.
- PostgreSQL with PostGIS for durable relational and spatial data.
- Redis for public cache, source latest-location snapshots, source selection analytics, GPS history
  write throttling, and the Socket.IO Redis adapter.
- REST ingestion for authenticated mobile/ESP32-style senders and an authenticated TTN webhook.
- Socket.IO sender ingestion with short-lived sender JWTs and per-write revalidation.
- Canonical vehicle location selection by active source priority and a 30-second freshness window.
- Docker Compose development and production-mode container configurations.

The repository directly evidences these user groups:

- Public users who view routes, stops, vehicles, ETA, location, and submit feedback.
- Admin users who manage vehicles, routes, stops, and tracking sources.
- External senders such as mobile applications, ESP32 devices, and simulators that authenticate and
  submit location observations.
- TTN/LoRaWAN webhook senders that submit location payloads through the server-side webhook route.

The declared project stage is MVP. The Level 1 contract in
`agents/level-1-audit/AGENT.md` targets evidence-based progression toward a
production-ready system. A complete mobile application, ESP32 firmware, and deployed TTN provider
configuration are not present in this repository.

## Project Overview

### Business

The domain is university shuttle transportation. Seed data and interface text reference Rangsit
University, routes `R01`, `R02`, and `R03`, campus stops, a train-station route, vehicles, trips,
and rider feedback.

The public workflow is to select a route, inspect stops and vehicles on a map, see live positions,
identify a nearby stop, estimate arrival time, and submit feedback about a vehicle. The admin
workflow is to authenticate, inspect live fleet status and counts, and maintain routes, stops,
vehicles, and tracking-source registrations.

### System

The system has two frontend experiences and several backend boundaries:

- Public web tracking at `/`.
- Admin web application under `/admin/*`.
- Admin REST APIs under `/api/admin/*`.
- Public REST APIs under `/api/public/*`.
- Sender trip and HTTP ingestion APIs.
- TTN webhook ingestion.
- Socket.IO for public viewers, admin live maps, and authenticated sender location writes.

### Architecture

The frontend reads route and stop data through REST, obtains live canonical vehicle updates through
Socket.IO, and renders maps with Leaflet. The backend authenticates admin and sender traffic,
resolves each accepted observation against the tracking-source registry, stores the latest raw
snapshot per source in Redis, selects a canonical current location for an assigned vehicle,
broadcasts that canonical result, and periodically persists canonical history to PostGIS-backed
`gps_tracks`.

## Feature Inventory

### Public User

- Public tracking page at `/`.
- Leaflet map centered on the university area.
- Route selection for `R01` and `R02` in the current public tracker.
- Route stop loading from `GET /api/public/routes/:id/stops`.
- Local route geometry files for `R01` and `R02`.
- OSRM route geometry fallback when local route data or local cache is unavailable.
- Live vehicle marker updates from Socket.IO `location-update`.
- Vehicle movement animation and route-position calculations using Turf helpers.
- Active vehicle availability count.
- Stop markers, stop selection, and stop information card.
- Vehicle selection and vehicle information card.
- Browser geolocation marker and nearest-stop lookup.
- ETA calculation based on route geometry, vehicle position, speed history, and stops.
- Public application tour.
- Feedback modal with feedback type, vehicle selection, message submission, success state, and
  error handling.
- Public feedback submission through `POST /api/public/feedback`.

### Admin User

- Admin login at `/admin/login`.
- JWT-backed admin session stored by the frontend as the `admin_token` cookie.
- Admin route protection through `shuttle-tracking-web/proxy.ts` and API Bearer tokens.
- Admin logout from the sidebar.
- Dashboard at `/admin/dashboard`.
- Dashboard counts for active vehicles, total routes, and total stops.
- Admin live map subscribed to `location-update`.
- Vehicle list, create, edit, delete, status display, and route assignment.
- Route list, create, edit, delete, color, and status management.
- Stop list, create, edit, delete, bilingual names, coordinates, image URL, and status management.
- Backend route-stop list/create/delete API, with no route-stop management page found in the
  frontend source.
- Backend tracking-source/device CRUD API and source-selection analytics API. No admin device page
  was found in the current frontend source.

### Sender, Driver, Mobile, ESP32, Or Simulator

- Source credential exchange through `POST /api/auth/vehicle-login`.
- Short-lived sender JWT containing source ID, bound vehicle ID, and credential version.
- Authenticated trip start through `POST /api/trips/start`.
- Authenticated trip end through `PUT /api/trips/:id/end`.
- Authenticated HTTP location ingestion through `POST /api/ingest/http`.
- Authenticated Socket.IO location ingestion through `send-location`.
- Socket sender handshake authentication and per-write credential/source/vehicle revalidation.
- Acknowledgement responses and error codes for sender write outcomes.
- Sender credential rotation through the admin device update API, which increments credential
  version.
- `shuttle-tracking-web/simulate.js` for mobile-style Socket.IO simulation.
- `shuttle-tracking-web/simulate-manual.js` for manually entered mobile-style coordinates.
- `shuttle-tracking-backend/simulate-ttn.js` for TTN webhook simulation.
- `shuttle-tracking-backend/test_pipeline.js` for an end-to-end sender, TTN, and source-priority
  integration exercise.

The repository does not contain a separate driver/mobile application or ESP32 firmware. These
features are represented by backend contracts and simulators.

### TTN / LoRaWAN Source

- Server-side `POST /api/ingest/ttn` webhook.
- Bearer-secret validation using `TTN_WEBHOOK_SECRET`.
- TTN device ID extraction from `end_device_ids.device_id`.
- Decoding support for `uplink_message.decoded_payload` coordinates.
- Decoding support for `uplink_message.locations` coordinates.
- Decoding support for `data.location_solved.location` coordinates.
- Support for speed, bearing/heading, accuracy/HDOP, and station fields where supplied.
- Graceful HTTP 200 response for TTN status payloads without coordinates.
- Source-type check requiring the registered source to be `lorawan`.

## Technology Stack

### Frontend

- Node.js runtime in the Docker image.
- Next.js `16.1.6`.
- React `19.2.3`.
- TypeScript.
- Leaflet `1.9.4` and React-Leaflet `5.0.0`.
- Turf.js `7.3.4`.
- Socket.IO client `4.8.3`.
- Axios `1.13.5`.
- Tailwind CSS 4 and PostCSS integration.
- Lucide React icons.
- `cookies-next` and `jwt-decode` for the admin session.
- `react-joyride` for the public application tour.

### Backend

- Node.js 22 Alpine Docker base image.
- Express `5.2.1`.
- TypeScript `5.9.3`.
- Socket.IO `4.8.3`.
- Prisma `7.3.0` with the PostgreSQL adapter.
- PostgreSQL driver `pg`.
- Redis client `redis` and Socket.IO Redis adapter.
- JWT with `jsonwebtoken`.
- Password and source-secret hashing with `bcrypt`.
- CORS and dotenv.
- Nodemon for local development.

### Data And Runtime

- PostgreSQL.
- PostGIS geography columns and spatial SQL functions.
- Redis.
- Docker Compose.
- Docker multi-stage builds for development and production targets.

## Repository Structure

- `README.md`: root project overview, local setup, Docker setup, and component descriptions.
- `AGENTS.md`: repository-wide agent routing, ownership, and safety rules.
- `agents/`: exactly three Level 1–3 role contracts.
- `.agents/skills/`: the only repository-scoped project skills location.
- `docs/project-knowledge-base.md`: this shared discovery context.
- `docs/audits/`: audit documents from other project dimensions; these are separate from the
  discovery scope.
- `docs/roadmap/`: refactoring and future-work roadmap; roadmap items are not treated as current
  implementation unless source evidence also exists.
- `docker-compose.yml`: local/development Compose stack with PostGIS, Redis, backend, and frontend.
- `docker-compose.prod.yml`: production-mode Compose stack using production Docker targets and
  required production secrets.
- `docker/init-postgis.sh`: enables PostGIS and PostGIS topology extensions.
- `env.example`: root Compose environment template.
- `shuttle-tracking-backend/`: Express, Socket.IO, Prisma, ingestion, authentication, and seed code.
- `shuttle-tracking-backend/src/routes/`: API and ingestion route definitions.
- `shuttle-tracking-backend/src/controllers/`: REST request handlers for auth, CRUD, devices,
  feedback, public data, and trips.
- `shuttle-tracking-backend/src/services/`: tracking-source processing, canonical location
  selection, feedback persistence, and public-cache invalidation.
- `shuttle-tracking-backend/src/config/`: Prisma and Redis clients.
- `shuttle-tracking-backend/src/middleware/`: admin and sender JWT middleware and sender context
  parsing.
- `shuttle-tracking-backend/prisma/schema.prisma`: current database model definitions.
- `shuttle-tracking-backend/prisma/migrations/`: PostGIS, feedback, tracking-source, and tracking
  source credential lifecycle migrations.
- `shuttle-tracking-backend/prisma/seed.js`: development fixtures and explicit production first-admin
  provisioning path.
- `shuttle-tracking-backend/simulate-ttn.js`: TTN webhook simulator using route coordinate presets.
- `shuttle-tracking-backend/test_auth_boundary.js`: sender JWT and claim boundary checks.
- `shuttle-tracking-backend/test_socket_boundary.js`: unauthenticated Socket.IO sender-write check.
- `shuttle-tracking-backend/test_pipeline.js`: manual integration pipeline test for sender and TTN
  ingestion.
- `shuttle-tracking-web/`: Next.js frontend.
- `shuttle-tracking-web/app/`: public page, admin pages, and layouts.
- `shuttle-tracking-web/components/public/`: public map, cards, tour, and feedback UI.
- `shuttle-tracking-web/components/admin/`: admin dashboard map, sidebar, and CRUD modals.
- `shuttle-tracking-web/services/`: authenticated admin and public Axios clients.
- `shuttle-tracking-web/contexts/`: admin authentication context.
- `shuttle-tracking-web/hooks/`: browser-only Leaflet map initialization.
- `shuttle-tracking-web/utils/`: marker, icon, movement, and map helpers.
- `shuttle-tracking-web/types/`: frontend entity and location types.
- `shuttle-tracking-web/public/data/`: local route geometry for `R01` and `R02`.
- `shuttle-tracking-web/simulate.js`: automated mobile-style Socket.IO simulator.
- `shuttle-tracking-web/simulate-manual.js`: interactive mobile-style simulator.

## Architecture Summary

### Frontend

The public root page dynamically imports `ShuttleTracker` with server-side rendering disabled. The
tracker initializes a Leaflet map in the browser, loads public route/stop data, and opens a public
Socket.IO connection for canonical location updates.

The admin area uses an App Router layout and `AuthProvider`. The frontend stores the admin JWT in
the `admin_token` cookie, attaches it to Axios requests as a Bearer token, and redirects protected
admin navigation to `/admin/login` when the cookie is absent.

The current frontend has admin pages for dashboard, vehicles, routes, and stops. It does not contain
pages for devices/tracking sources, route-stop management, feedback review, trips, or history.

### Backend

`shuttle-tracking-backend/src/server.ts` creates the Express app, HTTP server, and Socket.IO
server. It configures CORS, JSON parsing, route mounts, health checks, and the Redis adapter.

Current route mounts are:

- `/api/auth`: admin and sender authentication.
- `/api/admin/vehicles`: admin-protected vehicle CRUD.
- `/api/admin/routes`: admin-protected route CRUD and route vehicle lookup.
- `/api/admin/stops`: admin-protected stop CRUD.
- `/api/admin/route-stops`: admin-protected route-stop operations.
- `/api/admin/devices`: admin-protected tracking-source/device CRUD and analytics.
- `/api/public`: public route, vehicle, stop, and feedback endpoints.
- `/api/trips`: sender-authenticated trip lifecycle.
- `/api/ingest`: sender-authenticated HTTP and secret-authenticated TTN ingestion.

Admin JWT middleware accepts claims with a `userId` and rejects sender-kind tokens. Sender JWT
middleware verifies token type, source ID, vehicle ID, source status, source type, and credential
version against the database. Sender tokens default to a 15-minute lifetime through
`SENDER_JWT_EXPIRES_IN`.

### Multi-Source Tracking Pipeline

`tracking.service.ts` currently performs these stages:

1. Validate source ID and latitude/longitude against global coordinate bounds.
2. Load an active `TrackingSource` and its assigned vehicle.
3. Require a matching sender context for non-LoRaWAN sources. LoRaWAN observations arrive through
   the TTN webhook boundary.
4. If a trip ID is supplied, verify that it belongs to the source vehicle and is in progress.
5. Store the latest observation for the source in Redis under
   `source:last_location:<sourceId>`.
6. Update the source `lastSeenAt` database field at most once every 10 seconds per source.
7. Inspect all active sources for the vehicle in ascending priority order.
8. Select the first source with a latest observation no older than 30 seconds. Equal priorities are
   ordered by source ID.
9. Normalize moving observations with speed at least 2 to station `En Route`.
10. Store the selected canonical location in Redis under
    `vehicle:current_location:<vehicleId>`.
11. Increment source-selection counters in Redis.
12. Persist the canonical location to `gps_tracks` at most once per 60 seconds per trip key.
13. Return the canonical location to the HTTP or Socket.IO boundary, which broadcasts it as
    `location-update` when a canonical result exists.

The current Redis source snapshot is the latest value per source, not an append-only raw
observation table. Durable GPS history is sampled canonical history in `gps_tracks` and records
the selected source ID.

### Redis And Realtime

Redis is used for:

- Cached active routes, public stops, and route stops.
- Latest source observation snapshots.
- Current canonical vehicle locations.
- `lastSeenAt` update throttling.
- Trip GPS history write throttling.
- Source-selection counters.
- Socket.IO pub/sub adapter clients for multi-process broadcast support.

Public viewers and admin live maps connect to Socket.IO without a sender token. Sender sockets must
provide a sender token during handshake and are revalidated for every `send-location` write. A
public viewer can receive `location-update` but unauthenticated sender writes receive
`SENDER_AUTH_REQUIRED`.

### Database

Prisma models describe the relational entities. Raw SQL is used where PostGIS geography values
need to be written or converted to latitude/longitude. Migrations create the PostGIS extension
dependencies, relational constraints, tracking-source registry, source credential metadata, and
indexes.

## Data Flow Summary

### Public Initial Data Flow

1. A browser opens `/`.
2. `ShuttleTracker` requests active vehicle data and route stops from the public API.
3. The backend reads active routes, active vehicles, and active stops from PostgreSQL or Redis
   cache.
4. Route-stop SQL converts PostGIS locations into `lat` and `lng` and orders stops by
   `stop_order`.
5. The frontend loads route geometry from `/public/data/route-R01.json` or
   `/public/data/route-R02.json`, local storage, or the OSRM public router.
6. Leaflet renders the map, route, stops, and any current vehicle locations.

### Live Canonical Location Flow

1. A source authenticates through `/api/auth/vehicle-login` when the source is mobile, ESP32, or a
   simulator.
2. The source starts a trip through `/api/trips/start`, or a later accepted observation can cause
   the tracking service to create a virtual daily trip for a routed vehicle when no active trip is
   found.
3. The source sends an observation through `/api/ingest/http` or Socket.IO `send-location`.
4. The backend validates source ownership, coordinates, and optional trip ownership.
5. The pipeline records the latest source snapshot in Redis and evaluates other active sources for
   the same vehicle.
6. The highest-priority fresh source becomes the canonical vehicle location.
7. The backend stores that canonical location in Redis and may sample it into `gps_tracks`.
8. The ingestion boundary emits `location-update` to all connected Socket.IO clients.
9. The public tracker and admin live map update the corresponding vehicle marker.
10. A sender can end the trip through `/api/trips/:id/end`, which marks the trip completed, marks the
    vehicle inactive, and clears the trip throttle key.

### TTN / LoRaWAN Flow

1. TTN or the TTN simulator sends `POST /api/ingest/ttn` with an Authorization Bearer secret.
2. The backend compares the configured secret and extracts the registered TTN device ID.
3. The route decodes coordinates from one of the supported TTN payload shapes.
4. The tracking pipeline verifies that the source exists, is active, and has type `lorawan`.
5. The source snapshot is stored, canonical selection is evaluated for the assigned vehicle, and a
   canonical result is broadcast if one is available.
6. A TTN status payload without coordinates receives HTTP 200 and does not create a GPS record.

### Admin Management Flow

1. An admin posts credentials to `/api/auth/login`.
2. The backend compares the bcrypt password hash and returns an admin JWT.
3. The frontend stores the token in the `admin_token` cookie and adds it to admin API calls.
4. Admin pages call protected CRUD APIs for vehicles, routes, and stops.
5. Admin device APIs maintain `TrackingSource` registration, source assignment, priority, status,
   and secret rotation.
6. Route, stop, and vehicle mutations call public cache invalidation; device mutations are handled
   through the device controller.

### Feedback Flow

1. The public tracker opens `FeedbackModal` and loads active vehicles.
2. The user selects a feedback type and vehicle, then submits a message.
3. The frontend posts `type`, `vehicleId`, and `message` to `/api/public/feedback`.
4. The backend validates the fields, verifies the vehicle exists, captures `req.ip`, and creates a
   `Feedback` row.
5. The public client shows a success state. No feedback review API or admin feedback page is
   present in the current repository.

### Startup And Deployment Flow

1. Docker starts PostGIS and Redis with health checks.
2. Backend startup connects Redis, attaches the Socket.IO Redis adapter, and runs the entrypoint.
3. The entrypoint runs `prisma migrate deploy`.
4. Development containers run `prisma db seed`; non-development containers skip the seed.
5. Production-mode startup validates JWT and TTN secrets before migrations and application startup.
6. `docker-compose.prod.yml` starts production Docker targets for database, Redis, backend, and
   frontend.

## Entity Summary

### User

Admin account with unique username and bcrypt password hash. The current schema has no role column;
the admin middleware identifies admin-style tokens by the presence of a user ID and absence of the
sender token kind.

### Route

Shuttle route with ID, display name, color, status, and creation timestamp. A route has vehicles,
ordered route-stop mappings, and trips.

### Vehicle

Shuttle vehicle with ID, name, type, status, and optional assigned route. A vehicle has trips, GPS
tracks, feedback records, and tracking sources.

### Stop

Physical stop with Thai name, optional English name, PostGIS geography location, optional image
URL, status, and route-stop mappings.

### RouteStop

Ordered junction entity connecting a route to a stop. The schema enforces uniqueness for a route and
stop order pair. Seed data maps the campus stops to `R01` and `R02`.

### Trip

Operational trip for a vehicle and route with start time, optional end time, status, and related
GPS tracks. Current code uses `in_progress` and `completed` statuses in the sender lifecycle.

### GPSTrack

Sampled durable GPS history row containing trip ID, vehicle ID, PostGIS location, optional speed,
heading, station, optional selected source ID, and recorded timestamp. The current persistence
path writes canonical selected locations, not every incoming observation.

### TrackingSource

Registered physical or logical source with ID, name, type, optional assigned vehicle, priority,
status, optional bcrypt secret hash, credential lifecycle timestamps/version, last-seen timestamp,
and relations to vehicle and GPS tracks.

Source types declared by the current service and migration are `mobile`, `lorawan`, `esp32`, and
`simulator`. Source statuses are `provisioning`, `active`, `inactive`, and `retired`. Active
non-LoRaWAN sources use a secret-backed sender token; the TTN webhook is the authentication boundary
for LoRaWAN sources.

### Feedback

Public feedback record with type, optional vehicle ID, message, IP address, and creation timestamp.
The vehicle relation uses `ON DELETE SET NULL`. The current public flow requires a vehicle ID when
creating feedback.

### Relationships

- One route can have many vehicles, route-stop mappings, and trips.
- One vehicle can optionally belong to one assigned route.
- One stop can appear in many route-stop mappings.
- One vehicle can have many trips, GPS tracks, feedback records, and tracking sources.
- One trip belongs to one vehicle and one route and has many GPS tracks.
- One GPS track may reference the selected tracking source.
- One tracking source can be assigned to at most one vehicle and can have many GPS tracks.
- One feedback record may reference one vehicle.

## API Summary

All paths below are relative to the backend host, with REST routes under `/api` unless noted.

### Health

- `GET /health`: process-level health response with status and timestamp.
- `GET /ready`: checks PostgreSQL with `SELECT 1` and Redis with `PING`; returns ready or 503.

### Authentication

- `POST /api/auth/login`: admin username/password login; returns admin JWT and user identity.
- `GET /api/auth/me`: admin JWT-protected current-user lookup.
- `POST /api/auth/vehicle-login`: source ID, secret, and optional vehicle ID validation; returns a
  short-lived sender JWT for active non-LoRaWAN sources.

### Public REST

- `GET /api/public/active-routes`: active routes, cached in Redis.
- `GET /api/public/active-vehicles`: active vehicles with route and current canonical location
  snapshot from Redis.
- `GET /api/public/routes/:id/stops`: active stops for a route with coordinates and stop order,
  cached per route.
- `GET /api/public/stops`: active stops with coordinates, cached in Redis.
- `POST /api/public/feedback`: validates and creates public feedback for a vehicle.

### Admin Vehicle REST

- `GET /api/admin/vehicles`
- `GET /api/admin/vehicles/:id`
- `POST /api/admin/vehicles`
- `PUT /api/admin/vehicles/:id`
- `DELETE /api/admin/vehicles/:id`

These endpoints list and maintain vehicles, including optional route assignment and status.

### Admin Route REST

- `GET /api/admin/routes`
- `GET /api/admin/routes/:id`
- `POST /api/admin/routes`
- `PUT /api/admin/routes/:id`
- `DELETE /api/admin/routes/:id`
- `GET /api/admin/routes/:id/vehicles`

### Admin Stop REST

- `GET /api/admin/stops`
- `GET /api/admin/stops/:id`
- `POST /api/admin/stops`
- `PUT /api/admin/stops/:id`
- `DELETE /api/admin/stops/:id`

### Admin Route-Stop REST

- `GET /api/admin/route-stops`
- `GET /api/admin/route-stops/:routeId`
- `POST /api/admin/route-stops`
- `DELETE /api/admin/route-stops/:id`

### Admin Device / Tracking-Source REST

- `GET /api/admin/devices`
- `GET /api/admin/devices/:id`
- `POST /api/admin/devices`
- `PUT /api/admin/devices/:id`
- `DELETE /api/admin/devices/:id`
- `GET /api/admin/devices/analytics`

The CRUD endpoints operate on `TrackingSource`. The analytics endpoint returns Redis source
selection counters grouped by vehicle. The current endpoint does not expose an admin frontend page.

### Sender Trip REST

- `POST /api/trips/start`: sender-authenticated start for the sender-bound vehicle; requires an
  assigned route and sets vehicle status to active.
- `PUT /api/trips/:id/end`: sender-authenticated completion for a trip belonging to the sender's
  vehicle; sets the vehicle inactive and clears the GPS throttle key.

### Sender HTTP Ingestion

- `POST /api/ingest/http`: sender Bearer JWT-protected location observation for the sender-bound
  source and vehicle. Returns `canonicalLocation` when a source is assigned to a vehicle.

Accepted fields include `sourceId`, `lat`, `lng`, optional `speed`, `bearing`, `accuracy`, `station`,
and optional `tripId`.

### TTN Webhook Ingestion

- `POST /api/ingest/ttn`: server-to-server TTN webhook protected by `Authorization: Bearer
  <TTN_WEBHOOK_SECRET>`. It accepts supported TTN location payloads and returns the canonical
  location when available.

### WebSocket Events

- Client to server `send-location`: sender-only observation event. The sender provides a source ID
  and optional vehicle/trip fields. The server revalidates credentials and responds through the
  Socket.IO acknowledgement callback.
- Server to client `location-update`: canonical vehicle location broadcast to public and admin
  map clients.
- Server to sender `error-response`: structured error event for rejected sender writes.

Observed acknowledgement/error codes include `SENDER_AUTH_REQUIRED`, `SENDER_AUTH_UNAVAILABLE`,
`SENDER_CREDENTIAL_INVALID`, `SOURCE_ID_REQUIRED`, `SENDER_OWNERSHIP_MISMATCH`,
`TRIP_OWNERSHIP_MISMATCH`, `INVALID_COORDINATES`, and `LOCATION_REJECTED`.

## External Services

### Runtime Services

- PostgreSQL: primary relational data store.
- PostGIS: spatial extension for stop and GPS geography.
- Redis: cache, source/current-location snapshots, throttles, analytics counters, and Socket.IO
  adapter transport.
- Docker Compose: local/development and production-mode container orchestration.

### Mapping And Routing Services

- OpenStreetMap tile server in the main public map hook and admin live map.
- CARTO raster tiles in the alternate `PublicMap` component.
- OSRM public router API for route geometry fallback.
- Flaticon CDN icon URLs in the alternate public map and admin live map components.

### Device / Network Integration

- TTN/LoRaWAN is represented by the authenticated HTTP webhook contract and
  `simulate-ttn.js`.
- No TTN MQTT client, external TTN application configuration, payload decoder service, or
  LoRaWAN network deployment file is present.
- No mobile application source or ESP32 firmware/provisioning project is present.

### Hosting Providers

No Vercel, Render, Neon, or other cloud-provider configuration was found. The repository does
contain `docker-compose.prod.yml`, which describes a production-mode self-hosted container stack,
but the actual deployment host, domain, TLS, and operations environment are not documented in the
repository.

## Environment Configuration

### Root Compose Variables

`env.example` documents:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `SENDER_JWT_EXPIRES_IN`
- `TTN_WEBHOOK_SECRET`

### Backend Variables

`shuttle-tracking-backend/.env.example` documents:

- `DATABASE_URL`
- `REDIS_URL`
- `NODE_ENV`
- `PORT`
- `API_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `SENDER_JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `TTN_WEBHOOK_SECRET`
- `SEED_ADMIN_PASSWORD`
- `TRACKING_SOURCE_SECRET_MOBILE`
- `TRACKING_SOURCE_SECRET_ESP32`
- `PROVISION_INITIAL_ADMIN`
- `INITIAL_ADMIN_USERNAME`
- `INITIAL_ADMIN_PASSWORD`

### Frontend Variables

`shuttle-tracking-web/.env.example` documents `NEXT_PUBLIC_API_BASE_URL`. Source code also reads
`NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_SOCKET_URL` for some public/admin Socket.IO and feedback
URL resolution paths, but those names are not in the frontend example file.

### Seed And Production Startup Behavior

- Development seed creates routes, stops, vehicles, route-stop mappings, and LoRaWAN source
  fixtures. Mobile and ESP32 fixtures are created only when their development source secrets are
  configured; otherwise those source IDs are marked inactive.
- Development admin fixtures `admin` and `transport` are upserted only when
  `SEED_ADMIN_PASSWORD` is explicitly configured. The current `seed.js` does not contain a built-in
  admin password.
- Non-development seed execution is disabled except for an explicit one-time initial-admin flow
  requiring `PROVISION_INITIAL_ADMIN=true`, a chosen username, a password of at least 16 characters,
  and an empty users table.
- The backend production entrypoint validates `JWT_SECRET` and `TTN_WEBHOOK_SECRET`, rejects known
  placeholder/default patterns and short values, requires the two values to differ, runs migrations,
  skips seed, and starts the compiled server.
- `docker-compose.prod.yml` requires production database password, JWT secret, and TTN webhook
  secret values, and defaults sender JWT lifetime to 15 minutes.

## Known Limitations From Available Evidence

These are repository-state descriptions, not quality or security findings.

- No separate mobile app source is present; mobile behavior is represented by sender APIs and
  simulators.
- No ESP32 firmware or device-side protocol implementation is present.
- No live TTN provider configuration, MQTT consumer, or external LoRaWAN deployment is present.
- Tracking-source device CRUD and analytics exist only in backend APIs; no corresponding admin page
  is present.
- Route-stop CRUD exists only in backend APIs; no corresponding admin page is present.
- Public feedback submission is implemented, but no feedback review/list/status API or admin page is
  present.
- The current source pipeline retains only the latest observation per source in Redis. There is no
  append-only raw-observation model containing separate receive-time, event-time, sequence, or
  rejection records.
- `GPSTrack` persistence is sampled canonical history at a 60-second Redis throttle, not a complete
  record of every input event.
- The current canonical observation timestamp is generated when the backend receives/processes the
  observation; no incoming event-time or sequence field is handled by the current observation
  interface.
- Source freshness is represented by a 30-second helper/classifier and selection check. A source
  health helper exists, but no dedicated health REST response or device-health dashboard was found.
- No trip-history, playback, reporting, notification, or alert route/page was found.
- No OpenAPI/Swagger contract was found.
- Test artifacts exist for sender claims, Socket.IO boundary, and an integration pipeline, but the
  integration pipeline requires running infrastructure and configured secrets. No frontend test
  script or implementation was found.
- The root README still documents `admin`/`transport` with `admin123`, while the current seed code
  requires `SEED_ADMIN_PASSWORD` and has no built-in password. The intended credential setup needs
  confirmation.
- The TTN simulator presets use IDs such as `TS_LORA_01` and `TS_LORA_N2`, while the current seed
  data creates LoRaWAN sources named `sensor-c4` and `sensor-f2`. The intended mapping between these
  fixtures needs confirmation.

## Missing Information

The following information is not available in the repository and is required for later audits to
fully compare intended behavior with implementation:

- Production deployment topology beyond the self-hosted Docker Compose description, including host,
  domain, TLS termination, network boundaries, and process scaling.
- Production ownership and configuration for PostgreSQL, Redis, backups, monitoring, alerting, and
  log retention.
- The source repository and API contract for the real mobile/driver application.
- Mobile offline, retry, authentication renewal, trip lifecycle, and background-location behavior.
- ESP32 hardware, firmware, transport, payload, provisioning, and credential rotation contract.
- TTN application/device registry, device IDs, webhook configuration, payload decoder ownership,
  and whether the intended integration is webhook-only or also MQTT/history based.
- Intended tracking-source provisioning workflow and who is allowed to create, assign, retire, or
  rotate a source.
- Product definition for admin roles and permissions beyond the current single admin-token shape.
- GPS event-time semantics, expected update interval, clock synchronization, canonical-history
  retention, raw-source retention, and archival/deletion ownership.
- Intended stale/offline behavior for public vehicle display and admin operations.
- Intended feedback moderation, review, status, retention, and privacy workflow.
- Intended trip history, playback, reports, notifications, alerts, and announcements scope.
- Formal REST and WebSocket request/response contract, including error semantics and versioning.
- Confirmation of the credential setup documented in the root README versus the current seed flow.
- Confirmation of whether current TTN simulator IDs should be changed to the current seeded source
  IDs or whether a separate fixture set is expected.

## Assumptions

No unsupported business or deployment assumptions are used as facts.

- “Sender”, “driver”, and “mobile/device” refer to the backend sender contract and simulator evidence;
  they do not imply that a mobile or device application is included.
- `docker-compose.prod.yml` is documented as a production-mode container configuration because it
  uses production image targets and production secret checks. This does not establish that it is the
  actual deployed production environment.
- A source with type `lorawan` is treated as a TTN/LoRaWAN source because the service and webhook
  explicitly use that type; no external TTN deployment is inferred.
- The root README and current seed behavior are both recorded where they differ; this document does
  not choose which credential instruction is intended.

## Audit Readiness

Ready for Product Audit Agent.

The current repository behavior, multi-source tracking boundary, data model, APIs, frontend
features, deployment files, simulators, tests, and open information gaps are documented from
available evidence. Production-specific audits still require the missing deployment, device,
operational, product, and credential decisions listed above.

## Project Knowledge Base

### Business Domain

University shuttle/tram tracking with real-time public visibility, route and stop data, operational
vehicle management, multi-source location ingestion, and public rider feedback.

### Users

- Public riders and visitors.
- Admin/transport operators.
- Mobile/driver/location senders.
- ESP32 and simulator senders.
- TTN/LoRaWAN device integrations.

### User Roles

- Public user.
- Admin user.
- Sender/device identity bound to a tracking source and vehicle.

No separate super-admin, developer, driver-account, or role-based permission model is evidenced in
the current application code.

### Features

- Public live map, route selection, stops, vehicles, ETA, geolocation, nearest stop, and feedback.
- Admin login, dashboard, live map, vehicle CRUD, route CRUD, and stop CRUD.
- Backend route-stop and tracking-source/device CRUD.
- Sender JWT authentication and credential-version validation.
- Authenticated trip start/end.
- HTTP and Socket.IO location ingestion.
- TTN webhook ingestion and simulator.
- Source priority and freshness-based canonical location selection.
- Redis current-location/cache/throttle/analytics behavior.
- Sampled PostGIS GPS history.
- Health and readiness endpoints.
- Boundary and pipeline test scripts.

### Technology Stack

Next.js, React, TypeScript, Leaflet, React-Leaflet, Turf, Socket.IO client, Axios, Tailwind CSS,
Express, Socket.IO, Prisma, PostgreSQL, PostGIS, Redis, JWT, bcrypt, Docker Compose, and Node.js 22.

### Repository Structure

The repository consists of root Compose/configuration and documentation, a TypeScript backend with
Prisma/migrations and ingestion services, and a Next.js frontend with public/admin map experiences,
API clients, and simulators. Audit instructions and audit documents are stored under `agents/` and
`docs/`.

### Architecture

Browser clients use REST for initial/configuration data and Socket.IO for live canonical vehicle
updates. Sender identities authenticate against registered tracking sources. The backend uses Redis
for live source/current state and coordination, PostgreSQL/PostGIS for durable entities and sampled
history, and Docker Compose for local and production-mode runtime composition.

### Data Flow

The principal flows are public route/stop loading, live source observation ingestion and canonical
selection, TTN webhook ingestion, admin CRUD, feedback submission, and migration/seed/startup.

### Business Entities

User, Route, Vehicle, Stop, RouteStop, Trip, GPSTrack, TrackingSource, and Feedback.

### APIs

REST groups are health, auth, public, admin vehicle/route/stop/route-stop/device, trip lifecycle,
HTTP ingestion, and TTN ingestion. Socket.IO events are `send-location`, `location-update`, and
`error-response`.

### External Services

PostgreSQL/PostGIS, Redis, Docker Compose, OpenStreetMap, CARTO, OSRM, Flaticon CDN, and the
repository-defined TTN webhook boundary. No cloud hosting provider or live TTN deployment is
configured in the repository.

### Known Limitations

See “Known Limitations From Available Evidence” and “Missing Information”.

### Open Questions

- What is the actual production deployment topology and operations ownership?
- Where is the real mobile/driver app and its formal contract?
- What are the ESP32 and TTN device provisioning and payload contracts?
- Which source IDs are authoritative for LoRaWAN fixtures and deployed devices?
- What roles and permissions are intended beyond one admin token shape?
- What are the GPS event-time, update-rate, retention, and stale-state policies?
- Is raw observation research history required, and if so, what fields and retention apply?
- Who reviews public feedback and what statuses/workflow are required?
- Are route-stop and device management intentionally API-only or planned for the admin UI?
- Which reports, alerts, notifications, trip history, and playback capabilities belong to the MVP?

## Handoff Recommendation

Next recommended agent: Product Audit Agent.
