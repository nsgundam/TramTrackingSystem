import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from 'bcrypt';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin users
  const hashedPassword = await bcrypt.hash('admin123', 12);

  await prisma.user.createMany({
    data: [
      { username: 'admin', passwordHash: hashedPassword },
      { username: 'transport', passwordHash: hashedPassword },
    ],
    skipDuplicates: true,
  });

  // Create routes
  await prisma.route.createMany({
    data: [
      { id: 'R01', name: 'วนภายในมหาลัย', color: '#EF4444', status: 'active' },
      { id: 'R02', name: 'สถานีรถไฟ-มหาลัย', color: '#3B82F6', status: 'active' },
      { id: 'R03', name: 'หอพัก-คณะวิศวะ', color: '#10B981', status: 'inactive' },
    ],
    skipDuplicates: true,
  });

  // Create stops (using raw SQL for PostGIS)
  await prisma.$executeRaw`
    INSERT INTO stops (id, name_th, name_en, location, status)
    VALUES 
      ('ST001', 'ป้าย A - ประตู 1', 'Stop A - Gate 1', 
        ST_SetSRID(ST_MakePoint(100.5332, 13.7365), 4326)::geography, 'active'),
      ('ST002', 'ป้าย B - โรงอาหาร', 'Stop B - Canteen',
        ST_SetSRID(ST_MakePoint(100.5342, 13.7375), 4326)::geography, 'active'),
      ('ST003', 'ป้าย C - หอสมุด', 'Stop C - Library',
        ST_SetSRID(ST_MakePoint(100.5352, 13.7385), 4326)::geography, 'active'),
      ('ST004', 'ป้าย D - คณะวิทย์', 'Stop D - Science',
        ST_SetSRID(ST_MakePoint(100.5362, 13.7395), 4326)::geography, 'active'),
      ('ST005', 'ป้าย E - สนามกีฬา', 'Stop E - Stadium',
        ST_SetSRID(ST_MakePoint(100.5372, 13.7405), 4326)::geography, 'active')
    ON CONFLICT (id) DO NOTHING
  `;

  // Create route-stop assignments
  await prisma.routeStop.createMany({
    data: [
      // R01: Circular route
      { routeId: 'R01', stopId: 'ST001', stopOrder: 1 },
      { routeId: 'R01', stopId: 'ST002', stopOrder: 2 },
      { routeId: 'R01', stopId: 'ST003', stopOrder: 3 },
      { routeId: 'R01', stopId: 'ST004', stopOrder: 4 },
      { routeId: 'R01', stopId: 'ST005', stopOrder: 5 },
      // R02: Linear route
      { routeId: 'R02', stopId: 'ST001', stopOrder: 1 },
      { routeId: 'R02', stopId: 'ST003', stopOrder: 2 },
      { routeId: 'R02', stopId: 'ST005', stopOrder: 3 },
    ],
    skipDuplicates: true,
  });

  // Create vehicles
  await prisma.vehicle.createMany({
    data: [
      { id: 'VH001', name: 'รถ A1', type: '1-ตอน', assignedRouteId: 'R01' },
      { id: 'VH002', name: 'รถ A2', type: '1-ตอน', assignedRouteId: 'R01' },
      { id: 'VH003', name: 'รถ A3', type: '2-ตอน', assignedRouteId: 'R01' },
      { id: 'VN001', name: 'รถสถานี 1', type: 'รถตู้', assignedRouteId: 'R02' },
      { id: 'VN002', name: 'รถสถานี 2', type: 'รถตู้', assignedRouteId: 'R02' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });