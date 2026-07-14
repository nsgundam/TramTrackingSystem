import 'dotenv/config';
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
    await prisma.$executeRaw `
    INSERT INTO stops (id, name_th, name_en, location, status)
    VALUES 
      ('ST001', 'ประตูทางเข้า', 'Entrance Gate', 
        ST_SetSRID(ST_MakePoint(100.587563, 13.964772), 4326)::geography, 'active'),
      ('ST002', 'ตึก 2', 'Building 2',
        ST_SetSRID(ST_MakePoint(100.587520, 13.964139), 4326)::geography, 'active'),
      ('ST003', 'ตึก 3', 'Building 3',
        ST_SetSRID(ST_MakePoint(100.587064, 13.963993), 4326)::geography, 'active'),
      ('ST004', 'ตึก 4', 'Building 4',
        ST_SetSRID(ST_MakePoint(100.586536, 13.963872), 4326)::geography, 'active'),
      ('ST005', 'ตึก 5', 'Building 5',
        ST_SetSRID(ST_MakePoint(100.586054, 13.964597), 4326)::geography, 'active'),
      ('ST006', 'ตึก 8', 'Building 8',
        ST_SetSRID(ST_MakePoint(100.585904, 13.965161), 4326)::geography, 'active'),
      ('ST007', 'ตึก 9', 'Building 9',
        ST_SetSRID(ST_MakePoint(100.585705, 13.965936), 4326)::geography, 'active'),
      ('ST008', 'ตึก 12/1', 'Building 12/1',
        ST_SetSRID(ST_MakePoint(100.585528, 13.966800), 4326)::geography, 'active'),
      ('ST009', 'ตรงข้ามตึก 15', 'Building 15 Opposite',
        ST_SetSRID(ST_MakePoint(100.585251, 13.967780), 4326)::geography, 'active'),
      ('ST010', 'ตึก 17', 'Building 17',
        ST_SetSRID(ST_MakePoint(100.583580, 13.966698), 4326)::geography, 'active'),
      ('ST011', 'ตึก 19', 'Building 19',
        ST_SetSRID(ST_MakePoint(100.583931, 13.968760), 4326)::geography, 'active'),
      ('ST012', 'ตึก 15', 'Building 15',
        ST_SetSRID(ST_MakePoint(100.585420, 13.967890), 4326)::geography, 'active'),
      ('ST013', 'ตึก 14', 'Building 14',
        ST_SetSRID(ST_MakePoint(100.587314, 13.968172), 4326)::geography, 'active'),
      ('ST014', 'ตึก 11', 'Building 11',
        ST_SetSRID(ST_MakePoint(100.586858, 13.966451), 4326)::geography, 'active'),
      ('ST015', 'ประตูทางออก', 'Exit Gate',
        ST_SetSRID(ST_MakePoint(100.587415, 13.965706), 4326)::geography, 'active'),
      ('ST016', 'หน้ามหาลัย', 'In Front of University',
        ST_SetSRID(ST_MakePoint(100.58819699970225, 13.965902204996306), 4326)::geography, 'active'),
      ('ST017', 'สถานีรถไฟ', 'Train Station',
        ST_SetSRID(ST_MakePoint(100.60652965027926, 13.967223880576825), 4326)::geography, 'active')
    ON CONFLICT (id) DO NOTHING
  `;
    // Create route-stop assignments
    await prisma.routeStop.createMany({
        data: [
            // R01: Circular route
            { routeId: 'R01', stopId: 'ST001', stopOrder: 6 },
            { routeId: 'R01', stopId: 'ST002', stopOrder: 7 },
            { routeId: 'R01', stopId: 'ST003', stopOrder: 8 },
            { routeId: 'R01', stopId: 'ST004', stopOrder: 9 },
            { routeId: 'R01', stopId: 'ST005', stopOrder: 10 },
            { routeId: 'R01', stopId: 'ST006', stopOrder: 11 },
            { routeId: 'R01', stopId: 'ST007', stopOrder: 12 },
            { routeId: 'R01', stopId: 'ST008', stopOrder: 13 },
            { routeId: 'R01', stopId: 'ST009', stopOrder: 14 },
            { routeId: 'R01', stopId: 'ST010', stopOrder: 15 },
            { routeId: 'R01', stopId: 'ST011', stopOrder: 1 },
            { routeId: 'R01', stopId: 'ST012', stopOrder: 2 },
            { routeId: 'R01', stopId: 'ST013', stopOrder: 3 },
            { routeId: 'R01', stopId: 'ST014', stopOrder: 4 },
            { routeId: 'R01', stopId: 'ST015', stopOrder: 5 },
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
    // Create tracking sources (Devices)
    const espHash = await bcrypt.hash('esp32_secret_key', 12);
    const mobHash = await bcrypt.hash('mobile_secret_key', 12);
    await prisma.trackingSource.createMany({
        data: [
            { id: 'TS_MOB_01', name: 'คนขับมือถือ A1', type: 'mobile', vehicleId: 'VH001', priority: 1, secretHash: mobHash },
            { id: 'TS_ESP_01', name: 'ESP32 กล่อง A1', type: 'esp32', vehicleId: 'VH001', priority: 2, secretHash: espHash },
            { id: 'TS_LORA_01', name: 'LoRa Node A1', type: 'lorawan', vehicleId: 'VH001', priority: 3, secretHash: null },
            { id: 'TS_MOB_02', name: 'คนขับมือถือ A2', type: 'mobile', vehicleId: 'VH002', priority: 1, secretHash: mobHash },
            { id: 'TS_ESP_02', name: 'ESP32 กล่อง A2', type: 'esp32', vehicleId: 'VH002', priority: 2, secretHash: espHash },
            { id: 'TS_MOB_03', name: 'คนขับมือถือ A3', type: 'mobile', vehicleId: 'VH003', priority: 1, secretHash: mobHash },
            { id: 'TS_ESP_N1', name: 'ESP32 รถตู้ 1', type: 'esp32', vehicleId: 'VN001', priority: 1, secretHash: espHash },
            { id: 'TS_LORA_N2', name: 'LoRa รถตู้ 2', type: 'lorawan', vehicleId: 'VN002', priority: 1, secretHash: null },
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
