# Tram Tracking System Project Knowledge Base

Audit metadata:
- Evidence baseline: `cdedcc2fd82ab264e2176716ac23a74c948e1a28`
- Evidence scope: `README.md`, `AGENTS.md`, Compose/environment configuration and scripts,
  `shuttle-tracking-backend/`, `shuttle-tracking-web/`, `docs/testing/`, `docs/research/`,
  `docs/tasks/`, `docs/operations/`, `docs/decision-queue.md`, and `docs/audits/specialized/`
- Reviewed at: `2026-08-07T19:35:48+07:00`
- Validation state: `Validated`
- Predecessor baselines: `None` (Discovery has no required predecessor)

Evidence status: **Validated**. This Discovery re-audit consumes the completed T9 repository
handoff and re-baselines the current source, configuration, tests, task contract, and operations
runbook. T9 remains only partially complete because the external University Server/Network
acceptance evidence is unavailable. Use `docs/audits/README.md` as the coordination authority.

## T9 Implementation Re-audit — 2026-08-07

The preceding validated Discovery baseline was
`82f4d97d8609d73f79aa74eea6efaadaa34238d9`. T9 changed evidence that this profile consumes:

| Changed evidence | Discovery effect |
|---|---|
| `docker-compose.prod.yml`, `env.production.example`, `scripts/test-production-topology.mjs`, `scripts/ci-checks.sh` | Adds the static university production template, private data network, loopback-only app bindings, Redis authentication, versioned images, health ordering, and deterministic topology evidence. |
| `shuttle-tracking-backend/src/config/runtime.ts`, `validate-runtime.ts`, `prisma.ts`, `redis.ts`, `server.ts`, `middleware/rate-limit.ts`, `docker-entrypoint.sh`, backend tests/package/README | Adds one fail-closed runtime authority for production URLs, secrets, CORS origin, proxy trust, client address, and port; validation runs before migration. |
| `shuttle-tracking-web/config/backend.ts` and the changed REST/Socket consumers, `next.config.ts`, tests/package | Adds one browser connection authority: production defaults REST to `/api` and Socket.IO to the current origin; explicit production overrides must be one safe HTTPS origin. |
| `docs/tasks/T9-production-topology-origin-handoff.md`, `docs/operations/university-server-network-handoff.md`, D-008 specialist/decision evidence | Records the exact repository handoff and the external host, DNS/TLS, secrets, restore, alert, contact, proxy-chain, and capacity evidence that remains unavailable. |

Exact changed paths within Discovery scope:

- Runtime/topology: `docker-compose.prod.yml`, `env.production.example`,
  `scripts/ci-checks.sh`, and `scripts/test-production-topology.mjs`.
- Backend: `shuttle-tracking-backend/README.md`,
  `shuttle-tracking-backend/docker-entrypoint.sh`, `shuttle-tracking-backend/package.json`,
  `shuttle-tracking-backend/src/config/prisma.ts`,
  `shuttle-tracking-backend/src/config/redis.ts`,
  `shuttle-tracking-backend/src/config/runtime.ts`,
  `shuttle-tracking-backend/src/config/validate-runtime.ts`,
  `shuttle-tracking-backend/src/middleware/rate-limit.ts`,
  `shuttle-tracking-backend/src/server.ts`, and
  `shuttle-tracking-backend/tests/test_t9_runtime_config.js`.
- Frontend: `shuttle-tracking-web/components/admin/LiveMap.tsx`,
  `shuttle-tracking-web/components/public/FeedbackModal.tsx`,
  `shuttle-tracking-web/config/backend.ts`, `shuttle-tracking-web/hooks/useShuttleTracker.ts`,
  `shuttle-tracking-web/hooks/useSocketConnection.ts`, `shuttle-tracking-web/next.config.ts`,
  `shuttle-tracking-web/package.json`, `shuttle-tracking-web/services/api.ts`,
  `shuttle-tracking-web/services/publicApi.ts`, and
  `shuttle-tracking-web/tests/t9-backend-origin.test.ts`.
- Handoff/decision evidence: `docs/tasks/T9-production-topology-origin-handoff.md`,
  `docs/operations/university-server-network-handoff.md`,
  `docs/audits/specialized/D-008-observability-production-topology-handoff-v2.md`, and
  `docs/decision-queue.md`.

Focused revalidation passed at the current baseline: backend `npm run check` (build, boundary tests,
T9 runtime checks, and Prisma validation), frontend `npm run test:t9` (5/5), and
`node scripts/test-production-topology.mjs`. These are deterministic repository checks; no Compose
stack, migration, seed, deployment, proxy, certificate, backup/restore, alert, provider, device,
field, load, or human-browser target was operated.

## D-008 Decision Re-audit — 2026-08-07

D-008 now selects a university-managed single-host, single-origin production handoff at the
preferred `https://tram-tracking.rsu.ac.th`, subject to university DNS approval. The application
team owns versioned artifacts, environment schema, migrations and runbook; the University
Server/Network Team owns host/network/firewall, DNS/TLS, deployed secrets, off-host backup/restore,
logs/alerts and incident response. Vercel/Render/Neon and AWS learning deployments are isolated
non-production profiles. This is an approved logical topology and responsibility boundary, not
evidence of an actual host, port policy, certificate, backup, alert, restore, or 10,000-viewer
capacity result. Those facts remain external acceptance evidence for T9/T13.

The T9 repository implementation described above now realizes the checked-in topology and
configuration portion of that decision. It does not change the external-evidence limitation.

Discovery refresh: 2026-07-22

## T7 Re-audit Addendum — 2026-07-29

The inventory was revalidated from `847a18c...` through `d94abb3...`. T7 adds an additive
Postgres/PostGIS research schema, session-scoped raw-observation capture, metric/lifecycle services,
and authenticated research-read/export routes. Mobile Socket.IO, ESP32+GPS over Wi-Fi/HTTP, and the
separate LoRaWAN/Gateway/TTN/Webhook path remain distinct source boundaries; the implemented first
campaign fixtures cover mobile and LoRaWAN and do not evidence physical-device or provider behavior.
Raw diagnostics are separate from T6 canonical state and public DTOs. The previous finding that raw
observations were absent is **Resolved** for D-002=B's bounded research scope; production topology,
physical senders, TTN console state, and ground-truth accuracy remain **Unable to Verify**. CI evidence
was rerun from the repository; the earlier findings about unavailable external runtime evidence remain
**Still Present**.

## T8 Re-audit Addendum — 2026-08-01

The inventory was revalidated from `d94abb3...` through `671b712...`. T8 changes only the public
canonical-state projection and its deterministic/isolated Playwright evidence: an expired `live`
state is projected locally as non-live for the Marker, active-count, and ETA; stale/no-service/unknown
states do not display a Marker; and selecting another route cannot restore an expired Marker until a
newer authoritative `live` state arrives. The public REST hydration and Socket.IO event remain the
same canonical contract. The Playwright local server is a synthetic test fixture, not a production
service or physical-device result.

D-001=C, D-005=B, D-007, and D-008 now constrain downstream work: C requires operational
capabilities before a public-service claim, timeout is a separate 10-minute receipt-time lifecycle
rule, administrative authority is intended to be `DEV` > `SUPER_ADMIN` > `ADMIN`, and production
uses the approved university handoff boundary above. These are decision facts, not implementation
or external operations evidence for the missing C-scope surfaces.

## T10 / D-009 Re-audit Addendum — 2026-08-01

The inventory was revalidated through committed baseline `6697acbd62c740039722769588b1c464231e5ce1`
and the current owner-decision working copy. T10 adds a bounded authenticated admin replacement
command for a route's full stop list, active-stop membership validation, contiguous server-assigned
ordering, an atomic Prisma replacement transaction, and post-success public-cache invalidation.
Legacy create/delete route-stop mutations now invoke that invalidator too. The Admin Routes page now
has a route-stop modal for loading, adding, removing, reordering, and publishing the full sequence.
The deterministic replacement test and repository CI are source/test evidence; no database mutation,
ambient browser session, deployment, provider, or hardware result is implied.

D-009 records anonymous one-way feedback with a `SUPER_ADMIN` business-day triage owner, 180-day
feedback/case retention, 30-day rate-limit-only IP retention, protected soft deletion/restore, and
read-only safe source/device fields. At this historical decision-only baseline it did not create an
inbox, privacy notice, retention job, server RBAC, or role hierarchy; T12 subsequently implemented
those bounded repository surfaces. Android locked-screen functionality remains external and the
required versioned Android acceptance artifact is unavailable in this repository.

This document describes the current repository state from source code, configuration, schema,
migrations, seed data, tests, and repository documentation. It is the Level 1 Discovery profile
output and does not make owner-controlled product, retention, deployment, or hardware decisions.

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
- A transactional Operations/Trip service for explicit start, virtual-trip creation, active-trip
  validation, idempotent end, and sampled canonical-history writes; the database also validates trip
  status/time relationships.
- Persisted `ADMIN`, `SUPER_ADMIN`, and `DEV` roles, current-role revalidation, bounded fresh
  authentication, a Super Admin/Dev feedback inbox, and an all-admin safe read-only source-health
  page.
- Bounded research-session/raw-observation/aggregate/lifecycle records and authenticated research
  reads/exports, separate from public and canonical operational DTOs.
- Docker Compose development configuration plus a checked-in T9 production handoff with private
  data services, authenticated Redis, loopback-only application ports, health ordering, and one
  fail-closed runtime/origin configuration authority.

The repository directly evidences these user groups:

- Public users who view routes, stops, vehicles, ETA, location, and submit feedback.
- Admin users with persisted `ADMIN`, `SUPER_ADMIN`, or `DEV` roles. The frontend exposes vehicle,
  route, stop, route-stop, read-only source-health, and role-gated feedback-triage surfaces; the
  backend also retains tracking-source management and research-read boundaries.
- External senders such as mobile applications, ESP32 devices, and simulators that authenticate and
  submit location observations.
- TTN/LoRaWAN webhook senders that submit location payloads through the server-side webhook route.

The declared project stage is MVP. The Level 1 contract in
`agents/level-1-audit/AGENT.md` targets evidence-based progression toward a
production-ready system. A complete mobile application, ESP32 firmware, and deployed TTN provider
configuration are not present in this repository.

## Freshness and Validation Summary

The preceding baseline was `82f4d97...`; the current baseline is `cdedcc2...`. The exact changed
Discovery evidence is recorded in the T9 table above. Source/configuration changes affect the
runtime topology, startup, REST/Socket origin resolution, public Feedback submission, public and
admin live connections, and documented operations handoff, so the inventory required revalidation.
Coordination-document changes alone were not treated as proof of application behavior.

Current focused validation passed: backend check including Prisma validation and the full boundary
suite, frontend T9 connection tests (5/5), and the static production-topology test. No external or
stateful target was touched; previously recorded T5/T7/T8 stateful or browser evidence was not
silently promoted to current production evidence.

### Prior-finding revalidation

| Prior material finding | State | Current evidence |
|---|---|---|
| Discovery metadata and baseline were incomplete | **Resolved** | This report now records the full baseline, scope, reviewed time, validation state, and predecessor baseline. |
| Trip lifecycle had competing non-transactional writers | **Resolved** | `shuttle-tracking-backend/src/services/operations.service.ts`, the T5 migration, and `test_t5_operations.js` define one transactional/idempotent boundary; live integration was not rerun here. |
| Simulator and seed source fixtures diverged | **Resolved** | `env.example`, `prisma/seed.js`, `shuttle-tracking-web/simulate.js`, `shuttle-tracking-backend/simulate-ttn.js`, and `docs/testing/pipeline-smoke-tests.md` use aligned source/vehicle mappings. |
| Raw observations, event-time ordering, and high-fidelity history are absent | **Partially Resolved** | T7 records bounded research raw observations separately from sampled canonical `gps_tracks`; it does not add event-time/sequence semantics or general high-fidelity operational history. |
| Public/admin stale or offline truth is not exposed as a user-facing contract | **Partially Resolved** | T8 keeps public Marker/count/ETA truthful after local expiry and route changes; T12 adds a safe read-only admin source-health API/page. Public service-state explanation and complete daily-operations freshness/recovery journeys remain incomplete. |
| Physical sender, firmware, TTN deployment, and production topology are unavailable | **Partially Resolved** | D-008 plus T9 now define and statically validate the repository topology/configuration/runbook. Physical sources and actual host/network/DNS/TLS/proxy/recovery/alert/capacity evidence remain unavailable. |
| Production configuration and frontend backend-origin behavior were duplicated or permissive | **Resolved** | T9 supplies one fail-closed backend runtime parser and one frontend REST/Socket connection resolver; focused backend, frontend, and topology tests pass at `cdedcc2...`. External proxy/deployment behavior remains outside this repository finding. |

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
- Route selection from active routes returned by the public API; the development seed exposes
  `R01` and `R02` while `R03` is inactive.
- Route stop loading from `GET /api/public/routes/:id/stops`.
- Local route geometry files for `R01` and `R02`.
- OSRM route geometry fallback when local route data or local cache is unavailable.
- Live vehicle marker updates from Socket.IO `location-update`.
- Vehicle movement animation and route-position calculations using Turf helpers.
- Canonical-state projected active vehicle count; local expiry removes a `live` Marker/count/ETA
  until a newer canonical `live` state arrives.
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
- Backend route-stop list/create/delete API plus authenticated full-sequence replacement. The Admin
  Routes page exposes a route-stop management modal.
- Read-only Source Health page for all three admin roles; the safe DTO excludes credentials,
  payloads, locations, and IP data, and the UI exposes no source mutation action.
- Feedback Inbox for `SUPER_ADMIN` and `DEV`, including bounded status transitions, internal notes,
  recent-authentication-protected soft deletion, and recoverable restore.
- Backend tracking-source/device CRUD and source-selection analytics APIs remain separate from the
  read-only Source Health UI. General source lifecycle authority is still gated by D-012.

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
- `shuttle-tracking-backend/tests/test_pipeline.js` for an end-to-end sender, TTN, and source-priority
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
- `shuttle-tracking-backend/tests/test_auth_boundary.js`: sender JWT and claim boundary checks.
- `shuttle-tracking-backend/tests/test_socket_boundary.js`: unauthenticated Socket.IO sender-write check.
- `shuttle-tracking-backend/tests/test_pipeline.js`: manual integration pipeline test for sender and TTN
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

The current frontend has admin pages for dashboard, vehicles, routes, stops, safe read-only source
health, and role-gated feedback triage. Route-stop management is embedded in the Routes page. It
does not contain trip-history, playback, reporting, or tracking-source mutation pages.

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
- `/api/admin/feedback`: `SUPER_ADMIN`-minimum feedback inbox, lifecycle, protected delete, and
  restore operations.
- `/api/research`: `DEV`/`SUPER_ADMIN` research-session observation reads and CSV export.
- `/api/public`: public route, vehicle, stop, and feedback endpoints.
- `/api/trips`: sender-authenticated trip lifecycle.
- `/api/ingest`: sender-authenticated HTTP and secret-authenticated TTN ingestion.

Admin JWT middleware accepts admin claims, rejects sender-kind tokens, reloads the current user and
persisted role, accepts only `ADMIN`, `SUPER_ADMIN`, or `DEV`, and applies minimum-role/fresh-auth
gates where required. Sender JWT middleware verifies token type, source ID, vehicle ID, source
status, source type, and credential version against the database. Sender tokens default to a
15-minute lifetime through `SENDER_JWT_EXPIRES_IN`.

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
   the transactional Operations/Trip service to create a virtual trip for a routed vehicle when no
   active trip is found.
3. The source sends an observation through `/api/ingest/http` or Socket.IO `send-location`.
4. The backend validates source ownership, coordinates, and optional trip ownership.
5. The pipeline records the latest source snapshot in Redis and evaluates other active sources for
   the same vehicle.
6. The highest-priority fresh source becomes the canonical vehicle location.
7. The backend stores that canonical location in Redis and may sample it into `gps_tracks`.
8. The ingestion boundary emits `location-update` to all connected Socket.IO clients.
9. The public tracker accepts newer canonical states, projects local expiry consistently across
   Marker/count/ETA, and displays a Marker only for an unexpired authoritative `live` state on the
   selected route; the admin live map consumes the same event independently.
10. A sender can end the trip through `/api/trips/:id/end`; the Operations/Trip transaction marks
    the trip completed and vehicle inactive, while the controller clears the Redis sampling keys.

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
6. Route, stop, vehicle, and route-stop mutations call public cache invalidation after success;
   route-stop replacement is transactional and assigns contiguous server-side ordering. Device
   mutations are handled through the device controller.
7. All admin roles can load the safe read-only source-health view; `SUPER_ADMIN` and `DEV` can load
   and triage feedback. Delete/restore requires a fresh signed authentication claim.

### Feedback Flow

1. The public tracker opens `FeedbackModal` and loads active vehicles.
2. The user selects a feedback type and vehicle, then submits a message.
3. The frontend posts `type`, `vehicleId`, and `message` to `/api/public/feedback`.
4. The backend validates the fields, verifies the vehicle exists, uses `req.ip` only for the
   rate-limit boundary, and creates an anonymous `Feedback` row without persisting the request IP.
5. The public client shows the approved anonymous/no-reply/non-emergency/business-day and retention
   notice plus success/error states.
6. `SUPER_ADMIN` and `DEV` can use the Feedback Inbox to assign/update cases, record bounded notes,
   soft-delete with a reason, and restore within the recovery window; audit events and retention
   services remain server-owned.

### Startup And Deployment Flow

1. Docker starts PostGIS and authenticated Redis with health checks on a private production data
   network; application ports are bound to host loopback for the external reverse proxy.
2. The backend entrypoint validates production database/Redis URLs, secrets, exact frontend origin,
   proxy trust, and port without echoing configured values.
3. Only after validation does the entrypoint run `prisma migrate deploy` and start the backend,
   which attaches the Socket.IO Redis adapter.
4. Development containers run `prisma db seed`; non-development containers skip the seed.
5. The frontend waits for backend readiness and uses one same-origin REST/Socket authority by
   default in production.
6. The checked-in production flow is a static repository handoff only; the actual reverse proxy,
   DNS/TLS, secrets, migration target, restore, alerts, restart, and capacity evidence remain
   external.

## Entity Summary

### User

Administrative account with unique username, bcrypt password hash, and persisted role. The server
accepts only `ADMIN`, `SUPER_ADMIN`, and `DEV`, ordered hierarchically, reloads the current user on
administrative requests, and uses a signed `authTime` claim for recent-authentication gates. General
account provisioning/promotion/demotion/removal and out-of-band `DEV` recovery remain outside the
implemented bounded role contract.

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
GPS tracks. Current code uses `in_progress` and `completed` statuses; SQL checks enforce the
status/end-time relationship and the Operations/Trip service serializes lifecycle writes per vehicle.

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

Anonymous public feedback/case record with type, optional vehicle association, message, status,
assignment/timestamps, bounded internal note, soft-deletion/restore metadata, and creation time. The
vehicle and responsible-user relations use safe `SET NULL` behavior where defined. Public creation
does not persist request IP; case mutations create separate `FeedbackAuditEvent` records.

### ResearchSession, ResearchRawObservation, ResearchMetricAggregate, ResearchLifecycleRun

T7 research records keep approved experiment/session metadata, append-only raw observations with
provenance/timing/selection fields, typed aggregate outputs, and lifecycle/backup verification runs
separate from canonical operational state. Access is restricted to `DEV` and `SUPER_ADMIN`; the
repository evidence does not upgrade simulator data into physical or ground-truth evidence.

### Relationships

- One route can have many vehicles, route-stop mappings, and trips.
- One vehicle can optionally belong to one assigned route.
- One stop can appear in many route-stop mappings.
- One vehicle can have many trips, GPS tracks, feedback records, and tracking sources.
- One trip belongs to one vehicle and one route and has many GPS tracks.
- One GPS track may reference the selected tracking source.
- One tracking source can be assigned to at most one vehicle and can have many GPS tracks.
- One feedback record may reference one vehicle, one assigned admin, and one deleting admin, with
  separate immutable audit events.
- One research session has many raw observations, aggregate records, and lifecycle runs.

## API Summary

All paths below are relative to the backend host, with REST routes under `/api` unless noted.

### Health

- `GET /health`: process-level health response with status and timestamp.
- `GET /ready`: checks PostgreSQL with `SELECT 1` and Redis with `PING`; returns ready or 503.

### Authentication

- `POST /api/auth/login`: admin username/password login; returns admin JWT and user identity.
- `GET /api/auth/me`: admin JWT-protected current-user lookup.
- `POST /api/auth/reauthenticate`: verifies the current admin password and refreshes the signed
  recent-authentication claim used by sensitive feedback actions.
- `POST /api/auth/vehicle-login`: source ID, secret, and optional vehicle ID validation; returns a
  short-lived sender JWT for active non-LoRaWAN sources.

### Public REST

- `GET /api/public/active-routes`: active routes, cached in Redis.
- `GET /api/public/active-vehicles`: active vehicles with route and current canonical location
  snapshot from Redis.
- `GET /api/public/routes/:id/stops`: active stops for the requested route with coordinates and stop
  order, cached per route; the handler does not independently verify that the route itself is active.
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
- `PUT /api/admin/route-stops/:routeId` (replace the complete ordered stop list)
- `DELETE /api/admin/route-stops/:id`

### Admin Device / Tracking-Source REST

- `GET /api/admin/devices`
- `GET /api/admin/devices/:id`
- `POST /api/admin/devices`
- `PUT /api/admin/devices/:id`
- `DELETE /api/admin/devices/:id`
- `GET /api/admin/devices/analytics`
- `GET /api/admin/devices/health`

The CRUD endpoints operate on `TrackingSource`. The analytics endpoint returns Redis source
selection counters grouped by vehicle. The separate health endpoint returns an allowlisted DTO and
backs the read-only Admin Source Health page; the page does not expose CRUD or credential actions.

### Admin Feedback REST

- `GET /api/admin/feedback`
- `GET /api/admin/feedback/deleted`
- `PATCH /api/admin/feedback/:id`
- `POST /api/admin/feedback/:id/delete`
- `POST /api/admin/feedback/:id/restore`

The group requires at least `SUPER_ADMIN`; delete and restore also require recent
re-authentication. `DEV` inherits the same bounded actions through the approved hierarchy.

### Research REST

- `GET /api/research/sessions`
- `GET /api/research/sessions/:sessionId/observations`
- `GET /api/research/sessions/:sessionId/export.csv`

These read/export routes require `DEV` or `SUPER_ADMIN` and preserve the T7 safe-field/export
contract; no public research API is mounted.

### Sender Trip REST

- `POST /api/trips/start`: sender-authenticated start for the sender-bound vehicle; requires an
  assigned route and sets vehicle status to active.
- `PUT /api/trips/:id/end`: sender-authenticated completion for a trip belonging to the sender's
  vehicle; the transaction sets the trip completed and vehicle inactive, then the controller clears
  the Redis sampling keys.

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

No Vercel, Render, Neon, or other cloud-provider configuration was found. D-008 permits them only as
isolated demo/learning profiles and selects a university-managed single-host production handoff.
T9 aligns `docker-compose.prod.yml`, `env.production.example`, backend/frontend configuration, and
the operations runbook to that repository-side contract. No actual host, approved DNS/TLS, proxy
chain, firewall, secret store, backup/restore result, monitoring/alert result, named contacts, or
operations acceptance is documented.

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

`shuttle-tracking-web/.env.example` documents the legacy development
`NEXT_PUBLIC_API_BASE_URL`. The central resolver accepts `NEXT_PUBLIC_BACKEND_ORIGIN`, legacy
`NEXT_PUBLIC_BACKEND_URL`, and legacy `NEXT_PUBLIC_API_BASE_URL`, requires them to agree, and routes
all listed REST/Socket consumers through one authority. Production with no override uses relative
`/api` and current-origin Socket.IO; an explicit production override must be one non-local HTTPS
origin. `NEXT_PUBLIC_SOCKET_URL` is no longer an independent configuration path.

### Production Handoff Variables

`env.production.example` requires one immutable `APP_VERSION`, PostgreSQL identity and authenticated
`DATABASE_URL`, `REDIS_PASSWORD`, distinct JWT/TTN secrets, exact `FRONTEND_URL`, and narrow
`TRUST_PROXY`. It contains placeholders only and is a schema for an external mode-`0600` secret file,
not a deployable environment.

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
- The backend production entrypoint validates environment mode, authenticated/non-local
  PostgreSQL/Redis URLs, Redis password, distinct JWT/TTN secrets, exact HTTPS frontend origin,
  narrow proxy addresses/CIDRs, and port before migrations. Errors name only the variable and safe
  reason; non-development startup skips seed.
- `docker-compose.prod.yml` requires one version for both application images, keeps PostgreSQL and
  Redis off host ports, authenticates Redis, binds application ports to `127.0.0.1`, and orders
  startup through database/Redis/backend/frontend health checks.

## Known Limitations From Available Evidence

These are repository-state descriptions, not quality or security findings.

- No separate mobile app source is present; mobile behavior is represented by sender APIs and
  simulators.
- No ESP32 firmware or device-side protocol implementation is present.
- No live TTN provider configuration, MQTT consumer, or external LoRaWAN deployment is present.
- Tracking-source CRUD and analytics remain backend-only; the admin frontend intentionally exposes
  only the safe read-only source-health view. General lifecycle authority remains pending D-012.
- Route-stop management is implemented in the Admin Routes modal, but no ambient browser/database
  acceptance was run in this re-audit.
- Feedback triage is implemented for `SUPER_ADMIN`/`DEV`, but runtime migration, retention sweep,
  and human workflow acceptance remain unverified.
- The operational pipeline retains only the latest observation per source in Redis. T7 adds bounded
  research raw observations with separate lifecycle/metrics APIs; it does not establish event-time,
  sequence, rejection, or high-fidelity operational-history semantics.
- `GPSTrack` persistence is sampled canonical history at a 60-second Redis throttle, not a complete
  record of every input event.
- The current canonical observation timestamp is generated when the backend receives/processes the
  observation; no incoming event-time or sequence field is handled by the current observation
  interface.
- Source freshness is represented by a 30-second helper/classifier and selection check. The backend
  emits redacted stale/recovery signals and exposes a safe read-only admin health API/page; complete
  public service-state explanation, notification, and recovery operations are still absent.
- Route-stop replacement validates active membership and invalidates public route-stop cache after
  a successful transaction. The existing create/delete writes now use the same invalidator; no
  stateful cache/DB runtime smoke was run for this source-level evidence.
- No trip-history, playback, reporting, notification, or alert route/page was found.
- No OpenAPI/Swagger contract was found.
- Test artifacts exist for sender claims, Socket.IO boundary, and an integration pipeline; the
  integration pipeline requires running infrastructure and configured secrets. T8 adds a native
  frontend canonical-state test and isolated Playwright route-switch/expiry coverage. T9 adds
  deterministic backend runtime, frontend origin, and static production-topology checks; none is
  external deployment evidence.
- The root README still documents `admin`/`transport` with `admin123`, while the current seed code
  requires `SEED_ADMIN_PASSWORD` and has no built-in password. The intended credential setup needs
  confirmation.
- The current checked-in TTN simulator and smoke documentation use the seeded LoRaWAN IDs
  `sensor-c4` and `sensor-f2`; any deployed TTN registry still requires external verification.

## Missing Information

The following information is not available in the repository and is required for later audits to
fully compare intended behavior with implementation:

- University Server/Network acceptance with named primary/backup contacts and actual host, resource,
  public-IP/NAT, administrator-network, firewall, DNS/TLS and process-scaling facts.
- Actual production secret store, PostgreSQL/Redis placement, off-host backup/restore destination,
  log/metric destination, alert delivery and incident evidence under the approved D-008 owners.
- The source repository and API contract for the real mobile/driver application.
- Mobile offline, retry, authentication renewal, trip lifecycle, and background-location behavior.
- ESP32 hardware, firmware, transport, payload, provisioning, and credential rotation contract.
- TTN application/device registry, device IDs, webhook configuration, payload decoder ownership,
  and whether the intended integration is webhook-only or also MQTT/history based.
- The complete D-012 tracking-source/account lifecycle matrix: general provisioning, assignment,
  promotion/demotion, disable/removal, credential rotation, re-authentication, audit, and recovery
  authority outside T11/T12's bounded decisions.
- Account provisioning UI, promotion/demotion/removal, and out-of-band `DEV` allowlist/recovery
  implementation beyond the current persisted hierarchy.
- GPS event-time semantics, expected update interval, clock synchronization, canonical-history
  retention, raw-source retention, and archival/deletion ownership.
- Runtime/human acceptance for the implemented public expiry behavior and safe admin source-health
  view, plus the still-missing complete public service-state and operator recovery journeys.
- Runtime/human acceptance for the approved and implemented bounded feedback triage, retention,
  privacy, deletion, restore, and audit behavior.
- Intended trip history, playback, reports, notifications, alerts, and announcements scope.
- Formal REST and WebSocket request/response contract, including error semantics and versioning.
- Confirmation of the credential setup documented in the root README versus the current seed flow.
- Confirmation that deployed TTN device identifiers match the checked-in `sensor-c4` and `sensor-f2`
  mappings.

## Actionable Recommendations

- Run the Product profile next. Discovery is the only profile without a predecessor; Product must
  consume this `cdedcc2...` baseline before Architecture and the later domain profiles can be
  revalidated for T9.
- Revalidate Architecture, Backend, and Database against the T5 Operations/Trip boundary before
  treating lifecycle integrity as a release capability; this Discovery report does not replace their
  domain findings or live integration evidence.
- Keep the three research boundaries separate in all later work: Mobile/Socket.IO, ESP32+GPS/Wi-Fi/
  HTTP, and independent LoRaWAN/Gateway/TTN/Webhook. Simulators remain test tools, not physical
  evidence.
- Preserve the approved raw-observation, stale/lifecycle, role, feedback, and D-008 boundaries;
  revalidate their implemented slices without treating pending D-011/D-012 or external University
  Server/Network acceptance as resolved by source code.

## Roadmap Impact

- Discovery is validated and unblocks the Product profile; no later profile may consume the prior
  legacy Discovery snapshot.
- T5 lifecycle facts are now part of the current baseline. Downstream audits must revalidate the
  transaction, partial active-trip index, status/time constraints, idempotent start/end behavior,
  and virtual-trip policy before confirming or closing related findings.
- Approved decisions D-001 through D-010 remain applicable. T9 is **Partially Complete** for its
  repository handoff at `cdedcc2...`; it still blocks T13/public release on external University
  Server/Network acceptance and does not establish production readiness.

## Proposed Owner Decisions

No new owner decision is proposed by Discovery. Existing decisions on C-scope release, bounded raw
diagnostics, topology/origin order, three-device research, timeout, role direction, and the D-008
production handoff should be carried forward. The unresolved parameters in “Missing Information”
are external or downstream implementation evidence where they are not covered by an approved
decision.

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

## Confidence

- **High** for repository-visible source, schema, route/page inventory, checked-in T9 topology and
  configuration contracts, and the focused checks run at `cdedcc2...`.
- **High** for downstream audit/roadmap mapping because every successor profile consumed this
  predecessor baseline in the same Level 1 sequence.
- **Low** for actual deployment, proxy behavior, DNS/TLS, production secrets, backup/restore,
  alerts, capacity, physical devices/providers, Android behavior, field research, and human workflow
  outcomes because no approved external target was operated.

## Audit Readiness

Validated at `cdedcc2...`; every successor audit and the Roadmap has now consumed this baseline.
The completed gate audit found no currently eligible implementation unit.

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
- `ADMIN`, `SUPER_ADMIN`, and `DEV` administrative users with persisted hierarchical authority.
- Sender/device identity bound to a tracking source and vehicle.

The current code implements the D-007 `DEV` > `SUPER_ADMIN` > `ADMIN` hierarchy for the bounded T12
surfaces and revalidates the persisted current role on admin requests. It does not implement separate
driver accounts or the complete D-012 account/source lifecycle and out-of-band `DEV` controls.

### Features

- Public live map, route selection, stops, vehicles, ETA, geolocation, nearest stop, and feedback.
- Admin login/re-authentication, dashboard, live map, vehicle CRUD, route CRUD, stop CRUD,
  route-stop management, safe source health, and role-gated feedback triage.
- Backend route-stop and tracking-source/device CRUD plus safe device-health and research-read APIs.
- Sender JWT authentication and credential-version validation.
- Authenticated trip start/end.
- HTTP and Socket.IO location ingestion.
- TTN webhook ingestion and simulator.
- Source priority and freshness-based canonical location selection.
- Redis current-location/cache/throttle/analytics behavior.
- Sampled PostGIS GPS history.
- Bounded T7 research observations/aggregates/lifecycle evidence and protected export.
- T9 fail-closed production runtime/origin configuration and university handoff runbook.
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

User, Route, Vehicle, Stop, RouteStop, Trip, GPSTrack, TrackingSource, Feedback,
FeedbackAuditEvent, ResearchSession, ResearchRawObservation, ResearchMetricAggregate, and
ResearchLifecycleRun.

### APIs

REST groups are health, auth/re-authentication, public, admin vehicle/route/stop/route-stop/device,
admin feedback, protected research reads/export, trip lifecycle, HTTP ingestion, and TTN ingestion.
Socket.IO events are `send-location`, `location-update`, and `error-response`.

### External Services

PostgreSQL/PostGIS, Redis, Docker Compose, OpenStreetMap, CARTO, OSRM, Flaticon CDN, and the
repository-defined TTN webhook boundary. No cloud hosting provider or live TTN deployment is
configured in the repository.

### Known Limitations

See “Known Limitations From Available Evidence” and “Missing Information”.

### Open Questions

- Has the University Server/Network Team named contacts and accepted the actual host, TLS, firewall,
  secret, backup, monitoring, alert, recovery, and capacity checklist under D-008?
- Where is the real mobile/driver app and its formal contract?
- What are the ESP32 and TTN device provisioning and payload contracts?
- Which source IDs are authoritative for LoRaWAN fixtures and deployed devices?
- How will approved D-007 account provisioning, promotion/demotion, privileged deletion,
  re-authentication/audit, backup/restore, and out-of-band `DEV` recovery be controlled?
- What are the GPS event-time, update-rate, retention, and stale-state policies?
- Has the approved T7 research protocol and bounded raw-observation lifecycle been exercised with
  physical Mobile, ESP32, and LoRaWAN sources without promoting simulator/proxy metrics to
  ground-truth evidence?
- Has bounded feedback triage/retention/deletion behavior passed migration, runtime, retention-sweep,
  and human acceptance on an approved target?
- Which D-011 UX slice should be first, and which D-012 actor/action/re-authentication/recovery matrix
  should govern general account and source lifecycle work?
- Which reports, alerts, notifications, trip history, and playback capabilities belong to the MVP?

## Handoff Recommendation

Next eligible profile: Product Re-audit.

## Historical T12 Implementation Addendum — 2026-08-01

The then-current implementation evidence extended `6697acbd62c740039722769588b1c464231e5ce1` with D-010:A,
the reviewed `20260801110000_feedback_triage_roles` migration, and the bounded T12 source/UI/tests.
`OPERATOR` is migrated to the ordinary `ADMIN` role; only `ADMIN`, `SUPER_ADMIN`, and `DEV` pass the
new persisted server-role allowlist. Login and explicit re-authentication issue signed freshness
claims; current-role lookup occurs on every administrative request. The public feedback form now
states its anonymous/no-reply/non-emergency/business-day and 180-day/30-day IP policy. Super Admin
and Dev have a dedicated feedback inbox; all three roles receive only the separate read-only source
health view. No account-provisioning UI, Android runtime, device/source write action, deployment,
database migration execution, or physical/provider evidence was observed.

The consolidated current inventory above supersedes this historical addendum and revalidates the
same bounded T12 surfaces at `cdedcc2...`.
