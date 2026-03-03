import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001'; // URL สำหรับต่อ Socket
const VEHICLE_ID = 'VH001';

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

const socket = io(SOCKET_URL);

socket.on('connect', () => {
  console.log(`🟢 Connected to WebSocket server with ID: ${socket.id}`);
});

socket.on('disconnect', () => {
  console.log('🔴 Disconnected from WebSocket server');
});

function interpolate(start, end, steps) {
  const points = [];
  for (let i = 1; i <= steps; i++) {
    const fraction = i / steps;
    points.push({
      lat: start.lat + (end.lat - start.lat) * fraction,
      lng: start.lng + (end.lng - start.lng) * fraction,
    });
  }
  return points;
}

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

async function startTrip() {
  const res = await fetch(`${API_URL}/trips/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vehicleId: VEHICLE_ID })
  });
  const data = await res.json();
  if (!res.ok) {
    console.log('Failed to start trip:', data);
    return null;
  }
  console.log('Started trip:', data.trip.id);
  return data.trip.id;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runSimulation() {
  let tripId = await startTrip();
  if (!tripId) {
     console.log("Could not obtain a tripId. Exiting.");
     return;
  }

  console.log('Starting simulation loop...');
  let currentStationIdx = 0;

  while (true) {
    const current = STATIONS[currentStationIdx];
    const nextIdx = (currentStationIdx + 1) % STATIONS.length;
    const next = STATIONS[nextIdx];

    console.log(`Arrived at station ${current.id}`);
    
    // Send station arrival
    await sendLocation(tripId, current.lat, current.lng, 0, 0, current.id);
    await sleep(2000); // stay at station for 2s

    // Interpolate to next station
    const steps = 10;
    const interpolated = interpolate(current, next, steps);
    const bearing = getBearing(current.lat, current.lng, next.lat, next.lng);

    for (let i = 0; i < interpolated.length; i++) {
      const pt = interpolated[i];
      // When moving, station is 'En Route'
      await sendLocation(tripId, pt.lat, pt.lng, 20, bearing, 'En Route');
      await sleep(1000); // 1 update per second
    }

    currentStationIdx = nextIdx;
  }
}

async function sendLocation(tripId, lat, lng, speed, bearing, station) {
  try {

    const payload = {
      tripId,
      vehicleId: VEHICLE_ID,
      lat,
      lng,
      speed,
      bearing,
      accuracy: 100,
      station
    };

    socket.emit('send-location', payload);

    console.log(`📡 Emit Socket: lat=${lat.toFixed(6)}, lng=${lng.toFixed(6)}, speed=${speed}, station=${station}`);
  } catch (e) {
    console.error('Error sending location:', e.message);
  }
}

runSimulation();