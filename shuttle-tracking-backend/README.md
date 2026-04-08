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

# CORS
CORS_ORIGINS={YOUR FRONTEND URL}

```

## Available Scripts

Once your `.env` is setup, initialize your application using these commands:

- `npm install` - Download all dependencies.
- `npm run db:migrate` - Propagate Prisma schemas into the actual PostgreSQL database.
- `npm run db:seed` - Populate fundamental mock data (default roles, stops, shuttles, tracks) into your database.
- `npm run db:studio` - Launches the Prisma graphical tool to view and edit your database contents.

### Local Development

Launch the backend with hot-reloading (via nodemon):

```bash
npm run dev
```

### Architecture Summary

- **/prisma**: Schema design for your database.
- **/src/routes**: Standard express HTTP controllers (Auth login, CRUD updates).
- **/src/services**: Domain logic abstractions preventing messy routing schemas.
- **WebSocket Handlers**: Emits tracking events (`shuttleLocationUpdate`, etc.) to multiple clients efficiently.