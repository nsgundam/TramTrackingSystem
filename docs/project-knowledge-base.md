# Tram Tracking System Project Knowledge Base

## Executive Summary

The Tram Tracking System is an MVP full-stack web application for real-time tram/shuttle tracking. The repository contains a Next.js frontend, an Express/Socket.IO backend, a PostgreSQL/PostGIS database, Redis caching, and Docker Compose orchestration.

The system solves the problem of showing shuttle/tram locations to public users while giving administrators a management interface for routes, stops, vehicles, and live operations. Evidence: root `README.md`, `shuttle-tracking-backend/README.md`, and `shuttle-tracking-web/README.md`.

Known users from the repository are:

- Public user: views live route, stop, ETA, nearest stop, and vehicle information on the public tracking map.
- Admin user: logs into the admin portal and manages vehicles, routes, and stops.
- Driver/mobile/device sender: starts/ends trips and sends GPS location updates through the trip REST API and Socket.IO event flow. The repository includes a simulator, not a full mobile app.

Current project objective: MVP implementation of a real-time shuttle tracking system, with a long-term target of production readiness according to `agents/discovery/AGENT.md`.

## Project Overview

Business context:

- The project supports university shuttle/tram tracking. Seed data and UI labels reference Rangsit University and routes such as `R01` and `R02`.
- The public-facing workflow helps users see active route/service information and estimate shuttle arrivals.
- The admin workflow manages operational data used by public tracking.

System context:

- Frontend: Next.js app with a public map and admin pages.
- Backend: Express API with Socket.IO real-time messaging.
- Database: PostgreSQL with PostGIS geography fields.
- Cache: Redis for public API caching, Socket.IO scaling adapter, and GPS write throttling.
- Deployment/runtime in repo: Docker Compose local/dev stack.

Architecture context:

- Public frontend reads public REST endpoints, listens to Socket.IO `location-update`, renders Leaflet maps, and optionally calls OSRM when route geometry is not cached locally.
- Admin frontend authenticates through JWT, stores `admin_token` in a cookie, calls protected admin REST endpoints, and listens to live vehicle updates on the dashboard map.
- Backend receives trip start/end requests and socket location events, writes GPS tracks with PostGIS location data, and broadcasts location updates to connected clients.

## Feature Inventory

### Public User

- Public tracking page at `/` using `components/public/ShuttleTracker.tsx`.
- Interactive Leaflet map centered on RSU coordinates.
- Route toggle for `R01` and `R02`.
- Public route stop loading from `GET /api/public/routes/:id/stops`.
- Route geometry loading from `public/data/route-R01.json` and `public/data/route-R02.json`, with OSRM fallback.
- Real-time vehicle marker updates from Socket.IO `location-update`.
- Vehicle marker animation and route snapping using Leaflet and Turf.
- Available active vehicle count display.
- Stop selection and stop information card.
- Vehicle selection and vehicle information card.
- Browser geolocation marker.
- Nearest stop lookup from current browser geolocation.
- ETA calculation based on route geometry, current vehicle position, speed history, and stops between vehicle and target.
- App tour component included in the public tracker.

### Admin User

- Admin login page at `/admin/login`.
- JWT authentication through `POST /api/auth/login`.
- Client-side auth context stores `admin_token` cookie and decodes JWT.
- Next.js proxy protects `/admin/*` pages except `/admin/login`.
- Admin logout from sidebar.
- Dashboard at `/admin/dashboard`.
- Dashboard stats for active vehicles, total routes, and total stops.
- Admin live map subscribing to Socket.IO `location-update`.
- Vehicles management page:
  - List vehicles.
  - Create vehicle.
  - Edit vehicle.
  - Delete vehicle.
  - Assign vehicle to route.
  - Display vehicle status.
- Routes management page:
  - List routes.
  - Create route.
  - Edit route.
  - Delete route.
  - Manage route color and status.
- Stops management page:
  - List stops.
  - Create stop.
  - Edit stop.
  - Delete stop.
  - Manage Thai/English names and coordinates.

### Driver, Mobile App, Or Device Sender

- Vehicle ID verification through `POST /api/auth/vehicle-login`.
- Trip start through `POST /api/trips/start`.
- Trip end through `PUT /api/trips/:id/end`.
- Real-time GPS submission through Socket.IO `send-location`.
- The repository includes `shuttle-tracking-web/simulate.js`, which starts a trip and emits `send-location` events for simulated vehicle movement.

### Backend API Only

- Route-stop mapping endpoints exist under `/api/admin/route-stops`.
- Implemented operations: list all route stops, get stops by route, create route-stop mapping, and delete route-stop mapping.
- No frontend caller for `route-stops` was found by repository search.

## Technology Stack

Frontend:

- Next.js 16.1.6
- React 19.2.3
- TypeScript
- Leaflet and React-Leaflet
- Socket.IO client
- Axios
- Turf.js
- Tailwind CSS 4
- Lucide React
- cookies-next
- jwt-decode
- react-joyride

Backend:

- Node.js 22
- Express 5
- TypeScript
- Socket.IO
- Prisma 7 with `@prisma/adapter-pg`
- PostgreSQL driver `pg`
- Redis client
- Socket.IO Redis adapter
- JWT
- bcrypt
- CORS
- dotenv
- nodemon for local development

Database and infrastructure:

- PostgreSQL
- PostGIS extension
- Redis
- Docker Compose
- Dockerfiles for backend and frontend

External APIs/services used by runtime code:

- OpenStreetMap tile server in public map hook and admin live map.
- CARTO basemap tiles in `PublicMap.tsx`.
- OSRM public router API in `ShuttleTracker.tsx` for route geometry fallback.
- Flaticon CDN icon URLs in `PublicMap.tsx` and `LiveMap.tsx`.

## Repository Structure

- `README.md`: root overview, quick start, Docker setup, default admin credentials, high-level architecture, and project structure.
- `agents/discovery/AGENT.md`: discovery workflow and required output for this knowledge base.
- `docker-compose.yml`: local/dev orchestration for PostGIS database, Redis, backend, and frontend.
- `env.example`: root environment template for PostgreSQL and JWT values.
- `docker/init-postgis.sh`: database initialization script enabling PostGIS extensions.
- `shuttle-tracking-backend/`: Express, Socket.IO, Prisma backend.
- `shuttle-tracking-backend/src/routes/`: Express route definitions.
- `shuttle-tracking-backend/src/controllers/`: REST API controller logic.
- `shuttle-tracking-backend/src/services/`: tracking and cache service logic.
- `shuttle-tracking-backend/src/config/`: Prisma and Redis clients.
- `shuttle-tracking-backend/src/middleware/`: JWT authentication middleware.
- `shuttle-tracking-backend/prisma/schema.prisma`: database entity definitions.
- `shuttle-tracking-backend/prisma/migrations/`: SQL migrations.
- `shuttle-tracking-backend/prisma/seed.ts`: initial admin users, routes, stops, and vehicles.
- `shuttle-tracking-web/`: Next.js frontend.
- `shuttle-tracking-web/app/`: Next.js app router pages.
- `shuttle-tracking-web/components/public/`: public tracking map UI components.
- `shuttle-tracking-web/components/admin/`: admin UI components and modals.
- `shuttle-tracking-web/services/`: Axios API clients.
- `shuttle-tracking-web/contexts/`: admin auth context.
- `shuttle-tracking-web/hooks/`: Leaflet map setup hook.
- `shuttle-tracking-web/utils/`: map and icon helpers.
- `shuttle-tracking-web/types/`: frontend TypeScript types.
- `shuttle-tracking-web/public/data/`: local route geometry JSON files for `R01` and `R02`.
- `shuttle-tracking-web/simulate.js`: socket/trip simulator.

## Architecture Summary

Frontend:

- Public root page dynamically imports `ShuttleTracker` with SSR disabled.
- Admin pages use a shared admin layout with sidebar navigation and `AuthProvider`.
- `proxy.ts` redirects unauthenticated admin requests to `/admin/login`.
- `services/api.ts` attaches `Authorization: Bearer <admin_token>` for admin API calls.
- `services/publicApi.ts` provides a plain Axios client for public API calls.

Backend:

- `server.ts` creates an Express app, HTTP server, and Socket.IO server.
- CORS allows configured `FRONTEND_URL`, `http://localhost:3000`, and `http://127.0.0.1:3000`.
- Public routes are mounted at `/api/public`.
- Admin routes for vehicles, routes, stops, and route-stops are protected by `authenticateToken`.
- Trip routes are mounted at `/api/trips`.
- Socket.IO listens for `send-location`, processes it through `handleLocationData`, and emits `location-update`.

Database:

- Prisma schema defines users, routes, vehicles, stops, route-stops, trips, GPS tracks, and feedback.
- Stops and GPS tracks store PostGIS `geography` locations.
- Migrations create PostGIS extension and relational constraints.

Cache and real-time infrastructure:

- Redis is connected at server startup.
- Socket.IO Redis adapter is attached for cross-process broadcasting.
- Public API responses are cached in Redis for 300 seconds.
- Admin mutations on route, stop, and vehicle invalidate public cache keys.
- GPS database writes are throttled with a Redis key `trip:last_saved:<tripId>` for 60 seconds.

Authentication:

- Admin login checks `users.username`, compares bcrypt password hash, and signs a JWT.
- `authenticateToken` validates Bearer tokens for protected admin routes.
- Frontend stores the admin token in `admin_token` cookie and decodes it for client state.
- Vehicle login verifies that a vehicle ID exists; no JWT is issued by this endpoint in the current repository code.

Device integration:

- Implemented ingestion path is Socket.IO `send-location`.
- The repository has a simulator for one vehicle (`VH001`).
- Mobile app, LoRaWAN, and ESP32 integrations are described in the discovery agent context but are not implemented as separate source modules in this repository.

## Data Flow Summary

### Public Tracking Data Flow

1. Browser opens `/`.
2. Next.js renders public tracking page and loads `ShuttleTracker`.
3. Frontend fetches `GET /api/public/routes/:id/stops`.
4. Backend queries `route_stops` joined with `stops`, converts PostGIS location to `lat` and `lng`, caches the result in Redis, and returns stops.
5. Frontend loads route geometry from `public/data/route-<id>.json` or calls OSRM if local geometry/cache is missing.
6. Frontend renders route line, stop markers, and selected route state on Leaflet map.

### Live GPS Data Flow

1. Device/mobile/simulator starts a trip through `POST /api/trips/start`.
2. Backend creates a `Trip` for the vehicle's assigned route and updates the vehicle status to `active`.
3. Device/mobile/simulator emits Socket.IO `send-location` with `tripId`, `vehicleId`, `lat`, `lng`, `speed`, `bearing`, `accuracy`, and `station`.
4. Backend `handleLocationData` validates required fields, normalizes moving station state to `En Route` when speed is at least 2, and applies Redis write throttling.
5. If throttle allows, backend inserts a row into `gps_tracks` with PostGIS geography location, speed, heading, station, and recorded time.
6. Backend emits Socket.IO `location-update` to connected clients.
7. Public tracker and admin live map receive `location-update` and update vehicle markers.
8. Device/mobile/simulator can end the trip through `PUT /api/trips/:id/end`.
9. Backend marks trip `completed`, sets vehicle status to `inactive`, and deletes the trip write-throttle Redis key.

### Admin Management Data Flow

1. Admin logs in through `POST /api/auth/login`.
2. Backend validates user credentials and returns JWT plus user info.
3. Frontend stores token in `admin_token` cookie.
4. Admin pages call protected endpoints with Bearer token.
5. Backend CRUD controllers update routes, stops, and vehicles in PostgreSQL.
6. Route, stop, and vehicle mutations call `invalidatePublicCache`.
7. Public API responses are refreshed on subsequent reads.

### Route Geometry Data Flow

1. Public tracker loads stops for route.
2. Frontend computes a stop signature and checks `localStorage` route cache.
3. If no valid local cache exists, frontend tries `public/data/route-<routeId>.json`.
4. If no local route data exists, frontend calls OSRM public route API using stop coordinates.
5. Frontend stores computed route geometry in `localStorage`.

## Entity Summary

- User: admin account with unique username and bcrypt password hash.
- Route: shuttle route with ID, name, color, status, created timestamp; related to vehicles, route-stops, and trips.
- Vehicle: shuttle vehicle with ID, name, type, status, optional assigned route; related to trips and GPS tracks.
- Stop: physical stop with Thai name, optional English name, PostGIS geography location, optional image URL, and status.
- RouteStop: junction table connecting routes to stops with `stopOrder`; unique per route and stop order.
- Trip: operational trip for one vehicle on one route, with start time, optional end time, and status.
- GPSTrack: time-series GPS record tied to a trip and vehicle, with PostGIS location, speed, heading, station, and recorded time.
- Feedback: user feedback record with type, message, IP address, and created time; entity exists in schema, but no route/controller usage was found in the current source files.

Relationships:

- One route can have many vehicles.
- One vehicle can optionally be assigned to one route.
- One route can have many route-stop mappings.
- One stop can appear in many route-stop mappings.
- One vehicle can have many trips.
- One route can have many trips.
- One trip can have many GPS tracks.
- One vehicle can have many GPS tracks.

## API Summary

### Authentication APIs

- `POST /api/auth/login`: admin login; accepts username and password; returns JWT and user data.
- `GET /api/auth/me`: protected admin identity lookup from JWT.
- `POST /api/auth/vehicle-login`: verifies a vehicle ID exists and returns vehicle data.

### Public APIs

- `GET /api/public/active-routes`: returns active routes; Redis cached.
- `GET /api/public/active-vehicles`: returns active vehicles with route; Redis cached.
- `GET /api/public/routes/:id/stops`: returns active stops for route with coordinates and stop order; Redis cached per route.
- `GET /api/public/stops`: returns active stops with coordinates; Redis cached.

### Admin Vehicle APIs

- `GET /api/admin/vehicles`: list vehicles with route.
- `GET /api/admin/vehicles/:id`: get one vehicle with route.
- `POST /api/admin/vehicles`: create vehicle.
- `PUT /api/admin/vehicles/:id`: update vehicle.
- `DELETE /api/admin/vehicles/:id`: delete vehicle.

### Admin Route APIs

- `GET /api/admin/routes`: list routes.
- `GET /api/admin/routes/:id`: get one route.
- `POST /api/admin/routes`: create route.
- `PUT /api/admin/routes/:id`: update route.
- `DELETE /api/admin/routes/:id`: delete route.
- `GET /api/admin/routes/:id/vehicles`: list vehicles assigned to route.

### Admin Stop APIs

- `GET /api/admin/stops`: list stops with coordinates.
- `GET /api/admin/stops/:id`: get one stop with coordinates.
- `POST /api/admin/stops`: create stop with PostGIS location.
- `PUT /api/admin/stops/:id`: update stop data and optionally location.
- `DELETE /api/admin/stops/:id`: delete stop.

### Admin Route-Stop APIs

- `GET /api/admin/route-stops`: list route-stop mappings with route and stop.
- `GET /api/admin/route-stops/:routeId`: list stops for a route.
- `POST /api/admin/route-stops`: create route-stop mapping.
- `DELETE /api/admin/route-stops/:id`: delete route-stop mapping.

### Trip APIs

- `POST /api/trips/start`: starts a trip for a vehicle's assigned route and sets vehicle status to `active`.
- `PUT /api/trips/:id/end`: completes a trip, sets vehicle status to `inactive`, and clears the trip GPS throttle key.

### WebSocket Events

- Client emits `send-location`: location payload from mobile/device/simulator.
- Server emits `location-update`: normalized location data for public/admin live maps.

### External APIs

- OSRM route API: used by public tracker to compute route geometry if local/cache route data is unavailable.
- OpenStreetMap tile endpoints: used for map tiles.
- CARTO basemap tile endpoint: used by `PublicMap.tsx`.
- Flaticon CDN URLs: used for bus/stop icons in some map components.

## External Services

- PostgreSQL: relational database.
- PostGIS: spatial extension for stop and GPS geography fields.
- Redis: public API cache, Socket.IO adapter backing store, and GPS write-throttle key storage.
- Docker Compose: local/dev orchestration for database, cache, backend, and frontend.
- OpenStreetMap: map tiles.
- CARTO: alternate basemap tiles in `PublicMap.tsx`.
- OSRM public router: route geometry fallback.
- Flaticon CDN: external map icon images in `PublicMap.tsx` and `LiveMap.tsx`.

Services mentioned in discovery context but not evidenced as configured in this repo:

- Neon
- Render
- Vercel
- TTN
- LoRaWAN network services
- ESP32 integration service

## Environment Configuration

Root `env.example` includes:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Backend `.env.example` includes:

- `DATABASE_URL`
- `REDIS_URL`
- `NODE_ENV`
- `PORT`
- `API_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`

Frontend `.env.example` includes:

- `NEXT_PUBLIC_API_BASE_URL`

Docker Compose supplies:

- Database settings for PostGIS container.
- Redis URL for backend.
- Backend `DATABASE_URL`, `REDIS_URL`, JWT settings, `API_URL`, and `FRONTEND_URL`.
- Frontend `NEXT_PUBLIC_API_BASE_URL`.

## Known Limitations From Available Evidence

These are descriptive observations only, not quality judgments:

- No separate mobile application source code is present in this repository.
- No LoRaWAN, TTN, or ESP32 source module is present in this repository.
- `Feedback` exists in the Prisma schema, but no REST route/controller for feedback was found.
- Route-stop backend APIs exist, but no frontend caller was found.
- Production deployment configuration for Vercel, Render, Neon, or TTN was not found.
- Dedicated API documentation such as OpenAPI/Swagger was not found.
- Automated test implementation was not found; backend `npm test` is a placeholder script.

## Missing Information

- Production deployment diagram: needed to understand the target production topology beyond Docker Compose local/dev orchestration.
- Production hosting targets and environment ownership: needed because services such as Vercel, Render, Neon, TTN, or similar are not configured in this repo.
- Mobile app source and API contract: needed to understand the real driver/mobile GPS sender beyond `simulate.js`.
- Device registration flow: needed because vehicle verification exists, but no full registration/provisioning process is documented or implemented in this repo.
- LoRaWAN/TTN integration design: needed because the discovery context says LoRaWAN is a GPS source, but no TTN endpoint, payload decoder, or backend adapter is present.
- ESP32 planned integration details: needed because the discovery context names ESP32 as planned, but no implementation contract is present.
- Authentication and authorization policy: needed to clarify admin roles, permissions, token lifetime expectations, and production credential handling beyond current JWT login.
- API contract documentation: needed so future audit agents can compare intended request/response shapes with implementation.
- Operational requirements: needed for uptime, GPS update frequency, data retention, cache expectations, and acceptable delay.
- User role definitions: needed because the code has admin and public flows, while the discovery context mentions multiple future audit agents and device sources.
- Feedback workflow requirements: needed because `Feedback` exists in the schema but has no visible API/UI flow.

## Assumptions

No unsupported assumptions are used as facts in this document.

Where wording such as "driver/mobile/device sender" is used, it is a label for repository evidence from `POST /api/trips/start`, `POST /api/auth/vehicle-login`, Socket.IO `send-location`, and `simulate.js`; the actual mobile application is not included in this repository.

## Audit Readiness

Ready for Product Audit Agent.

Reason: the repository's current MVP behavior, entities, APIs, data flows, technology stack, and known missing information have been documented from available evidence. Product audit can proceed using this knowledge base, while the missing information section should be treated as open questions for deeper production-readiness audits.

## Project Knowledge Base

### Business Domain

University tram/shuttle tracking with real-time public map visibility and admin operational management.

### Users

- Public users viewing shuttle locations and stops.
- Admin users managing operational data.
- Vehicle/device senders producing GPS updates.

### User Roles

- Public User
- Admin
- Driver/Mobile App/Device Sender

No separate Super Admin role is evidenced in the repository.

### Features

- Public live map.
- Route selection.
- Stop markers and stop cards.
- Vehicle markers and vehicle cards.
- ETA calculation.
- Nearest stop lookup.
- Browser geolocation display.
- Admin login/logout.
- Admin dashboard with live map and stats.
- Admin vehicle CRUD.
- Admin route CRUD.
- Admin stop CRUD.
- Backend route-stop CRUD.
- Vehicle verification.
- Trip start/end.
- Socket GPS ingestion and broadcast.
- GPS track persistence with PostGIS.
- Public API caching.

### Technology Stack

Next.js, React, TypeScript, Leaflet, Turf, Socket.IO client, Axios, Tailwind CSS, Express, Socket.IO, Prisma, PostgreSQL, PostGIS, Redis, JWT, bcrypt, Docker Compose.

### Repository Structure

The repository is split into a root orchestration layer, `shuttle-tracking-backend`, and `shuttle-tracking-web`. Backend contains API, WebSocket, Prisma schema, migrations, and seed data. Frontend contains public tracking UI, admin UI, API clients, auth context, map utilities, and public route data.

### Architecture

Client-server web architecture with REST APIs for CRUD and trip lifecycle, Socket.IO for live GPS updates, PostgreSQL/PostGIS for durable data, and Redis for caching, throttling, and Socket.IO adapter support.

### Data Flow

Primary flows are public route/stop read flow, live GPS ingestion and broadcast flow, admin management flow, and frontend route geometry loading flow.

### Business Entities

User, Route, Vehicle, Stop, RouteStop, Trip, GPSTrack, Feedback.

### APIs

REST APIs are grouped into auth, public, admin vehicles, admin routes, admin stops, admin route-stops, and trips. WebSocket events are `send-location` and `location-update`.

### External Services

PostgreSQL/PostGIS, Redis, OpenStreetMap tiles, CARTO tiles, OSRM public router, Flaticon CDN, Docker Compose local/dev runtime.

### Known Limitations

See "Known Limitations From Available Evidence" and "Missing Information".

### Open Questions

- What is the intended production deployment topology?
- Which hosting/database/cache providers will be used in production?
- Where is the mobile app source and formal API contract?
- How will LoRaWAN, TTN, and ESP32 data enter the backend?
- What are the intended roles and permissions beyond admin/public?
- What are the target GPS update rates and retention policies?
- Is feedback intended to be user-facing in the MVP?
- Should route-stop management have an admin UI, or is API-only intended for now?

## Handoff Recommendation

Next recommended agent: Product Audit Agent.
