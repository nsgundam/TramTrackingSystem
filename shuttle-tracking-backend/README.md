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

Create a `.env` file at the root of `shuttle-tracking-backend`:

```env
# Connection URL format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:password@localhost:5432/shuttle_tracking?schema=public"

# The port where Express will listen (default: 3001)
PORT=3001

# JWT Secret logic for Admin Authentication checks
JWT_SECRET="YOUR_SUPER_SECRET_STRING"
JWT_EXPIRES_IN=8h
SENDER_JWT_EXPIRES_IN=15m

# Required for TTN webhook ingestion
TTN_WEBHOOK_SECRET="YOUR_TTN_WEBHOOK_SECRET"

# CORS
CORS_ORIGINS={YOUR FRONTEND URL}

```

## Available Scripts

Once your `.env` is setup, initialize your application using these commands:

- `npm install` - Download all dependencies.
- `npm run db:migrate` - Propagate Prisma schemas into the actual PostgreSQL database.
- `npm run db:seed` - Populate fundamental mock data (default roles, stops, shuttles, tracks) into your database.
- `npm run db:studio` - Launches the Prisma graphical tool to view and edit your database contents.
- `npm test` - Builds the backend and runs sender JWT boundary tests.
- `npm run test:socket` - Verifies that an unauthenticated Socket.IO viewer cannot emit GPS writes (requires a running backend).

### Local Development

Launch the backend with hot-reloading (via nodemon):

```bash
npm run dev
```

### Sender Authentication

Vehicle/mobile/ESP32 senders must first exchange a registered source secret for a short-lived
sender token:

```http
POST /api/auth/vehicle-login
Content-Type: application/json

{"sourceId":"TS_MOB_01","vehicleId":"VH001","secret":"<source-secret>"}
```

Use the returned token as `Authorization: Bearer <token>` for trip start/end and HTTP GPS
ingestion. Socket.IO senders provide the same token in `auth.token` during the handshake and must
include the registered `sourceId` in `send-location`. Public viewers may connect to Socket.IO but
cannot emit GPS writes. Sender sockets revalidate the token on every GPS write, so clients must
login again after expiry or credential rotation. TTN webhook requests require
`Authorization: Bearer <TTN_WEBHOOK_SECRET>` and fail closed when the production secret is absent.

The simulator uses the same flow. Set `TRACKING_SOURCE_SECRET` before running it; do not put a
source secret in committed frontend code.

### Architecture Summary

- **/prisma**: Schema design for your database.
- **/src/routes**: Standard express HTTP controllers (Auth login, CRUD updates).
- **/src/services**: Domain logic abstractions preventing messy routing schemas.
- **WebSocket Handlers**: Emits tracking events (`shuttleLocationUpdate`, etc.) to multiple clients efficiently.
