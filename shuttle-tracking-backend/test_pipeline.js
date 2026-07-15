import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:3001/api';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testPipeline() {
  console.log('🏁 Starting pipeline integration tests...\n');

  try {
    // ============================================
    // 1. Admin Login to get token
    // ============================================
    console.log('🔐 [Auth] Attempting admin login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed with status: ${loginRes.status}`);
    }
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('   🟢 Admin login successful. Token acquired.\n');

    // ============================================
    // 2. Test Ingest ESP32 Location (HTTP REST)
    // ============================================
    console.log('📡 [Ingest] Sending ESP32 location (Priority 2)...');
    const espRes = await fetch(`${BASE_URL}/ingest/http`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: 'TS_ESP_01',
        token: 'esp32_secret_key',
        lat: 13.964139,
        lng: 100.587520,
        speed: 5.5,
        bearing: 180.0,
        station: 'Building 2'
      })
    });

    const espData = await espRes.json();
    if (!espRes.ok) {
      throw new Error(`ESP32 Ingestion failed: ${JSON.stringify(espData)}`);
    }
    console.log('   🟢 ESP32 Ingestion status:', espRes.status);
    console.log('   🟢 Canonical Location selected:', espData.canonicalLocation.lat, espData.canonicalLocation.lng);
    console.log('   🟢 Selected Device Type:', espData.canonicalLocation.sourceType, '\n');

    // ============================================
    // 3. Test Ingest TTN Webhook (LoRaWAN)
    // ============================================
    console.log('📡 [Ingest] Sending mock TTN Webhook payload...');
    const ttnRes = await fetch(`${BASE_URL}/ingest/ttn`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        end_device_ids: {
          device_id: 'TS_LORA_01',
          application_ids: {
            application_id: 'rsu-shuttle-app'
          }
        },
        uplink_message: {
          decoded_payload: {
            latitude: 13.964772,
            longitude: 100.587563,
            speed: 12.0,
            bearing: 45.0,
            station: 'Entrance Gate'
          },
          received_at: new Date().toISOString()
        }
      })
    });

    const ttnData = await ttnRes.json();
    if (!ttnRes.ok) {
      throw new Error(`TTN Webhook failed: ${JSON.stringify(ttnData)}`);
    }
    console.log('   🟢 TTN Webhook status:', ttnRes.status);
    console.log('   🟢 Canonical Location selected:', ttnData.canonicalLocation.lat, ttnData.canonicalLocation.lng);
    console.log('   🟢 Selected Device Type:', ttnData.canonicalLocation.sourceType, '\n');

    // ============================================
    // 4. Multi-Source Priority Conflict Test
    // ============================================
    console.log('📡 [Priority Test] Sending Mobile location (Priority 1)...');
    const mobRes = await fetch(`${BASE_URL}/ingest/http`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: 'TS_MOB_01',
        token: 'mobile_secret_key',
        lat: 13.963993,
        lng: 100.587064,
        speed: 1.0,
        bearing: 90.0,
        station: 'Building 3'
      })
    });

    const mobData = await mobRes.json();
    if (!mobRes.ok) {
      throw new Error(`Mobile Ingestion failed: ${JSON.stringify(mobData)}`);
    }
    console.log('   🟢 Mobile Ingestion status:', mobRes.status);
    console.log('   🟢 Selected Device Type:', mobData.canonicalLocation.sourceType);
    console.log('   🟢 Selected Coordinates:', mobData.canonicalLocation.lat, mobData.canonicalLocation.lng, '\n');

    // Fetch active vehicles from Public API to verify current location maps
    console.log('🔍 [Public API] Fetching active vehicles...');
    const vehRes = await fetch(`${BASE_URL}/public/active-vehicles`);
    const vehicles = await vehRes.json();
    const vh001 = vehicles.find((v) => v.id === 'VH001');
    console.log(`   🟢 VH001 Position in Public API: lat=${vh001.location?.lat}, lng=${vh001.location?.lng}`);
    console.log(`   🟢 Sourced from: ${vh001.location?.sourceType} (Priority Winner)`);
    if (vh001.location?.sourceType !== 'mobile') {
      throw new Error('FAIL: Mobile should be the priority winner for VH001!');
    }
    console.log('   ✅ Priority routing works correctly.\n');

    // ============================================
    // 5. Developer Analytics Logs Check
    // ============================================
    console.log('📊 [Analytics] Retrieving developer selection metrics...');
    const anaRes = await fetch(`${BASE_URL}/admin/devices/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const analytics = await anaRes.json();
    console.log('   🟢 Received Analytics Metrics:');
    console.log(JSON.stringify(analytics, null, 2));
    
    const vh001Analytics = analytics.find(a => a.vehicleId === 'VH001');
    if (!vh001Analytics || Object.keys(vh001Analytics.selectionCounts).length === 0) {
      throw new Error('FAIL: Selection counters are empty!');
    }
    console.log('   ✅ Analytics logging successfully verified.\n');

    // ============================================
    // 6. DB History Sample Check
    // ============================================
    console.log('🗄️ [Database] Verifying auto-created virtual trip...');
    const tripRes = await prisma.trip.findMany({
      where: { vehicleId: 'VH001' },
      include: { gpsTracks: true }
    });
    
    console.log(`   🟢 Database query returned ${tripRes.length} trips for VH001.`);
    for (const trip of tripRes) {
      console.log(`   🟢 Trip ${trip.id}: startTime=${trip.startTime}, status=${trip.status}, tracksCount=${trip.gpsTracks.length}`);
    }
    
    const hasActiveVirtualTrip = tripRes.some(t => t.status === 'in_progress');
    if (!hasActiveVirtualTrip) {
      throw new Error('FAIL: Auto-Trip did not create a virtual active trip session!');
    }
    console.log('   ✅ Auto-Trip and Database History writing verified.\n');

    console.log('🎉 All pipeline integration tests PASSED successfully!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testPipeline();
