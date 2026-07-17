import dotenv from 'dotenv';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import readline from 'readline';

dotenv.config();

const API_URL = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001'; 
const VEHICLE_ID = 'VH002';
const SOURCE_ID = 'TS_MOB_01';

const SOURCE_SECRET = process.env.TRACKING_SOURCE_SECRET_MOBILE || process.env.TRACKING_SOURCE_SECRET || 'mobile_secret_key';

const socket = io(SOCKET_URL, { autoConnect: false, reconnection: true });
let senderToken = null;
let tripId = null;
let lastLat = null;
let lastLng = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

socket.on('connect', () => {
  console.log(`🟢 Connected to WebSocket server with ID: ${socket.id}`);
});

socket.on('disconnect', () => {
  console.log('🔴 Disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket Connection Error:', error.message);
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
    throw new Error(`REST Login Rejected: ${JSON.stringify(data)}`);
  }
  console.log('✅ Mobile Token acquired successfully.');
  console.log('Token Claims:', jwtDecode(data.token));
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
    console.error('⚠️ Failed to start trip registry:', data);
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

async function sendLocation(lat, lng, speed, bearing, station) {
  try {
    if (!socket.connected) {
      console.log('🔄 Connection lost. Attempting Re-handshake...');
      await establishSocketConnection();
    }

    const payload = {
      tripId,
      sourceId: SOURCE_ID,
      vehicleId: VEHICLE_ID,
      lat,
      lng,
      speed,
      bearing,
      accuracy: 100,
      station
    };

    const response = await new Promise((resolve) => {
      socket.timeout(5000).emit('send-location', payload, (timeoutError, acknowledgement) => {
        if (timeoutError) {
          resolve({ ok: false, error: 'Timeout' });
        } else {
          resolve(acknowledgement);
        }
      });
    });

    if (!response || response.ok !== true) {
      console.error('❌ Signal rejected by WS Node:', response);
      if (response?.code === 'SENDER_CREDENTIAL_INVALID' || response?.status === 401) {
        console.warn('⚠️ Token Session Expired. Re-authenticating...');
        await establishSocketConnection();
      }
      return;
    }

    console.log(`📡 [WS Emit] Lat: ${lat.toFixed(6)} | Lng: ${lng.toFixed(6)} | Status: ${station} | Bearing: ${bearing.toFixed(2)}°`);
  } catch (e) {
    console.error('❌ Emission Failure:', e.message);
  }
}

async function runManualSimulator() {
  try {
    await establishSocketConnection();
    tripId = await startTrip(senderToken);
    if (!tripId) tripId = null;
  } catch (err) {
    console.error('❌ Initialization Flow Broke:', err.message);
    rl.close();
    return;
  }

  console.log('\n==================================================');
  console.log('🚀 Manual GPS Simulator Online!');
  console.log('Enter coordinates as: <lat> <lng> or <lat>,<lng>');
  console.log('Example: 13.964772 100.587563');
  console.log("Type 'exit' to quit.");
  console.log('==================================================\n');

  while (true) {
    const input = await askQuestion('📍 Enter coords (lat lng): ');
    const trimmed = input.trim();
    if (trimmed.toLowerCase() === 'exit') {
      console.log('👋 Exiting manual simulator.');
      rl.close();
      socket.disconnect();
      break;
    }

    if (!trimmed) continue;

    const parts = trimmed.split(/[\s,]+/);
    if (parts.length < 2) {
      console.log('⚠️ Invalid input. Format must be "latitude longitude"');
      continue;
    }

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng)) {
      console.log('⚠️ Invalid coordinates. Please enter valid numbers.');
      continue;
    }

    let bearing = 0;
    if (lastLat !== null && lastLng !== null) {
      bearing = getBearing(lastLat, lastLng, lat, lng);
    }

    await sendLocation(lat, lng, 20.0, bearing, 'Manual Control');

    lastLat = lat;
    lastLng = lng;
  }
}

runManualSimulator();
