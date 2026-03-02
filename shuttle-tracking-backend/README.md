# 🚌 University Shuttle Tracking System (Backend)

Backend API 

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (with PostGIS extension)
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Token)
- **Real-time:** Socket.io (Coming soon)

---

## Getting Started

### 1. Prerequisites (สิ่งที่ต้องมี)
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- **PostGIS Extension** (สำคัญมาก! ต้องติดตั้งใน database ก่อน)

### 2. Installation

```bash
# Clone repository
git clone <your-repo-url>
cd shuttle-tracking-backend

# Install dependencies
npm install
```

### 3. Environment Setup
สร้างไฟล์ .env ที่ root folder และกำหนดค่าดังนี้:

```Code snippet
# Database Connection String
# รูปแบบ: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/shuttle_tracking?schema=public"

# Server Port
PORT=3001

# JWT Secret Key 
JWT_SECRET="super-secret-key-change-this"

# CORS Origin (Frontend URL)
CORS_ORIGIN="http://localhost:3000"
```

### 4.Database Setup

```bash
# 1. สร้าง Database ใน PostgreSQL (ถ้ายังไม่มี)
createdb shuttle_tracking

# 2. เชื่อมต่อ Database และเปิดใช้งาน PostGIS Extension
# (รันคำสั่งนี้ใน SQL Query Tool หรือ pgAdmin)
CREATE EXTENSION postgis;

npx prisma generate

# 3. Run Prisma Migration (สร้างตาราง)
npx prisma migrate dev --name init

# 4. Run Seed Data (สร้างข้อมูลตัวอย่าง: Admin, Routes, Vehicles)
npm run db:seed
```

### 5.Running the Server

```bash
# Development mode (with hot-reload)
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Authentication

POST	/api/auth/login	   Login เพื่อรับ JWT Token
GET	    /api/auth/me	   ดูข้อมูลผู้ใช้งานปัจจุบัน         Auth Required


### Vehicles

GET     /api/admin/vehicles       ดูรายชื่อรถทั้งหมด
GET     /api/admin/vehicles/:id   ดูรายละเอียดรถรายคัน
POST    /api/admin/vehicles,      เพิ่มรถใหม่                Auth Required
PUT     /api/admin/vehicles/:id   แก้ไขข้อมูลรถ              Auth Required
DELETE  /api/admin/vehicles/:id   ลบรถ                    Auth Required


### Routes

GET     /api/admin/routes         ดูเส้นทางทั้งหมด
GET     /api/admin/routes/:id,    ดูรายละเอียดเส้นทาง
GET      /api/admin/routes/:id/vehicles   ดูรถที่วิ่งในเส้นทางนี้
POST    /api/admin/routes        สร้างเส้นทางใหม่          Auth Required
PUT     /api/admin/routes/:id    แก้ไขเส้นทาง             Auth Required
DELETE  /api/admin/routes/:id    ลบเส้นทาง               Auth Required

### Stops

GET     /api/admin/stops         ดูป้ายรถทั้งหมด
GET     /api/admin/stops/:id     ดูรายละเอียดป้าย
POST    /api/admin/stops         สร้างป้ายใหม่ (ต้องส่ง lat, lng) Auth Required
PUT     /api/admin/stops/:id     แก้ไขป้าย (รองรับ Partial Update) Auth Required
DELETE  /api/admin/stops/:id     ลบป้าย                   Auth Required


## Authors

- Narunat Suthhibut - Full Stack Developer
