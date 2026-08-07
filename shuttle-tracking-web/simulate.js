import { io } from 'socket.io-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const simulatorDirectory = path.dirname(fileURLToPath(import.meta.url));
const rawBackendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const normalizedBackendUrl = rawBackendUrl.replace(/\/+$/, '');
const API_URL = normalizedBackendUrl.endsWith('/api') ? normalizedBackendUrl : `${normalizedBackendUrl}/api`;
const SOCKET_URL = process.env.SOCKET_URL || API_URL.replace(/\/api\/?$/, '');
const VEHICLE_ID = process.env.TRACKING_VEHICLE_ID_MOBILE || 'VH001';
const SOURCE_ID = process.env.TRACKING_SOURCE_ID_MOBILE || 'TS_MOB_01';
const SOURCE_SECRET = process.env.TRACKING_SOURCE_SECRET_MOBILE?.trim();
const RUN_ONCE = process.argv.includes('--once');

const STATIONS = [
  { id: 'ST001', lng: 100.587563, lat: 13.964772 },
  { id: 'ST002', lng: 100.587520, lat: 13.964139 },
  { id: 'ST003', lng: 100.587064, lat: 13.963993 },
  { id: 'ST004', lng: 100.586536, lat: 13.963872 },
  { id: 'ST005', lng: 100.586054, lat: 13.964597 },
  { id: 'ST006', lng: 100.585904, lat: 13.965161 },
  { id: 'ST007', lng: 100.585705, lat: 13.965936 },
  { id: 'ST008', lng: 100.585528, lat: 13.966800 },
  { id: 'ST009', lng: 100.585251, lat: 13.967780 },
  { id: 'ST010', lng: 100.583580, lat: 13.966698 },
  { id: 'ST011', lng: 100.583931, lat: 13.968760 },
  { id: 'ST012', lng: 100.585420, lat: 13.967890 },
  { id: 'ST013', lng: 100.587314, lat: 13.968172 },
  { id: 'ST014', lng: 100.586858, lat: 13.966451 },
  { id: 'ST015', lng: 100.587415, lat: 13.965706 },
];

const socket = io(SOCKET_URL, { autoConnect: false, reconnection: true });
let senderToken = null;
let tripId = null;

socket.on('connect', () => {
  console.log(`🟢 Connected to WebSocket server with ID: ${socket.id}`);
});

socket.on('disconnect', () => {
  console.log('🔴 Disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket Connection Error:', error.message);
});

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateFineRoute(rawCoords, stepSizeMeters) {
  const fineCoords = [];
  for (let i = 0; i < rawCoords.length - 1; i++) {
    const start = { lat: rawCoords[i][0], lng: rawCoords[i][1] };
    const end = { lat: rawCoords[i + 1][0], lng: rawCoords[i + 1][1] };
    const dist = getDistance(start.lat, start.lng, end.lat, end.lng);
    
    fineCoords.push(start);
    if (dist > stepSizeMeters) {
      const steps = Math.floor(dist / stepSizeMeters);
      for (let j = 1; j < steps; j++) {
        const fraction = j / steps;
        fineCoords.push({
          lat: start.lat + (end.lat - start.lat) * fraction,
          lng: start.lng + (end.lng - start.lng) * fraction,
        });
      }
    }
  }
  const last = rawCoords[rawCoords.length - 1];
  fineCoords.push({ lat: last[0], lng: last[1] });
  return fineCoords;
}

// โหลดพิกัดเส้นทางจริงของสาย 1 (R01)
const routePath = path.resolve(simulatorDirectory, 'public/data/route-R01.json');
const rawRouteCoords = JSON.parse(fs.readFileSync(routePath, 'utf8'));

// สร้างเส้นทางที่มีพิกัดถี่ขึ้น (ห่างกันประมาณ 6 เมตรต่อก้าว)
const fineRouteCoords = generateFineRoute(rawRouteCoords, 6);

// แผนที่จับคู่อินเด็กซ์บนเส้นทางกับสถานีจุดจอด
const stationIndices = new Map();
STATIONS.forEach((station) => {
  let closestIdx = 0;
  let minDistance = Infinity;
  fineRouteCoords.forEach((coord, idx) => {
    const dist = getDistance(coord.lat, coord.lng, station.lat, station.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestIdx = idx;
    }
  });
  stationIndices.set(closestIdx, station);
});

function getBearing(startLat, startLng, destLat, destLng) {
  const startLatRad = (Math.PI * startLat) / 180;
  const startLngRad = (Math.PI * startLng) / 180;
  const destLatRad = (Math.PI * destLat) / 180;
  const destLngRad = (Math.PI * destLng) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);

  let brng = Math.atan2(y, x);
  brng = (brng * 180) / Math.PI;
  return (brng + 360) % 360;
}

// ล็อกอินตรงๆ ด้วยสิทธิ์ Mobile Device เท่านั้น ไม่หลบไปใช้สิทธิ์อื่น
async function loginSender() {
  if (!SOURCE_SECRET) {
    throw new Error('TRACKING_SOURCE_SECRET_MOBILE is not defined in .env file');
  }

  console.log(`🔐 Requesting Token for Mobile Sender (${SOURCE_ID})...`);
  const res = await fetch(`${API_URL}/auth/vehicle-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceId: SOURCE_ID,
      vehicleId: VEHICLE_ID,
      secret: SOURCE_SECRET,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(`REST Login Rejected (HTTP ${res.status}): ${data.code || 'UNKNOWN_ERROR'}`);
  }
  console.log('✅ Mobile Token acquired successfully.');
  return data.token;
}

async function startTrip(token) {
  const res = await fetch(`${API_URL}/trips/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ vehicleId: VEHICLE_ID })
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`⚠️ Failed to start trip registry (HTTP ${res.status}): ${data.code || 'UNKNOWN_ERROR'}`);
    return null;
  }
  console.log('🎬 Trip Session Active ID:', data.trip?.id || data.id || 'AUTO_TRACKED');
  return data.trip?.id || data.id || 'AUTO_TRACKED';
}

async function establishSocketConnection() {
  senderToken = await loginSender();

  socket.auth = {
    token: senderToken,
    sourceId: SOURCE_ID,
    vehicleId: VEHICLE_ID
  };

  if (socket.connected) {
    socket.disconnect();
  }

  socket.connect();

  await new Promise((resolve, reject) => {
    const onConnect = () => {
      socket.off('connect_error', onError);
      resolve();
    };
    const onError = (error) => {
      socket.off('connect', onConnect);
      reject(error);
    };
    socket.once('connect', onConnect);
    socket.once('connect_error', onError);
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runSimulation() {
  try {
    await establishSocketConnection();
    tripId = await startTrip(senderToken);
    if (!tripId) tripId = null;
  } catch (err) {
    console.error('❌ Initialization Flow Broke:', err.message);
    socket.disconnect();
    process.exitCode = 1;
    return;
  }

  console.log('🚀 Mobile Simulator Online! Streaming data via WebSocket...');
  
  let i = 0;
  if (RUN_ONCE) {
    const current = fineRouteCoords[0];
    const next = fineRouteCoords[1 % fineRouteCoords.length];
    const succeeded = await sendLocation(
      current.lat,
      current.lng,
      22.0,
      getBearing(current.lat, current.lng, next.lat, next.lng),
      'En Route',
    );
    socket.disconnect();
    if (!succeeded) process.exitCode = 1;
    return;
  }

  while (true) {
    const current = fineRouteCoords[i];
    const nextIdx = (i + 1) % fineRouteCoords.length;
    const next = fineRouteCoords[nextIdx];

    // หากรถวิ่งมาถึงตำแหน่งสถานีจุดจอด
    if (stationIndices.has(i)) {
      const station = stationIndices.get(i);
      console.log(`📌 Vehicle arrived at station: ${station.id}`);
      await sendLocation(station.lat, station.lng, 0, 0, station.id);
      await sleep(2000);
    }

    const bearing = getBearing(current.lat, current.lng, next.lat, next.lng);
    await sendLocation(current.lat, current.lng, 22.0, bearing, 'En Route');
    await sleep(1000);

    i = nextIdx;
  }
}

async function sendLocation(lat, lng, speed, bearing, station) {
  try {
    if (!socket.connected) {
      console.log('🔄 Connection lost. Attempting Re-handshake...');
      await establishSocketConnection();
    }

    const payload = {
      sourceId: SOURCE_ID,
      vehicleId: VEHICLE_ID,
      lat,
      lng,
      speed,
      bearing,
      accuracy: 100,
      station
    };
    if (tripId) payload.tripId = tripId;

    const response = await new Promise((resolve) => {
      socket.timeout(5000).emit('send-location', payload, (timeoutError, acknowledgement) => {
        if (timeoutError) {
          resolve({ ok: false, error: 'Timeout' });
        } else {
          resolve(acknowledgement);
        }
      });
    });

    if (!response || response.ok !== true || !response.canonicalLocation) {
      const safeError = {
        ok: response?.ok === true,
        code: response?.code,
        error: response?.error,
      };
      console.error('❌ Signal rejected by WS Node:', JSON.stringify(safeError));
      if (response?.code === 'SENDER_CREDENTIAL_INVALID' || response?.status === 401) {
        console.warn('⚠️ Token Session Expired. Re-authenticating...');
        await establishSocketConnection();
      }
      return false;
    }

    console.log(
      `Socket ACK ok=true source=${response.canonicalLocation.sourceId || SOURCE_ID}` +
      ` type=${response.canonicalLocation.sourceType || 'unknown'}` +
      ` vehicle=${response.canonicalLocation.vehicleId || VEHICLE_ID}`,
    );
    return true;
  } catch (e) {
    console.error('❌ Emission Failure:', e.message);
    return false;
  }
}

runSimulation();
