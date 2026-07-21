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

2. **Create your `.env` file** from the template:
   ```bash
   cp env.example .env
   ```
   Then edit `.env` and set your desired values:
   ```env
   POSTGRES_USER=shuttle_user
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=shuttle_tracking_backend
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=8h
   SENDER_JWT_EXPIRES_IN=15m
   TTN_WEBHOOK_SECRET=your_ttn_webhook_secret
   ```

3. **Start all services**:
   ```bash
   docker compose up --build -d
   ```

4. **That's it!** 🎉 The following happens automatically:
   - PostgreSQL + PostGIS database is created
   - Redis cache is started
   - Database migrations are applied
   - Seed data is populated (admin users, routes, stops, vehicles)
   - Backend API server starts on **http://localhost:3001**
   - Frontend web app starts on **http://localhost:3000**

### Default Admin Credentials

| Username | Password |
|---|---|
| `admin` | `admin123` |
| `transport` | `admin123` |

> ⚠️ **Change these passwords** in a production environment.

### Useful Docker Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Stop and remove all data (fresh start)
docker compose down -v

# View logs
docker compose logs -f              # All services
docker compose logs -f backend      # Backend only
docker compose logs -f db           # Database only

# Rebuild after code changes
docker compose up --build -d

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

# Create .env file with your database connection
cat > .env << 'EOF'
DATABASE_URL="postgres://your_user@localhost:5432/shuttle_tracking_backend?schema=public"
REDIS_URL="redis://localhost:6379"
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:3000
EOF

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

# Start development server
npm run dev
```

### Access the Application

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:3001

---

## 📁 Project Structure

```
TramTrackingSystem/
├── docker-compose.yml              # Docker orchestration
├── .env.example                    # Environment template
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

## Contributing

- [Frontend Documentation](./shuttle-tracking-web/README.md)
- [Backend Documentation](./shuttle-tracking-backend/README.md)

## Authors

- **Narunat Suthhibut**: Full Stack Developer (Backend & Frontend Admin page)
- **SoraP**: Frontend Developer (Frontend Public page)
- **Paracetamol**: Mobile Developer (Tracking App)
