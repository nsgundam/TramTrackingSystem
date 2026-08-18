# 🚋 Tram Tracking System

A full-stack web application for **real-time tracking of trams/shuttles**. It provides a live map interface for end-users to see the current location of vehicles and an administrative interface to manage routes, stops, and track the overall operation of the fleet.

## System Architecture

| Component | Tech Stack | Description |
|---|---|---|
| **Frontend** (`shuttle-tracking-web`) | Next.js, TypeScript | Web interface with live map & admin dashboard |
| **Backend** (`shuttle-tracking-backend`) | Node.js, Express, Socket.IO | REST API + real-time WebSocket updates |
| **Database** | PostgreSQL + PostGIS | Spatial data storage with geographic queries |
| **Cache** | Redis | Real-time data caching & Socket.IO adapter |

---

## 🐳 Quick Start with Docker (Recommended)

The fastest way to get everything running. One command sets up the entire stack — database, migrations, seed data, backend, and frontend.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nsgundam/TramTrackingSystem.git
   cd TramTrackingSystem
   ```

2. **Create a local Docker Compose environment file** from the template:
   ```bash
   cp env.example .env
   ```
   Edit the ignored `.env`; never commit it. The template contains all values used by the local
   Compose stack. Set them as follows:

   | Variable | Set it when | Notes |
   |---|---|---|
   | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Always | Local database identity. Change the password from its placeholder. |
   | `JWT_SECRET` | Always for a usable local stack | Replace the placeholder; it signs admin and sender tokens. |
   | `TTN_WEBHOOK_SECRET` | Using a TTN webhook or the TTN smoke test | Replace the placeholder; it is separate from `JWT_SECRET`. |
   | `SEED_ADMIN_PASSWORD` | Needing the seeded `admin` and `transport` accounts | Local development only. Both accounts use this password. |
   | `TRACKING_SOURCE_SECRET_MOBILE`, `TRACKING_SOURCE_SECRET_ESP32` | Using mobile/ESP32 simulators or active seeded sources | Local development only. Keep both values out of Git and client code. |
   | `JWT_EXPIRES_IN`, `SENDER_JWT_EXPIRES_IN` | Changing token lifetimes | Optional; the template defaults are normally appropriate. |

   The development seed is the source of truth for the fixture IDs; do not add source or vehicle
   IDs to `.env` unless a specific test or tool explicitly documents an override.

3. **Validate the Compose configuration** before starting services:
   ```bash
   docker compose --env-file .env config --quiet
   ```

4. **Start all services**:
   ```bash
   docker compose --env-file .env up --build -d
   ```

5. **That's it!** 🎉 The following happens automatically:
   - PostgreSQL + PostGIS database is created
   - Redis cache is started
   - Database migrations are applied
   - Seed data is populated (admin users, routes, stops, vehicles)
   - Backend API server starts on **http://localhost:3001**
   - Frontend web app starts on **http://localhost:3000**

### Development Accounts and Sender Fixtures

The seed creates the `admin` and `transport` accounts only when `SEED_ADMIN_PASSWORD` is set. It
activates mobile and ESP32 fixture sources only when both corresponding
`TRACKING_SOURCE_SECRET_*` values are set. There are no checked-in default credentials. If these
values change after the stack already exists, rerun the development seed against that local stack:

```bash
docker compose --env-file .env exec backend npx prisma db seed
```

This changes only the selected local Compose database. It is not a production provisioning method.
Production first-admin provisioning and release configuration are covered by the deployment runbook.

### Useful Docker Commands

```bash
# Start all services
docker compose --env-file .env up -d

# Stop all services
docker compose --env-file .env down

# Stop and remove all data (fresh start)
docker compose --env-file .env down -v

# View logs
docker compose --env-file .env logs -f              # All services
docker compose --env-file .env logs -f backend      # Backend only
docker compose --env-file .env logs -f db           # Database only

# Rebuild after code changes
docker compose --env-file .env up --build -d

# Run Prisma Studio (database GUI)
docker exec shuttle-backend npx prisma studio
```

---

## 🛠️ Manual Setup (Without Docker)

For local development without Docker.

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [PostgreSQL](https://www.postgresql.org/) with [PostGIS](https://postgis.net/) extension
- [Redis](https://redis.io/)

### Backend Setup

```bash
cd shuttle-tracking-backend

# Install dependencies
npm install

# Create your ignored local configuration, then replace the marked database and secret values.
cp .env.example .env

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd shuttle-tracking-web

# Install dependencies
npm install

# Create the ignored local frontend configuration.
cp .env.example .env.local

# Start development server
npm run dev
```

For manual development, set the backend database connection and the same local-only credentials
listed in the Docker table before running the seed. `shuttle-tracking-backend/.env.example` and
`shuttle-tracking-web/.env.example` document the complete component-specific contracts.

### Access the Application

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:3001

---

## Production Configuration

`env.production.example` is a schema for an access-controlled production environment file; it is
not a runnable production configuration. Replace every `REPLACE_WITH_...` value with independently
generated secrets, keep the real file outside Git with restricted permissions, and do not place
server credentials in `NEXT_PUBLIC_*` variables. The intended deployment uses one HTTPS origin:
the reverse proxy routes `/` to the frontend and `/api` plus `/socket.io` to the backend, so the
frontend needs no public backend override. Follow the
[deployment boundaries](docs/deployment.md) and
[server/network handoff](docs/operations/university-server-network-handoff.md) before any
production operation.

---

## 📁 Project Structure

```
TramTrackingSystem/
├── docker-compose.yml              # Docker orchestration
├── env.example                     # Local Docker Compose environment template
├── env.production.example          # Production configuration schema (no secrets)
├── docker/
│   └── init-postgis.sh             # PostGIS init script
├── shuttle-tracking-backend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh        # Auto migrate + seed on startup
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   ├── migrations/             # Migration files
│   │   └── seed.ts                 # Seed data
│   └── src/                        # Backend source code
└── shuttle-tracking-web/
    ├── Dockerfile
    ├── app/                        # Next.js app router pages
    ├── components/                 # React components
    └── services/                   # API service layer
```

---

## AI Agent Workflow

AI is used as an engineering team under a human engineering owner. The owner frames the problem,
acceptance criteria, design trade-offs, and merge/release decision; agents investigate, implement
approved work, test, and review.

```text
Problem → Analyze → Requirement + Acceptance Criteria → Design → Plan
        → Implement → Test → AI Review → Human Review → Commit / PR → CI/CD → Learn
```

Use the smallest useful role shape: a SWE agent for analysis/design, a coding agent for approved
implementation, a reviewer for independent findings, and a specialist only when the risk calls for
one. Specialists are a toolbox, not a mandatory pipeline.

- [Agent guide](AGENTS.md)
- [Engineering workflow](docs/engineering-workflow.md)
- [Active documentation map](docs/README.md)

Requirements and acceptance criteria may live in the conversation, issue, or pull request; do not
create a task document just to start ordinary work. Git history, PRs, tests, and CI are the primary
working record. Keep docs for stable product, architecture, deployment, runbook, research, and
decision knowledge.

Agents may discover problems, but discovery does not authorize implementation. Historical audit,
roadmap, task, and agent-workflow material is retained for provenance in
[`docs/archive/old-ai-workflow/`](docs/archive/old-ai-workflow/); it is not an active backlog.

## Contributing

- [Frontend Documentation](./shuttle-tracking-web/README.md)
- [Backend Documentation](./shuttle-tracking-backend/README.md)

## Authors

- **Narunat Suthhibut**: Full Stack Developer (Backend & Frontend Admin page)
- **SoraP**: Frontend Developer (Frontend Public page)
- **Paracetamol**: Mobile Developer (Tracking App)
