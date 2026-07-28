import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration parameters
const BACKEND_PORT = process.env.PORT || 3001;
const rawApiUrl = process.env.API_URL || `http://localhost:${BACKEND_PORT}`;
const BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
const TTN_WEBHOOK_SECRET = process.env.TTN_WEBHOOK_SECRET;

// Presets for devices and routes
const DEVICE_PRESETS = {
  'sensor-f2': {
    id: 'sensor-f2',
    vehicleId: 'VN002',
    routeName: 'R02 (สถานีรถไฟ-มหาลัย)',
    routeFile: '../shuttle-tracking-web/public/data/route-R02.json',
    defaultSpeed: 12,
    fallbackCoords: [
      [13.964994, 100.588582],
      [13.964935, 100.588601],
      [13.964428, 100.588718],
      [13.963533, 100.588944],
      [13.963703, 100.589599],
      [13.964227, 100.591394],
      [13.964821, 100.593827],
      [13.964929, 100.594237],
      [13.964988, 100.594461],
      [13.965001, 100.59451],
      [13.965244, 100.595533],
      [13.965808, 100.597768],
      [13.966206, 100.599293],
      [13.966362, 100.599933],
      [13.966377, 100.600003],
      [13.966476, 100.600396],
      [13.966736, 100.601554],
      [13.966746, 100.601632],
      [13.966743, 100.601728],
      [13.966832, 100.602106],
      [13.966861, 100.602208],
      [13.966975, 100.602651],
      [13.967011, 100.60279],
      [13.967035, 100.602889],
      [13.967074, 100.603066],
      [13.967115, 100.603227],
      [13.967138, 100.603345],
      [13.967149, 100.603398],
      [13.967163, 100.603504],
      [13.96727, 100.605084],
      [13.967283, 100.605302],
      [13.967341, 100.606661],
      [13.967343, 100.606775],
      [13.967377, 100.606857],
      [13.96747, 100.606565],
      [13.967486, 100.606486],
      [13.9675, 100.606291],
      [13.967488, 100.606063],
      [13.967469, 100.605849],
      [13.967439, 100.605723],
      [13.967367, 100.605597],
      [13.967278, 100.605485],
      [13.967199, 100.605453],
      [13.967133, 100.605412],
      [13.967128, 100.605467],
      [13.967125, 100.605538],
      [13.96714, 100.605774],
      [13.96714, 100.605877],
      [13.96715, 100.605982],
      [13.967171, 100.606068],
      [13.967197, 100.606169],
      [13.967219, 100.606261],
      [13.967245, 100.606369],
      [13.967264, 100.606582],
      [13.967271, 100.606655],
      [13.967343, 100.606775],
      [13.967341, 100.606661],
      [13.967283, 100.605302],
      [13.96727, 100.605084],
      [13.967163, 100.603504],
      [13.967149, 100.603398],
      [13.967138, 100.603345],
      [13.967115, 100.603227],
      [13.967074, 100.603066],
      [13.967035, 100.602889],
      [13.967011, 100.60279],
      [13.966975, 100.602651],
      [13.966861, 100.602208],
      [13.966832, 100.602106],
      [13.966743, 100.601728],
      [13.966693, 100.601648],
      [13.966662, 100.601583],
      [13.966387, 100.600417],
      [13.9663, 100.600031],
      [13.966284, 100.599959],
      [13.966118, 100.599321],
      [13.965728, 100.597797],
      [13.965168, 100.595558],
      [13.964923, 100.594535],
      [13.96491, 100.594479],
      [13.964747, 100.593848],
      [13.964154, 100.59141],
      [13.963629, 100.599619],
      [13.963459, 100.588963],
      [13.963533, 100.588944],
      [13.964428, 100.588718],
      [13.964935, 100.588601],
      [13.964994, 100.588582]
    ]
  },
  'sensor-c4': {
    id: 'sensor-c4',
    vehicleId: 'VH003',
    routeName: 'R01 (วนภายในมหาลัย)',
    routeFile: '../shuttle-tracking-web/public/data/route-R01.json',
    defaultSpeed: 10,
    fallbackCoords: [
      [13.968759, 100.583918],
      [13.967848, 100.583948],
      [13.967826, 100.585689],
      [13.968142, 100.587173],
      [13.966818, 100.586695],
      [13.965787, 100.587276],
      [13.964171, 100.587485],
      [13.963885, 100.586543],
      [13.964392, 100.586107],
      [13.965815, 100.585736],
      [13.96737, 100.585368],
      [13.967822, 100.584361]
    ]
  }
};

// Calculate bearing between two points
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSimulator() {
  console.log('📡 TTN Ingest Webhook Simulator starting...');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const targetDeviceKey = args.find((arg) => !arg.startsWith('--')) || process.env.TTN_DEVICE_ID || 'sensor-c4';
  const intervalArg = args.find((arg) => /^\d+$/.test(arg));
  const intervalMs = parseInt(intervalArg || '3000', 10);
  const runOnce = args.includes('--once');

  if (!TTN_WEBHOOK_SECRET) {
    throw new Error('TTN_WEBHOOK_SECRET is not set');
  }

  const config = DEVICE_PRESETS[targetDeviceKey];

  if (!config) {
    console.error(`❌ Unknown device "${targetDeviceKey}". Choose from: sensor-c4, sensor-f2`);
    process.exit(1);
  }

  console.log(`\n======================================`);
  console.log(`Target Device:   ${config.id}`);
  console.log(`Vehicle ID:      ${config.vehicleId}`);
  console.log(`Route Path:      ${config.routeName}`);
  console.log(`API URL:         ${BASE_URL}/ingest/ttn`);
  console.log(`Interval:        ${intervalMs}ms`);
  console.log(`======================================\n`);

  // Load coordinates
  let coords = [];
  try {
    const routeFilePath = path.resolve(__dirname, config.routeFile);
    if (fs.existsSync(routeFilePath)) {
      const fileData = fs.readFileSync(routeFilePath, 'utf8');
      coords = JSON.parse(fileData);
      console.log(`✅ Loaded ${coords.length} coordinates from ${path.basename(config.routeFile)}`);
    } else {
      throw new Error(`File not found: ${routeFilePath}`);
    }
  } catch (error) {
    coords = config.fallbackCoords;
    console.log(`⚠️  Could not read route JSON file, using ${coords.length} fallback preset coordinates.`);
  }

  let index = 0;

  while (true) {
    const current = coords[index];
    const next = coords[(index + 1) % coords.length];

    const lat = current[0];
    const lng = current[1];
    const bearing = parseFloat(getBearing(lat, lng, next[0], next[1]).toFixed(2));
    
    // Construct the locationSolved format TTN webhook payload
    const payload = {
      end_device_ids: {
        device_id: config.id,
        application_ids: {
          application_id: 'rsu-shuttle-app'
        }
      },
      name: 'as.up.location.forward',
      data: {
        device_id: config.id,
        location_solved: {
          location: {
            latitude: lat,
            longitude: lng,
            altitude: 0,
            accuracy: 10, // 10 meters accuracy
            bearing: bearing,
            speed: config.defaultSpeed
          }
        }
      }
    };

    console.log(`🚀 [${new Date().toLocaleTimeString()}] Sending device coordinates:`);
    console.log(`   📍 Coords:   lat=${lat.toFixed(6)}, lng=${lng.toFixed(6)}`);
    console.log(`   🧭 Bearing:  ${bearing}°`);
    console.log(`   🚗 Speed:    ${config.defaultSpeed} m/s`);

    try {
      const response = await fetch(`${BASE_URL}/ingest/ttn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TTN_WEBHOOK_SECRET}`
        },
        body: JSON.stringify(payload)
      });

      const resText = await response.text();
      let resJson = {};
      try {
        resJson = JSON.parse(resText);
      } catch (e) {
        resJson = { raw: resText };
      }

      const safeResponse = {
        message: typeof resJson.message === 'string' ? resJson.message : undefined,
        code: typeof resJson.code === 'string' ? resJson.code : undefined,
        canonicalLocation: resJson.canonicalLocation
          ? {
              vehicleId: resJson.canonicalLocation.vehicleId,
              sourceId: resJson.canonicalLocation.sourceId,
              sourceType: resJson.canonicalLocation.sourceType,
            }
          : undefined,
      };

      if (response.ok) {
        if (
          runOnce &&
          (safeResponse.canonicalLocation?.sourceId !== config.id ||
            safeResponse.canonicalLocation?.sourceType !== 'lorawan')
        ) {
          console.error(`   🔴 Failed: canonical response did not select ${config.id} as lorawan source`);
          process.exitCode = 1;
          break;
        }
        console.log(`   🟢 Success (HTTP ${response.status}):`, JSON.stringify(safeResponse));
      } else {
        console.error(`   🔴 Failed (HTTP ${response.status}):`, JSON.stringify(safeResponse));
      }

      if (runOnce) {
        if (!response.ok) process.exitCode = 1;
        break;
      }
    } catch (err) {
      console.error(`   ❌ Connection Error:`, err.message);
      if (runOnce) {
        process.exitCode = 1;
        break;
      }
    }

    console.log(`----------------------------------------`);
    
    // Increment index
    index = (index + 1) % coords.length;
    await sleep(intervalMs);
  }
}

runSimulator();
