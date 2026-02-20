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
      { id: 'R03', name: 'มหาลัย-ฟิวเจอร์', color: '#10B981', status: 'inactive' },
    ],
    skipDuplicates: true,
  });

  // Create stops (using raw SQL for PostGIS)
  await prisma.$executeRaw`
    INSERT INTO stops (id, name_th, name_en, location, status)
    VALUES 
      ('ST001', 'ป้าย A - ประตูทางเข้า', 'Stop A - Entrance Gate', 
        ST_SetSRID(ST_MakePoint(100.587563, 13.964772), 4326)::geography, 'active'),
      ('ST002', 'ป้าย B - ตึก 2', 'Stop B - Buitding 2',
        ST_SetSRID(ST_MakePoint(100.587520, 13.964139), 4326)::geography, 'active'),
      ('ST003', 'ป้าย C - ตึก 3', 'Stop C - Buitding 3',
        ST_SetSRID(ST_MakePoint(100.587064, 13.963993), 4326)::geography, 'active'),
      ('ST004', 'ป้าย D - ตึก 4', 'Stop D - Building 4',
        ST_SetSRID(ST_MakePoint(100.586536, 13.963872), 4326)::geography, 'active'),
      ('ST005', 'ป้าย E - ตึก 5', 'Stop E - Buitding 5',
        ST_SetSRID(ST_MakePoint(100.586054, 13.964597), 4326)::geography, 'active'),
      ('ST006', 'ป้าย F - ตึก 8', 'Stop F - Building 8',
        ST_SetSRID(ST_MakePoint(100.585904, 13.965161), 4326)::geography, 'active'),
      ('ST007', 'ป้าย G - ตึก 9', 'Stop G - Building 9',
        ST_SetSRID(ST_MakePoint(100.585705, 13.965936), 4326)::geography, 'active'),
      ('ST008', 'ป้าย H - ตึก 12/1', 'Stop H - Building 12/1',
        ST_SetSRID(ST_MakePoint(100.585528, 13.966800), 4326)::geography, 'active'),
      ('ST009', 'ป้าย I - ตรงข้ามตึก 15', 'Stop I - Building 15 Opposite',
        ST_SetSRID(ST_MakePoint(100.585251, 13.967780), 4326)::geography, 'active'),
      ('ST010', 'ป้าย J - ตึก 17', 'Stop J - Building 17',
        ST_SetSRID(ST_MakePoint(100.583580, 13.966698), 4326)::geography, 'active'),
      ('ST011', 'ป้าย K - ตึก 19', 'Stop K - Building 19',
        ST_SetSRID(ST_MakePoint(100.583931, 13.968760), 4326)::geography, 'active'),
      ('ST012', 'ป้าย L - ตึก 15', 'Stop L - Building 15',
        ST_SetSRID(ST_MakePoint(100.585420, 13.967890), 4326)::geography, 'active'),
      ('ST013', 'ป้าย M - ตึก 14', 'Stop M - Building 14',
        ST_SetSRID(ST_MakePoint(100.587314, 13.968172), 4326)::geography, 'active'),
      ('ST014', 'ป้าย N - ตึก 11', 'Stop N - Building 11',
        ST_SetSRID(ST_MakePoint(100.586858, 13.966451), 4326)::geography, 'active'),
      ('ST015', 'ป้าย O - ประตูทางออก', 'Stop O - Exit Gate',
        ST_SetSRID(ST_MakePoint(100.587415, 13.965706), 4326)::geography, 'active'),
      ('ST016', 'หน้ามหาลัย', 'In Front of University',
        ST_SetSRID(ST_MakePoint(100.587800, 13.965200), 4326)::geography, 'active'),
      ('ST017', 'สถานีรถไฟ', 'Train Station',
        ST_SetSRID(ST_MakePoint(100.588200, 13.964800), 4326)::geography, 'active')
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
      { routeId: 'R01', stopId: 'ST006', stopOrder: 6 },
      { routeId: 'R01', stopId: 'ST007', stopOrder: 7 },
      { routeId: 'R01', stopId: 'ST008', stopOrder: 8 },
      { routeId: 'R01', stopId: 'ST009', stopOrder: 9 },
      { routeId: 'R01', stopId: 'ST010', stopOrder: 10 },
      { routeId: 'R01', stopId: 'ST011', stopOrder: 11 },
      { routeId: 'R01', stopId: 'ST012', stopOrder: 12 },
      { routeId: 'R01', stopId: 'ST013', stopOrder: 13 },
      { routeId: 'R01', stopId: 'ST014', stopOrder: 14 },
      { routeId: 'R01', stopId: 'ST015', stopOrder: 15 },
      // R02: Linear route
      { routeId: 'R02', stopId: 'ST016', stopOrder: 1 },
      { routeId: 'R02', stopId: 'ST017', stopOrder: 2 },
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