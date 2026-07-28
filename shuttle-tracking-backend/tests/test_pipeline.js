import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const rawApiUrl = process.env.API_URL || 'http://localhost:3001';
const BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const ESP32_SECRET = process.env.TRACKING_SOURCE_SECRET_ESP32;
const MOBILE_SECRET = process.env.TRACKING_SOURCE_SECRET_MOBILE;
const TTN_WEBHOOK_SECRET = process.env.TTN_WEBHOOK_SECRET;
const ESP_SOURCE_ID = process.env.TRACKING_SOURCE_ID_ESP32 || 'TS_ESP_01';
const ESP_VEHICLE_ID = process.env.TRACKING_VEHICLE_ID_ESP32 || 'VH001';
const MOBILE_SOURCE_ID = process.env.TRACKING_SOURCE_ID_MOBILE || 'TS_MOB_01';
const MOBILE_VEHICLE_ID = process.env.TRACKING_VEHICLE_ID_MOBILE || 'VH001';
const FOREIGN_MOBILE_SOURCE_ID = process.env.TRACKING_SOURCE_ID_MOBILE_2 || 'TS_MOB_02';
const FOREIGN_MOBILE_VEHICLE_ID = process.env.TRACKING_VEHICLE_ID_MOBILE_2 || 'VH002';
const TTN_DEVICE_ID = process.env.TTN_DEVICE_ID || 'sensor-c4';
const TTN_VEHICLE_ID = process.env.TTN_VEHICLE_ID || (TTN_DEVICE_ID === 'sensor-f2' ? 'VN002' : 'VH003');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testPipeline() {
  console.log('🏁 Starting pipeline integration tests...\n');

  try {
    if (!ADMIN_PASSWORD || !ESP32_SECRET || !MOBILE_SECRET || !TTN_WEBHOOK_SECRET || !process.env.JWT_SECRET) {
      throw new Error(
        'Set SEED_ADMIN_PASSWORD, JWT_SECRET, TRACKING_SOURCE_SECRET_ESP32, TRACKING_SOURCE_SECRET_MOBILE, and TTN_WEBHOOK_SECRET before running the pipeline test',
      );
    }

    async function assertSeedFixture(sourceId, vehicleId, type) {
      const source = await prisma.trackingSource.findUnique({
        where: { id: sourceId },
        select: { id: true, type: true, vehicleId: true, status: true },
      });
      if (!source || source.type !== type || source.vehicleId !== vehicleId || source.status !== 'active') {
        throw new Error(`Seed fixture mismatch for ${sourceId}; expected active ${type} source bound to ${vehicleId}`);
      }
    }

    await assertSeedFixture(ESP_SOURCE_ID, ESP_VEHICLE_ID, 'esp32');
    await assertSeedFixture(MOBILE_SOURCE_ID, MOBILE_VEHICLE_ID, 'mobile');
    await assertSeedFixture(FOREIGN_MOBILE_SOURCE_ID, FOREIGN_MOBILE_VEHICLE_ID, 'mobile');
    await assertSeedFixture(TTN_DEVICE_ID, TTN_VEHICLE_ID, 'lorawan');

    const assertSafeAcknowledgement = (label, body) => {
      const serialized = JSON.stringify(body);
      if (/secretHash|password|token|secret/i.test(serialized)) {
        throw new Error(`FAIL: ${label} acknowledgement contains credential material`);
      }
      if (!body?.canonicalLocation) {
        throw new Error(`FAIL: ${label} acknowledgement did not include canonicalLocation`);
      }
      const state = body.canonicalLocation;
      for (const field of ['schemaVersion', 'eventType', 'stateEpoch', 'stateVersion', 'vehicleId', 'serviceState', 'reasonCode', 'freshness', 'timing']) {
        if (state[field] === undefined) throw new Error(`FAIL: ${label} canonical state missing ${field}`);
      }
      if (state.schemaVersion !== 1 || state.eventType !== 'canonical_vehicle_state') {
        throw new Error(`FAIL: ${label} canonical state envelope is not CanonicalVehicleStateV1`);
      }
    };

    // ============================================
    // 0. Trust boundary checks
    // ============================================
    console.log('🛡️ [Auth] Verifying unauthenticated writes are rejected...');
    const unauthenticatedIngest = await fetch(`${BASE_URL}/ingest/http`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId: ESP_SOURCE_ID, lat: 13.964139, lng: 100.587520 }),
    });
    if (unauthenticatedIngest.status !== 401) {
      throw new Error(`FAIL: unauthenticated HTTP ingestion returned ${unauthenticatedIngest.status}`);
    }

    const unauthenticatedTrip = await fetch(`${BASE_URL}/trips/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId: MOBILE_VEHICLE_ID }),
    });
    if (unauthenticatedTrip.status !== 401) {
      throw new Error(`FAIL: unauthenticated trip start returned ${unauthenticatedTrip.status}`);
    }
    console.log('   ✅ Unauthenticated REST writes rejected.\n');

    // ============================================
    // 1. Admin Login to get token
    // ============================================
    console.log('🔐 [Auth] Attempting admin login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed with status: ${loginRes.status}`);
    }
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('   🟢 Admin login successful. Token acquired.\n');

    async function loginSender(sourceId, secret, vehicleId) {
      const senderRes = await fetch(`${BASE_URL}/auth/vehicle-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, secret, vehicleId }),
      });
      const senderData = await senderRes.json();
      if (!senderRes.ok || !senderData.token) {
        throw new Error(`Sender login failed with status ${senderRes.status}`);
      }
      return senderData.token;
    }

    const espSenderToken = await loginSender(ESP_SOURCE_ID, ESP32_SECRET, ESP_VEHICLE_ID);
    const mobileSenderToken = await loginSender(MOBILE_SOURCE_ID, MOBILE_SECRET, MOBILE_VEHICLE_ID);
    console.log('   🟢 Sender credentials issued.\n');

    // ============================================
    // 2. Negative sender boundary checks
    // ============================================
    console.log('🛡️ [Auth] Verifying invalid, expired, and mismatched sender writes...');
    const invalidTokenRes = await fetch(`${BASE_URL}/ingest/http`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer not-a-valid-sender-token',
      },
      body: JSON.stringify({ sourceId: ESP_SOURCE_ID, lat: 13.964139, lng: 100.587520 }),
    });
    if (invalidTokenRes.status !== 401) {
      throw new Error(`FAIL: invalid sender token returned ${invalidTokenRes.status}`);
    }

    const expiredToken = jwt.sign(
      { kind: 'sender', sourceId: ESP_SOURCE_ID, vehicleId: ESP_VEHICLE_ID, credentialVersion: 1 },
      process.env.JWT_SECRET,
      { expiresIn: -1 },
    );
    const expiredTokenRes = await fetch(`${BASE_URL}/trips/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${expiredToken}`,
      },
      body: JSON.stringify({ vehicleId: ESP_VEHICLE_ID }),
    });
    if (expiredTokenRes.status !== 401) {
      throw new Error(`FAIL: expired sender token returned ${expiredTokenRes.status}`);
    }

    const mismatchedSourceRes = await fetch(`${BASE_URL}/ingest/http`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${espSenderToken}`,
      },
      body: JSON.stringify({ sourceId: MOBILE_SOURCE_ID, lat: 13.964139, lng: 100.587520 }),
    });
    if (mismatchedSourceRes.status !== 403) {
      throw new Error(`FAIL: source ownership mismatch returned ${mismatchedSourceRes.status}`);
    }

    const mismatchedVehicleRes = await fetch(`${BASE_URL}/trips/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${espSenderToken}`,
      },
      body: JSON.stringify({ vehicleId: FOREIGN_MOBILE_VEHICLE_ID }),
    });
    if (mismatchedVehicleRes.status !== 403) {
      throw new Error(`FAIL: vehicle ownership mismatch returned ${mismatchedVehicleRes.status}`);
    }

    const foreignSenderToken = await loginSender(FOREIGN_MOBILE_SOURCE_ID, MOBILE_SECRET, FOREIGN_MOBILE_VEHICLE_ID);
    let foreignTrip = await prisma.trip.findFirst({
      where: { vehicleId: FOREIGN_MOBILE_VEHICLE_ID, status: 'in_progress' },
      select: { id: true },
    });
    let createdForeignTrip = false;
    if (!foreignTrip) {
      const foreignStartRes = await fetch(`${BASE_URL}/trips/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${foreignSenderToken}`,
        },
        body: JSON.stringify({ vehicleId: FOREIGN_MOBILE_VEHICLE_ID }),
      });
      const foreignStartData = await foreignStartRes.json();
      if (!foreignStartRes.ok || !foreignStartData.trip?.id) {
        throw new Error(`FAIL: could not create foreign trip fixture (HTTP ${foreignStartRes.status})`);
      }
      foreignTrip = { id: foreignStartData.trip.id };
      createdForeignTrip = true;
    }

    const mismatchedTripRes = await fetch(`${BASE_URL}/trips/${foreignTrip.id}/end`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${mobileSenderToken}` },
    });
    if (mismatchedTripRes.status !== 403) {
      throw new Error(`FAIL: trip ownership mismatch returned ${mismatchedTripRes.status}`);
    }

    if (createdForeignTrip) {
      const cleanupRes = await fetch(`${BASE_URL}/trips/${foreignTrip.id}/end`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${foreignSenderToken}` },
      });
      if (!cleanupRes.ok) {
        throw new Error(`FAIL: could not clean up foreign trip fixture (${cleanupRes.status})`);
      }
    }

    const invalidTtnSecretRes = await fetch(`${BASE_URL}/ingest/ttn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-ttn-secret',
      },
      body: JSON.stringify({}),
    });
    if (invalidTtnSecretRes.status !== 401) {
      throw new Error(`FAIL: invalid TTN secret returned ${invalidTtnSecretRes.status}`);
    }
    console.log('   ✅ Invalid, expired, and mismatched sender writes rejected.\n');

    // ============================================
    // 3. Test Ingest ESP32 Location (HTTP REST)
    // ============================================
    console.log('📡 [Ingest] Sending ESP32 location (Priority 2)...');
    const espRes = await fetch(`${BASE_URL}/ingest/http`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${espSenderToken}`,
      },
      body: JSON.stringify({
        sourceId: ESP_SOURCE_ID,
        lat: 13.964139,
        lng: 100.587520,
        speed: 5.5,
        bearing: 180.0,
        station: 'Building 2'
      })
    });

    const espData = await espRes.json();
    if (!espRes.ok) {
      throw new Error(`ESP32 Ingestion failed with status ${espRes.status}`);
    }
    assertSafeAcknowledgement('ESP32', espData);
    if (espData.canonicalLocation.sourceType !== 'esp32') {
      throw new Error(`FAIL: ESP32 acknowledgement selected ${espData.canonicalLocation.sourceType}`);
    }
    console.log('   🟢 ESP32 Ingestion status:', espRes.status);
    console.log('   🟢 Canonical Location selected:', espData.canonicalLocation.liveLocation?.lat, espData.canonicalLocation.liveLocation?.lng);
    console.log('   🟢 Selected Device Type:', espData.canonicalLocation.sourceType, '\n');

    // ============================================
    // 4. Test Ingest TTN Webhook (LoRaWAN)
    // ============================================
    console.log('📡 [Ingest] Sending mock TTN Webhook payload...');
    if (!TTN_WEBHOOK_SECRET) {
      throw new Error('TTN_WEBHOOK_SECRET must be set to run the TTN integration check');
    }
    const ttnRes = await fetch(`${BASE_URL}/ingest/ttn`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TTN_WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({
        end_device_ids: {
          device_id: TTN_DEVICE_ID,
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
      throw new Error(`TTN Webhook failed with status ${ttnRes.status}`);
    }
    assertSafeAcknowledgement('TTN', ttnData);
    if (
      ttnData.canonicalLocation.sourceId !== TTN_DEVICE_ID ||
      ttnData.canonicalLocation.sourceType !== 'lorawan'
    ) {
      throw new Error(`FAIL: TTN acknowledgement did not select ${TTN_DEVICE_ID} as lorawan source`);
    }
    console.log('   🟢 TTN Webhook status:', ttnRes.status);
    console.log('   🟢 Canonical Location selected:', ttnData.canonicalLocation.liveLocation?.lat, ttnData.canonicalLocation.liveLocation?.lng);
    console.log('   🟢 Selected Device Type:', ttnData.canonicalLocation.sourceType, '\n');

    // ============================================
    // 5. Multi-Source Priority Conflict Test
    // ============================================
    console.log('📡 [Priority Test] Sending Mobile location (Priority 1)...');
    const mobRes = await fetch(`${BASE_URL}/ingest/http`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mobileSenderToken}`,
      },
      body: JSON.stringify({
        sourceId: MOBILE_SOURCE_ID,
        lat: 13.963993,
        lng: 100.587064,
        speed: 1.0,
        bearing: 90.0,
        station: 'Building 3'
      })
    });

    const mobData = await mobRes.json();
    if (!mobRes.ok) {
      throw new Error(`Mobile Ingestion failed with status ${mobRes.status}`);
    }
    assertSafeAcknowledgement('Mobile', mobData);
    if (mobData.canonicalLocation.sourceId !== MOBILE_SOURCE_ID || mobData.canonicalLocation.sourceType !== 'mobile') {
      throw new Error(`FAIL: Mobile acknowledgement did not select ${MOBILE_SOURCE_ID} as mobile source`);
    }
    console.log('   🟢 Mobile Ingestion status:', mobRes.status);
    console.log('   🟢 Selected Device Type:', mobData.canonicalLocation.sourceType);
    console.log('   🟢 Selected Coordinates:', mobData.canonicalLocation.liveLocation?.lat, mobData.canonicalLocation.liveLocation?.lng, '\n');

    // Fetch active vehicles from Public API to verify current location maps
    console.log('🔍 [Public API] Fetching active vehicles...');
    const vehRes = await fetch(`${BASE_URL}/public/active-vehicles`);
    const vehicles = await vehRes.json();
    const targetVehicle = vehicles.find((v) => v.id === MOBILE_VEHICLE_ID);
    if (!targetVehicle) {
      throw new Error(`FAIL: ${MOBILE_VEHICLE_ID} was not returned by the public API`);
    }
    console.log(`   🟢 ${MOBILE_VEHICLE_ID} Position in Public API: lat=${targetVehicle.state?.liveLocation?.lat}, lng=${targetVehicle.state?.liveLocation?.lng}`);
    console.log(`   🟢 Sourced from: ${targetVehicle.state?.sourceType} (Priority Winner)`);
    if (targetVehicle.state?.sourceType !== 'mobile' || targetVehicle.state?.serviceState !== 'live') {
      throw new Error(`FAIL: Mobile should be the priority winner for ${MOBILE_VEHICLE_ID}!`);
    }
    console.log('   ✅ Priority routing works correctly.\n');

    // ============================================
    // 6. Developer Analytics Logs Check
    // ============================================
    console.log('📊 [Analytics] Retrieving developer selection metrics...');
    const anaRes = await fetch(`${BASE_URL}/admin/devices/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const analytics = await anaRes.json();
    console.log('   🟢 Received Analytics Metrics:');
    console.log(JSON.stringify(analytics, null, 2));
    
    const targetVehicleAnalytics = analytics.find(a => a.vehicleId === MOBILE_VEHICLE_ID);
    if (!targetVehicleAnalytics || Object.keys(targetVehicleAnalytics.selectionCounts).length === 0) {
      throw new Error('FAIL: Selection counters are empty!');
    }
    console.log('   ✅ Analytics logging successfully verified.\n');

    // ============================================
    // 7. DB History Sample Check
    // ============================================
    console.log('🗄️ [Database] Verifying auto-created virtual trip...');
    const tripRes = await prisma.trip.findMany({
      where: { vehicleId: MOBILE_VEHICLE_ID },
      include: { gpsTracks: true }
    });
    
    console.log(`   🟢 Database query returned ${tripRes.length} trips for ${MOBILE_VEHICLE_ID}.`);
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
