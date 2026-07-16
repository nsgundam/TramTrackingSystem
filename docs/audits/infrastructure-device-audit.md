# Infrastructure & Device Audit: Tram Tracking System

## 1. Executive Summary

Assessment: **local/dev infrastructure is usable for MVP development, but not production-ready as-is**.

The current repository runs a Docker Compose stack with PostGIS, Redis, backend, and frontend. This is a good local/dev foundation because database and Redis have health checks, backend waits for them before startup, and persistent named volumes exist for PostgreSQL and Redis (`docker-compose.yml:5-40`, `docker-compose.yml:67-71`, `docker-compose.yml:100-102`). However, backend and frontend containers are explicitly development-oriented: backend runs `nodemon`, frontend runs `next dev`, source directories are mounted into containers, and backend `NODE_ENV` is set to `development` (`docker-compose.yml:51-66`, `docker-compose.yml:82-96`, `shuttle-tracking-backend/Dockerfile:25-28`, `shuttle-tracking-web/Dockerfile:16-18`).

User-provided deployment direction for test/product evolution:

- Current test deployment target: Frontend on Vercel, backend server and Redis on Render, database on Neon.
- Later product deployment may move to an organization-provided server.
- LoRaWAN will use TTN. The intended flow has two parts: TTN MQTT data to frontend directly for realtime display, and separate history persistence to the database. The history path is not designed yet and does not need realtime writes; 60-second sampling is acceptable to avoid database growth.
- ESP32 transmission protocol is not decided yet.

Device integration readiness is now **partially implemented**. In addition to the legacy Socket.IO path, the repository now has a tracking-source registry, HTTP ingestion, TTN webhook ingestion, source priority selection, last-seen tracking, canonical vehicle location selection, and 60-second history sampling (`shuttle-tracking-backend/src/routes/ingest.route.ts:6-158`, `shuttle-tracking-backend/src/services/tracking.service.ts:13-245`, `shuttle-tracking-backend/prisma/schema.prisma:150-177`). It is not complete for production or for the user's final TTN topology: direct TTN MQTT-to-frontend is not implemented, TTN history currently uses a webhook rather than MQTT, and ESP32 transport remains undecided.

## 2. Current Infrastructure Overview

Services:

- `db`: `postgis/postgis:16-3.4-alpine`, exposes port `5432`, uses named volume `pgdata`, and runs a PostGIS init script (`docker-compose.yml:5-23`).
- `redis`: `redis:alpine`, exposes port `6379`, uses named volume `redisdata`, and has a `redis-cli ping` health check (`docker-compose.yml:28-40`).
- `backend`: built from `shuttle-tracking-backend/Dockerfile`, exposes `3001`, depends on healthy DB and Redis, mounts source files for hot reload, and runs in development mode (`docker-compose.yml:45-71`).
- `frontend`: built from `shuttle-tracking-web/Dockerfile`, exposes `3000`, depends on backend, and mounts app source files for hot reload (`docker-compose.yml:76-98`).

Dockerfiles:

- Backend uses `node:22-alpine`, installs dependencies with `npm ci --legacy-peer-deps`, generates Prisma client, installs an entrypoint, exposes `3001`, and runs `npx nodemon` by default (`shuttle-tracking-backend/Dockerfile:1-28`).
- Frontend uses `node:22-alpine`, installs dependencies, copies source, exposes `3000`, and runs `npx next dev --hostname 0.0.0.0` (`shuttle-tracking-web/Dockerfile:1-18`).

Database initialization:

- `docker/init-postgis.sh` enables `postgis` and `postgis_topology` extensions with `CREATE EXTENSION IF NOT EXISTS` (`docker/init-postgis.sh:1-8`).
- Backend entrypoint runs `prisma migrate deploy` and then attempts `prisma db seed` on startup (`shuttle-tracking-backend/docker-entrypoint.sh:1-11`).

Environment configuration:

- Root `env.example` contains PostgreSQL and JWT variables (`env.example:1-8`).
- Backend `.env.example` contains `DATABASE_URL`, `REDIS_URL`, `NODE_ENV`, `PORT`, `API_URL`, JWT settings, and `FRONTEND_URL` (`shuttle-tracking-backend/.env.example:1-17`).
- Frontend `.env.example` contains `NEXT_PUBLIC_API_BASE_URL` only (`shuttle-tracking-web/.env.example:1`).
- Compose injects local URLs such as `DATABASE_URL` pointing to `db`, `REDIS_URL` pointing to `redis`, `FRONTEND_URL=http://localhost:3000`, and `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api` (`docker-compose.yml:51-59`, `docker-compose.yml:82-84`).

Runtime backend behavior:

- Express mounts auth, public, admin, trip, HTTP ingest, and TTN webhook routes in `server.ts` (`shuttle-tracking-backend/src/server.ts:53-66`).
- Socket.IO receives `send-location`, maps `sourceId` with a legacy `vehicleId` fallback, sends it through `processObservation`, and emits canonical `location-update` events globally (`shuttle-tracking-backend/src/server.ts:97-121`).
- `/health` checks process liveness and `/ready` checks PostgreSQL and Redis connectivity (`shuttle-tracking-backend/src/server.ts:68-89`).
- Redis connects at startup and is also used for the Socket.IO Redis adapter (`shuttle-tracking-backend/src/server.ts:84-96`).

## 3. Infrastructure Strengths

1. **Local stack is coherent.** Docker Compose expresses the same logical services used by the app: PostGIS, Redis, backend, and frontend (`docker-compose.yml:1-102`).

2. **Database and Redis readiness checks exist.** Compose uses health checks for DB and Redis, and backend waits for both before startup (`docker-compose.yml:19-23`, `docker-compose.yml:36-40`, `docker-compose.yml:67-71`).

3. **Persistent local data is configured.** PostgreSQL and Redis use named volumes (`docker-compose.yml:16-18`, `docker-compose.yml:34-35`, `docker-compose.yml:100-102`).

4. **PostGIS setup is automated for local containers.** The init script enables required spatial extensions (`docker/init-postgis.sh:1-8`).

5. **Socket.IO scale-out foundation exists.** Backend attaches the Socket.IO Redis adapter after connecting Redis (`shuttle-tracking-backend/src/server.ts:89-96`).

6. **Deployment target direction is now clearer.** User confirmed Vercel, Render, and Neon for test deployment, with possible later organization server deployment.

## 4. Critical Infrastructure Issues

### Critical Issue 1: Docker images are development images, not production images

Backend runs `nodemon`, frontend runs `next dev`, Compose mounts source directories, and `NODE_ENV` is set to `development` (`docker-compose.yml:51-66`, `docker-compose.yml:82-96`, `shuttle-tracking-backend/Dockerfile:25-28`, `shuttle-tracking-web/Dockerfile:16-18`).

Impact: this is appropriate for local development but not for production or realistic test deployment. Production should run compiled backend code and optimized frontend builds.

### Critical Issue 2: Target deployment is split across providers but config is still local-only

The user confirmed test deployment target as Vercel frontend, Render backend and Redis, and Neon database. Repository config still points to localhost or Compose service names (`docker-compose.yml:54-59`, `docker-compose.yml:83`, `shuttle-tracking-backend/.env.example:1-17`, `shuttle-tracking-web/.env.example:1`).

Impact: deploying the current config directly would break cross-service connectivity, CORS, Socket.IO origin, database URLs, Redis URLs, and frontend backend URL resolution.

### Critical Issue 3: Production deployment configuration is still incomplete

The backend now has liveness/readiness endpoints, but there is still no provider-specific Vercel/Render/Neon configuration or runbook in the repository. The Dockerfiles and Compose stack remain development-oriented (`shuttle-tracking-backend/Dockerfile:25-28`, `shuttle-tracking-web/Dockerfile:16-18`).

Impact: the endpoints improve Render integration, but deployments can still fail through wrong URLs, CORS/Socket.IO origins, startup commands, migrations, or managed-service connection settings.

### Critical Issue 4: Source registry exists, but the ingestion boundary is not production-complete

The repository now distinguishes sources through `TrackingSource`, `sourceId`, `sourceType`, `priority`, `status`, `lastSeenAt`, and source-attributed `gps_tracks` (`shuttle-tracking-backend/prisma/schema.prisma:92-127`, `shuttle-tracking-backend/src/services/tracking.service.ts:42-160`). However, `/api/ingest/http` is publicly mounted and device authentication is optional when a source has no `secretHash`; TTN webhook authentication is also optional when `TTN_WEBHOOK_SECRET` is absent (`shuttle-tracking-backend/src/routes/ingest.route.ts:10-74`).

Impact: the multi-source model is substantially better than the previous audit found, but an incorrectly provisioned source can become an unauthenticated write path. Direct TTN MQTT frontend delivery and a durable server-side MQTT history subscriber are also still absent.

## 5. Local/Dev vs. Production Gap Analysis

Current Compose is best treated as **local/dev orchestration**, not a production deployment plan.

For the confirmed test target:

- Frontend on Vercel should use a production Next.js build, not the Compose frontend container running `next dev`.
- Backend on Render should use a production backend command such as `npm run build` followed by `npm start`, not `nodemon`.
- Render Redis should replace the local `redis://redis:6379` URL.
- Neon should replace the Compose `postgres://...@db:5432/...` URL.
- Frontend public env should point to the deployed backend origin and API base.
- Backend CORS `FRONTEND_URL` should include the Vercel frontend origin.
- Socket.IO URL handling should be checked carefully because the public tracker derives socket origin from `NEXT_PUBLIC_BACKEND_URL` or `NEXT_PUBLIC_API_BASE_URL`, while admin `LiveMap` currently passes `NEXT_PUBLIC_API_BASE_URL` directly to `io()` (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:42-44`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-701`, `shuttle-tracking-web/components/admin/LiveMap.tsx:27-31`).

For a future organization-provided server:

- Needs Confirmation: whether the organization server will run Docker Compose, standalone Node processes, managed PostgreSQL/Redis, or a reverse proxy in front of containers.
- Needs Confirmation: TLS termination, domain names, firewall rules, backup ownership, and log retention ownership.

Production missing items:

- Production Dockerfile targets or Render build/start commands.
- Backend health/readiness endpoint.
- Separate production env examples.
- Deployment-specific CORS and Socket.IO origin documentation.
- DB migration policy for Neon and organization-hosted DB.
- Redis persistence/eviction policy decision.
- Backup/restore ownership for Neon or future organization DB.
- Log destination beyond console output.

## 6. Current Device Ingestion Review (Mobile)

Current implemented path:

1. Simulator uses `API_URL=http://localhost:3001/api`, `SOCKET_URL=http://localhost:3001`, and `VEHICLE_ID=VH001` (`shuttle-tracking-web/simulate.js:3-6`).
2. Simulator starts a trip by calling `POST /api/trips/start` with `{ vehicleId }` (`shuttle-tracking-web/simulate.js:62-74`).
3. Simulator emits `send-location` payloads containing `tripId`, `vehicleId`, `lat`, `lng`, `speed`, `bearing`, `accuracy`, and `station` (`shuttle-tracking-web/simulate.js:116-130`).
4. Backend listens to `send-location`, resolves `sourceId` (falling back to legacy `vehicleId`), passes the observation to `processObservation`, and broadcasts a canonical `location-update` only when a fresh assigned source can be selected (`shuttle-tracking-backend/src/server.ts:101-121`, `shuttle-tracking-backend/src/services/tracking.service.ts:28-160`).
5. `processObservation` validates coordinates, checks the source registry, optionally authenticates the source secret, caches the latest source observation, updates `lastSeenAt`, selects the highest-priority fresh source, and persists source-attributed history at most once per trip per 60 seconds (`shuttle-tracking-backend/src/services/tracking.service.ts:28-245`).
6. Public tracker subscribes to `location-update` and updates vehicle markers (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`).
7. Admin live map subscribes to `location-update` and updates active vehicle state (`shuttle-tracking-web/components/admin/LiveMap.tsx:27-43`).

Mobile readiness:

- Implemented: simulator/mobile-like data contract exists.
- Not Implemented: real mobile app, device session/token, Socket.IO authentication, and location acknowledgement. Source identity and stale-source selection are now implemented at the backend registry/pipeline level, but device health presentation is not implemented.
- Needs Confirmation: whether real mobile will keep the exact same payload and whether `accuracy`, device timestamp, battery, app version, and driver/session ID are required.

## 7. LoRaWAN Integration Readiness

Current status: **partially implemented; target topology is not complete**.

Confirmed by user:

- LoRaWAN will use TTN.
- Realtime part: TTN MQTT data should go to frontend directly.
- History part: GPS history should be stored in DB through a separate path that is not designed yet.
- DB history does not need realtime frequency; 60-second sampling is acceptable to avoid DB growth.

Repository evidence:

- A TTN webhook endpoint now exists and extracts `device_id`/`dev_eui`, decoded coordinates, and optional motion fields before passing the data into the common observation pipeline (`shuttle-tracking-backend/src/routes/ingest.route.ts:63-158`).
- No TTN MQTT client, direct browser MQTT integration, or payload decoder for the actual hardware format exists in the repository. The webhook assumes TTN already provides `decoded_payload` with latitude/longitude fields.

Assessment:

- Direct TTN MQTT to frontend can be useful for a demo or low-latency visualization, but it should not become the only system-of-record path. Browser clients should not own durable history writes.
- The current webhook is a viable server-side history path: it enters the common observation pipeline, applies the 60-second persistence throttle, and writes source-attributed history when the TTN source is assigned to a vehicle (`shuttle-tracking-backend/src/routes/ingest.route.ts:107-129`, `shuttle-tracking-backend/src/services/tracking.service.ts:157-245`).
- It does not yet satisfy the requested direct TTN MQTT-to-frontend realtime path. That path needs a browser-compatible, explicitly secured delivery design and a clear mapping to the frontend's canonical `location-update` contract.

Open LoRaWAN design questions:

- What TTN application ID, device IDs, and payload fields will identify vehicle/source?
- What uplink payload format will the LoRaWAN device send?
- Where will payload decoding happen: TTN payload formatter, backend adapter, or separate worker?
- How should MQTT credentials be protected if frontend receives TTN MQTT directly?
- Should frontend receive TTN MQTT from TTN directly, or through a backend-controlled relay?
- Which LoRaWAN source wins if mobile/ESP32 reports a different location for the same vehicle?
- Should TTN history persistence use MQTT subscription, webhook, scheduled pull, or backend relay?

## 8. ESP32 Integration Readiness

Current status: **Needs Confirmation**.

The user confirmed ESP32 transmission protocol is not decided. No ESP32 source module, hardware spec, protocol contract, or payload format exists in the repository (`docs/project-knowledge-base.md:408-422`, `docs/audits/backend-audit.md:181-188`).

Reasonable future options, without choosing one yet:

- HTTP POST ingestion to backend: simplest to implement and debug.
- MQTT ingestion through a broker: useful for device fleets or intermittent connectivity.
- Socket.IO: possible, but usually heavier for embedded devices and less natural than HTTP/MQTT.

The backend should first define a normalized server-side location observation contract so ESP32, TTN, and mobile can enter through different adapters but produce comparable internal data.

Needs Confirmation:

- ESP32 connectivity: Wi-Fi, cellular, or another network path.
- Payload fields: GPS coordinates, speed, heading, accuracy, timestamp, battery, signal quality.
- Authentication method: device token, per-device secret, broker credentials, or gateway trust.
- Update frequency and offline behavior.
- Whether ESP32 is a primary tracker, fallback tracker, or experimental tracker.

## 9. Multi-Device Architecture Readiness

Current readiness: **partially ready at the backend integration level**.

The normalized observation now contains `sourceId` and the registry supplies `sourceType`, `priority`, `status`, `lastSeenAt`, and vehicle assignment. Canonical updates include `sourceId` and `sourceType` (`shuttle-tracking-backend/src/services/tracking.service.ts:13-22`, `shuttle-tracking-backend/src/services/tracking.service.ts:138-149`). The simulator itself still uses the legacy `vehicleId` fallback and is not yet a representative registered-device client (`shuttle-tracking-web/simulate.js:116-130`, `shuttle-tracking-backend/src/server.ts:103-105`).

Existing public/admin live maps key vehicle state by `vehicleId`, not by device/source (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:315-329`, `shuttle-tracking-web/components/admin/LiveMap.tsx:31-37`).

Minimum integration-level concepts needed:

- Device or tracking source registry: implemented in Prisma and admin API.
- Vehicle-to-device/source assignment: implemented through `TrackingSource.vehicleId`.
- Source type and source authentication: represented by `type` and optional `secretHash`, with enforcement gaps noted above.
- Last seen and freshness status: implemented in Redis/DB and 30-second selection logic.
- Source priority/failover rule: implemented as ascending priority among fresh active sources.
- Canonical current vehicle location and source-attributed history: implemented in the tracking service.
- Admin-facing device health/comparison view and a production provisioning workflow: Not Implemented.

Failover and comparison mode:

- Needs Confirmation: whether frontend should show all sources for a vehicle, only the selected canonical source, or a comparison/debug view for admins.
- Needs Confirmation: source priority when mobile, TTN, and ESP32 disagree.
- Recommendation: keep public map simple by showing canonical vehicle position, while admin/device dashboard can expose per-source health and comparison details. The current public/admin clients consume canonical vehicle updates, but no dedicated source-health UI was found.

## 10. Secrets and Configuration Review (Structural)

Current secrets/config placement:

- Root env template includes database user/password and JWT secret placeholders (`env.example:1-8`).
- Backend env template includes local `DATABASE_URL`, `REDIS_URL`, JWT secret, and frontend URL (`shuttle-tracking-backend/.env.example:1-17`).
- Compose includes default values for PostgreSQL password and JWT secret if environment variables are not supplied (`docker-compose.yml:10-13`, `docker-compose.yml:54-57`).

Structural assessment:

- Local examples are useful for development.
- Production secrets are not separated into provider-specific documentation.
- For Vercel/Render/Neon, real secrets should live in provider secret managers/env var settings, not in committed files.
- TTN MQTT credentials introduce a new secret class. If MQTT goes directly to frontend, credential exposure risk must be considered by the Security & DevOps & Observability Audit.

Out of scope here:

- Secret strength.
- Rotation policy.
- Vulnerability analysis.

## 11. Missing Infrastructure Capabilities

- Backend health/readiness endpoint: Implemented (`/health`, `/ready`).
- Production backend build/start configuration: Not Found in Dockerfile/Compose.
- Frontend production deployment config for Vercel: Not Found.
- Render service config: Not Found.
- Neon migration/runbook: Not Found.
- Production Redis configuration/runbook: Not Found.
- Log destination beyond console output: Not Found.
- Device registry and source identity: Partially Implemented (schema, admin CRUD, and common pipeline exist).
- Device health monitoring: Partially Implemented at backend data level (`lastSeenAt`, freshness, status); admin UI/alerts are Not Implemented.
- TTN ingestion adapter for DB history: Partially Implemented through webhook; MQTT subscriber/worker is Not Implemented.
- TTN MQTT frontend integration: Not Implemented in repo.
- ESP32 ingestion path: Needs Confirmation.
- Source priority/failover rules: Implemented as a basic priority/freshness rule; business policy for conflicts still Needs Confirmation.

## 12. Recommended Improvements

### Recommendation 1: Add production deployment configuration for Vercel, Render, and Neon

### Problem

The confirmed test deployment target is split across Vercel, Render, and Neon, but repository config is still local/Compose-oriented.

### Impact

Deployments may fail due to wrong backend URLs, CORS origins, Socket.IO origins, database URLs, Redis URLs, and startup commands.

### Recommendation

Create deployment notes and provider env templates for Vercel frontend, Render backend, Render Redis, and Neon database. Include required variables, build commands, start commands, migration command, CORS frontend URL, backend public URL, and Socket.IO URL expectations.

### Why

Compose uses local service names and localhost URLs (`docker-compose.yml:54-59`, `docker-compose.yml:83`), while user confirmed external provider deployment.

### Priority

Critical

### Difficulty

Medium

### Learning Topic

Environment-specific configuration and platform deployment.

### Related Files

`docker-compose.yml`, `env.example`, `shuttle-tracking-backend/.env.example`, `shuttle-tracking-web/.env.example`

### Recommendation 2: Create production-oriented backend and frontend runtime commands

### Problem

Backend runs `nodemon` and frontend runs `next dev`.

### Impact

Development servers are not suitable for production-like testing, performance, restart behavior, or predictable builds.

### Recommendation

For backend, build TypeScript and run `node dist/server.js`. For frontend on Vercel, rely on Vercel's Next.js production build. If retaining Docker, add production Dockerfile targets or separate production Dockerfiles.

### Why

Backend Dockerfile defaults to `npx nodemon` (`shuttle-tracking-backend/Dockerfile:25-28`) and frontend Dockerfile defaults to `npx next dev` (`shuttle-tracking-web/Dockerfile:16-18`).

### Priority

High

### Difficulty

Medium

### Learning Topic

Development server vs. production server.

### Related Files

`shuttle-tracking-backend/Dockerfile`, `shuttle-tracking-web/Dockerfile`, `shuttle-tracking-backend/package.json`, `shuttle-tracking-web/package.json`

### Recommendation 3: Add backend health and readiness endpoints

### Problem

The backend now exposes health/readiness routes, but the deployment platform is not yet configured to use them.

### Impact

Render or organization-hosted deployment cannot reliably know whether backend is healthy and connected to DB/Redis.

### Recommendation

Configure Render and the future organization deployment to use `/health` for liveness and `/ready` for dependency readiness. Keep the existing lightweight PostgreSQL and Redis checks, and document expected HTTP status behavior.

### Why

The backend implements `/health` and `/ready` (`shuttle-tracking-backend/src/server.ts:68-89`), while Compose already has DB/Redis health checks (`docker-compose.yml:19-40`).

### Priority

High

### Difficulty

Easy

### Learning Topic

Health checks and readiness probes.

### Related Files

`shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/config/prisma.ts`, `shuttle-tracking-backend/src/config/redis.ts`

### Recommendation 4: Introduce a device/source registry before TTN and ESP32 implementation

### Problem

The source registry and canonical selection pipeline now exist, but clients and provisioning flows still have legacy assumptions.

### Impact

Without registered source IDs, assigned secrets, and consistent client payloads, some senders can still fall back to vehicle IDs and bypass the intended source model.

### Recommendation

Complete the integration-level source workflow: require registered source IDs for non-legacy clients, provision secrets, expose source health to admins, and document source priority/failover behavior. Keep source attribution in canonical updates and sampled history.

### Why

The registry is present in `schema.prisma`, admin CRUD is mounted under `/api/admin/devices`, and the service already performs priority/freshness selection (`shuttle-tracking-backend/src/server.ts:56-61`, `shuttle-tracking-backend/src/services/tracking.service.ts:101-160`).

### Priority

Critical

### Difficulty

Medium

### Learning Topic

Device registry and source attribution.

### Related Files

`shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/server.ts`

### Recommendation 5: Build a server-side TTN history ingestion adapter

### Problem

The requested direct TTN MQTT-to-frontend realtime path is not implemented. The repository currently offers a TTN webhook path that can persist sampled history.

### Impact

Without a completed MQTT frontend/relay design, realtime TTN data cannot yet follow the requested flow. The webhook also depends on TTN decoded payloads and source-to-vehicle assignment for history persistence.

### Recommendation

Keep the existing TTN webhook as the initial server-side history adapter, add the actual TTN decoder contract and retry/idempotency behavior, and separately implement the chosen secured MQTT-to-frontend realtime path. If operational control over delivery is needed, add a Render worker MQTT subscriber that feeds `processObservation`.

### Why

The TTN webhook and common observation pipeline now exist (`shuttle-tracking-backend/src/routes/ingest.route.ts:63-158`), but no MQTT client, browser MQTT integration, or hardware-specific decoder exists.

### Priority

High

### Difficulty

Hard

### Learning Topic

LoRaWAN network servers, MQTT, webhook ingestion, and payload decoding.

### Related Files

`shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`, future TTN adapter files

### Recommendation 6: Decide ESP32 protocol after defining the normalized observation contract

### Problem

ESP32 protocol is not decided.

### Impact

Choosing HTTP, MQTT, or Socket.IO too early may create a second special-case ingestion path that does not align with TTN/mobile.

### Recommendation

First define a normalized backend observation contract. Then choose ESP32 transport based on connectivity, power, payload size, reliability, and security constraints.

### Why

User confirmed ESP32 protocol is undecided, and no ESP32 module/spec exists in the repo.

### Priority

Medium

### Difficulty

Medium

### Learning Topic

Embedded device transport choices: HTTP vs. MQTT vs. Socket.IO.

### Related Files

Future ESP32 adapter files, `shuttle-tracking-backend/src/services/tracking.service.ts`

## 13. Infrastructure & Device Learning Topics

### Docker Compose vs. production hosting

What it is: Docker Compose runs multiple services together on one development machine or server.

What problem it solves: It makes local DB, Redis, backend, and frontend startup repeatable.

Does this project need it now: Yes for local development.

Simpler alternative: For Vercel/Render/Neon test deployment, use provider-native deployment instead of trying to push the whole Compose stack.

Suggested learning order: Docker basics, Compose services/volumes/networks, then provider-specific deployment.

### Managed database and managed Redis

What it is: Neon and Render Redis provide hosted Postgres/Redis without running containers yourself.

What problem it solves: Reduces operational burden for backups, upgrades, and uptime.

Does this project need it now: Yes for the confirmed test deployment.

Simpler alternative: Local Compose remains enough for development.

Suggested learning order: connection strings, env vars, migrations, backups, then monitoring.

### Health checks and readiness

What it is: Liveness checks answer "is the process alive"; readiness checks answer "can it serve traffic safely".

What problem it solves: Deployment platforms can restart or avoid routing traffic to unhealthy services.

Does this project need it now: Yes before Render/organization deployment.

Simpler alternative: A basic `/health` endpoint first, then `/ready` with DB/Redis checks.

Suggested learning order: HTTP health endpoint, dependency ping, deployment platform health settings.

### Webhook vs. MQTT vs. Socket.IO

What it is: Webhook is server-to-server HTTP push, MQTT is pub/sub messaging, Socket.IO is realtime bidirectional app communication.

What problem it solves: Each fits a different sender and reliability model.

Does this project need it now: Yes for TTN and future ESP32 decisions.

Simpler alternative: Use one server-side TTN webhook/MQTT adapter to normalize payloads before adding more transports.

Suggested learning order: HTTP webhook, MQTT topics/QoS, Socket.IO client/server events, then adapter pattern.

### Device registry

What it is: A registry maps physical/logical GPS sources to vehicles and source types.

What problem it solves: It lets the system know whether a location came from mobile, TTN/LoRaWAN, ESP32, or simulator.

Does this project need it now: Yes before real multi-source operation.

Simpler alternative: Start with a minimal source table and source ID in observations; add advanced provisioning later.

Suggested learning order: source identity, vehicle assignment, last seen, source priority, failover.

## 14. Audit Limitations

- This audit is static and repository-based, plus user-provided deployment/device direction in this conversation.
- No live Vercel, Render, Neon, TTN, or organization server configuration was available.
- No TTN payload format, TTN application configuration, or LoRaWAN hardware spec was available.
- ESP32 protocol and hardware details are not decided.
- Security hardening, CI/CD, deep observability, and vulnerability review are intentionally deferred to the Security & DevOps & Observability Audit.
- Database schema design details are referenced only where needed for infrastructure/device source readiness; detailed schema work belongs to the Database Audit.

## 15. Open Questions for the User

1. What are the exact Vercel frontend domain and Render backend domain for test deployment?
2. Will Render Redis be persistent, and what eviction/persistence settings are expected?
3. Will Neon be the long-term production DB or only a test deployment DB before organization server deployment?
4. For TTN realtime frontend data, will the browser connect directly to TTN MQTT, or should backend relay MQTT updates to browser clients?
5. What TTN payload format and decoder output will identify vehicle, device, lat/lng, timestamp, speed, heading, and accuracy?
6. Should TTN history persistence use TTN MQTT subscription or TTN webhook?
7. If mobile, TTN, and ESP32 report different locations for the same vehicle, which source should public users see?
8. Should admins see all raw sources for a vehicle, or only device health and selected canonical position?
9. What transport should ESP32 use once hardware/connectivity is known?
10. Will the organization-provided server run Docker, a reverse proxy, managed DB/Redis, or all services on one host?

## 16. Handoff

Recommended next agents:

- **Dashboard & UX Audit Agent**: should review how device health, source status, and multi-source comparison can be presented without overwhelming admins or public users.
- **Security & DevOps & Observability Audit Agent**: should review Vercel/Render/Neon secrets, TTN MQTT credential exposure, CORS, Socket.IO auth, logs, rate limiting, and production diagnostics.
- **Production Readiness Audit Agent**: should make the final production readiness call after infrastructure, device, security, backend, database, frontend, and UX findings are available.

Handoff summary:

The current stack is good for local MVP development. The next infrastructure milestone is to make the confirmed test topology explicit: Vercel frontend, Render backend/Redis, and Neon database. The next device milestone is to introduce source identity and a normalized observation contract before adding TTN history ingestion or ESP32 support.
