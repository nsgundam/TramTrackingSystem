# Shuttle Tracking Backend Server

This is the core API server fueling the **Tram Tracking System**. It securely handles vehicle telemetry, broadcasts updates to web consumers in real-time using WebSockets, and manages the underlying database entries.

## Tech Stack

- **Runtime**: Node.js
- **Server Framework**: Express
- **Real-time Engine**: Socket.io
- **Database ORM**: Prisma
- **Database Engine**: PostgreSQL
- **Security**: JWT & bcrypt for administrative access controls
- **Language**: TypeScript

## Preparation

### PostgreSQL Setup

You must have a PostgreSQL instance running locally. Ensure you create a database (e.g., `shuttle_tracking`) for the system before continuing.

### Environment Management

For a manually run backend, copy the component template. Docker Compose uses the repository-root
`env.example` instead; it does not read this component file.

```bash
cp .env.example .env
```

Set the copied file as follows:

| Variable | Required for | Notes |
|---|---|---|
| `DATABASE_URL` | Manual database access | Update for the local PostgreSQL user, password, host, port, and database. |
| `REDIS_URL` | Manual Redis access | The default unauthenticated local URL is valid only for development. |
| `NODE_ENV`, `PORT`, `API_URL`, `FRONTEND_URL` | Normal local server settings | The template uses development, port `3001`, and the local frontend origin. |
| `JWT_SECRET`, `TTN_WEBHOOK_SECRET` | Authentication, sender tokens, or TTN ingestion | Replace placeholders and keep the two secrets different. |
| `JWT_EXPIRES_IN`, `SENDER_JWT_EXPIRES_IN` | Changing token lifetimes | Optional; retain the template defaults unless a local test needs otherwise. |
| `TRIP_ACTIVITY_MIN_DISPLACEMENT_METERS`, `TRIP_ACTIVITY_MIN_SPEED_MPS` | Tuning meaningful movement detection | Optional; defaults are `25` metres and `2` metres/second. These values keep GPS jitter from resetting Trip inactivity. |
| `SEED_ADMIN_PASSWORD` | Seeded `admin` and `transport` users | Development only; blank means no seeded login account. |
| `TRACKING_SOURCE_SECRET_MOBILE`, `TRACKING_SOURCE_SECRET_ESP32` | Seeded mobile/ESP32 source activation and simulators | Development only; blank leaves the matching source type inactive. |

The development seed owns fixture identities such as `TS_MOB_01` and `sensor-c4`; they are not
runtime configuration and therefore do not belong in the standard environment template. Test-only
settings such as `SOCKET_URL`, `REQUEST_BODY_LIMIT`, `SOCKET_MAX_BUFFER_BYTES`, rate-limit
overrides, and research session IDs are intentionally omitted. They have safe defaults or are
documented with the specific test/tool that uses them.

Local development defaults to PostgreSQL and Redis on `localhost`, frontend origins
`http://localhost:3000` and `http://127.0.0.1:3000`, no trusted proxy, and port `3001` when those
values are omitted.

### Production Runtime Contract

Production (`NODE_ENV=production`) fails closed before `prisma migrate deploy`. Configure:

- `DATABASE_URL`: `postgres:` or `postgresql:` URL with a username, a URL-encoded password of at
  least 16 characters, a database name, and a non-loopback host.
- `REDIS_URL`: `redis:` or `rediss:` URL on a non-loopback host. Supply an authentication password
  either in the URL or through `REDIS_PASSWORD`; matching duplicate values are accepted, conflicts
  are rejected, and the decoded password must contain at least 16 characters. A separate
  `REDIS_PASSWORD` used by Compose must be a base64url- or hex-style token containing only letters,
  digits, `_`, and `-`, without padding or whitespace; an embedded managed-service URL credential
  may use URL encoding instead.
- `JWT_SECRET` and `TTN_WEBHOOK_SECRET`: different, non-placeholder values of at least 32
  characters.
- `FRONTEND_URL`: one HTTPS origin without credentials, path, query, or fragment.
- `TRUST_PROXY`: one or more comma-separated reverse-proxy IP addresses or narrow CIDRs. IPv4 CIDRs
  must be `/24` or narrower and IPv6 CIDRs `/64` or narrower; booleans, hop counts, named ranges,
  wildcard addresses, and broad networks are rejected.
- `PORT`: optional integer from `1` to `65535`; defaults to `3001`.

Use the repository-root `env.production.example` only as a non-secret schema. The deployed
environment file belongs outside Git and the image with permission `0600`. It contains no
`NEXT_PUBLIC_*` values because the production reverse proxy presents one public origin. After building,
`npm run runtime:validate` validates the current environment only; use `NODE_ENV=production npm run
runtime:validate` for a production preflight. It does not connect to dependencies or run a
migration.

## Available Scripts

Once your `.env` is setup, initialize your application using these commands:

- `npm install` - Download all dependencies.
- `npm run db:migrate` - Propagate Prisma schemas into the actual PostgreSQL database.
- `npm run db:seed` - Populate fundamental mock data (default roles, stops, shuttles, tracks) into your database.
- `npm run db:studio` - Launches the Prisma graphical tool to view and edit your database contents.
- `npm test` - Builds the backend and runs sender JWT boundary tests.
- `npm run check` - Builds the backend, runs deterministic boundary/runtime tests, and validates
  the Prisma schema.
- `npm run runtime:validate` - Validates a compiled production runtime environment without
  connecting or migrating.
- `npm run admin:set-role -- --username <username> --role <ADMIN|SUPER_ADMIN|DEV>` - Reads the
  current role for one existing admin profile; it does not modify the database unless `--apply` is
  appended.
- `npm run test:socket` - Verifies that an unauthenticated Socket.IO viewer cannot emit GPS writes (requires a running backend).

### Managing Admin Roles

Use the same protected backend environment that the deployment uses. Run the command once without
`--apply`, check the reported username and current role, then repeat the exact command with
`--apply` only when it targets the intended existing profile. The only accepted roles are `ADMIN`,
`SUPER_ADMIN`, and `DEV`; the command neither creates users nor accepts passwords.

```bash
npm run admin:set-role -- --username operations.owner --role SUPER_ADMIN
npm run admin:set-role -- --username operations.owner --role SUPER_ADMIN --apply
```

Changing a role is a production database mutation. Take the normal backup/change-control steps and
have each affected person sign out and sign in again so their authenticated session is refreshed.

### Local Development

Launch the backend with hot-reloading (via nodemon):

```bash
npm run dev
```

### Sender Authentication

Mobile/ESP32 senders must first exchange a registered Tracking Source secret for a short-lived
sender token. The token identifies the source only; the backend resolves the current Vehicle from
the source's active Tracking Assignment. A submitted `vehicleId` is not an authority and is not
embedded in the token:

```http
POST /api/auth/vehicle-login
Content-Type: application/json

{"sourceId":"TS_MOB_01","secret":"<source-secret>"}
```

An active Mobile source may receive this source-only token before its first assignment and use it
only for `POST /api/assignments/mobile/scan`. Ingestion and Trip endpoints require the active
assignment to exist.

Use the returned token as `Authorization: Bearer <token>` for trip start/end and HTTP GPS
ingestion. Socket.IO senders provide the same token in `auth.token` during the handshake and must
include the registered `sourceId` in `send-location`. Public viewers may connect to Socket.IO but
cannot emit GPS writes. Sender sockets revalidate the token on every GPS write, so clients must
login again after expiry, reassignment, or credential rotation. TTN webhook requests require
`Authorization: Bearer <TTN_WEBHOOK_SECRET>` and fail closed when the production secret is absent.

### Service and assignment lifecycle

GPS/telemetry is retained as source diagnostics, but it cannot create a Trip, activate a Vehicle,
or publish a public live vehicle. A sender must explicitly start a Trip first. Source health
(`online`, `stale`, `offline`) is independent from Trip lifecycle.

Each active Trip stores `lastTripActivityAt` separately from each source's `lastTelemetryAt`.
Activity comes from an explicit service/mobile heartbeat or meaningful movement. A Trip with no
activity for 15 minutes is auto-closed as `aborted` with `endReason=inactivity_timeout`; the system
close time is stored in `closedAt`, and source assignments remain intact.

The assignment API is available to Admins at `GET /api/admin/devices/:id/assignments`,
`PUT /api/admin/devices/:id/assignment`, and `DELETE /api/admin/devices/:id/assignment`.
Vehicles expose a signed QR token at `GET /api/admin/vehicles/:id/assignment-qr`. A Mobile client
submits that token to `POST /api/assignments/mobile/scan`; switching away from a Vehicle with an
active Trip is rejected until the client explicitly ends service.

Senders can explicitly refresh Trip activity with `POST /api/trips/:id/heartbeat`. This endpoint
does not create a Trip and rejects a Trip that is no longer active.

The simulator uses the same flow. Set `TRACKING_SOURCE_SECRET_MOBILE` in an ignored environment
file before running it; do not put a source secret in committed frontend code. The checked-in
fixture defaults are `TS_MOB_01` → `VH001`, `TS_ESP_01` → `VH001`, `sensor-c4` → `VH003`, and
`sensor-f2` → `VN002`.

For repeatable mobile/TTN pipeline smoke commands, see
[`docs/testing/pipeline-smoke-tests.md`](../docs/testing/pipeline-smoke-tests.md).

### Architecture Summary

- **/prisma**: Schema design for your database.
- **/src/routes**: Standard express HTTP controllers (Auth login, CRUD updates).
- **/src/services**: Domain logic abstractions preventing messy routing schemas.
- **WebSocket Handlers**: Emits tracking events (`shuttleLocationUpdate`, etc.) to multiple clients efficiently.
