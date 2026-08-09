import { createServer } from "node:http";
import { Server } from "socket.io";

const port = Number(process.env.T8_MOCK_PORT ?? "13001");

const serverStartedAt = new Date().toISOString();

const canonicalState = (stateVersion, freshness) => ({
  schemaVersion: 1,
  eventType: "canonical_vehicle_state",
  stateEpoch: "t8-local-epoch",
  stateVersion,
  vehicleId: "t8-vehicle",
  tripId: "t8-trip",
  routeId: "R01",
  routeAuthority: "active_trip",
  serviceState: "live",
  reasonCode: "CANONICAL_SELECTED",
  liveLocation: {
    lat: 13.98,
    lng: 100.58,
    speed: 20,
    heading: 0,
    accuracy: 5,
    station: null,
  },
  lastKnownLocation: null,
  timing: {
    observedAt: serverStartedAt,
    receivedAt: serverStartedAt,
    selectedAt: serverStartedAt,
    freshnessClock: "server_receive",
  },
  freshness,
  sourceType: "mobile",
});

const initialState = canonicalState(1, { ageMs: 0, thresholdMs: 30_000, bucket: "fresh" });
const expiringState = canonicalState(2, { ageMs: 0, thresholdMs: 800, bucket: "fresh" });
const restoredState = canonicalState(3, { ageMs: 0, thresholdMs: 30_000, bucket: "fresh" });

const routes = [
  { id: "R01", name: "Route 01", color: "#2563EB", status: "active" },
  { id: "R02", name: "Route 02", color: "#16A34A", status: "active" },
];

const stops = {
  R01: [
    {
      id: "r01-1",
      name: "R01 Start",
      lat: 13.98,
      lng: 100.58,
      imageUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
    },
    { id: "r01-2", name: "R01 End", lat: 13.981, lng: 100.581 },
  ],
  R02: [
    { id: "r02-1", name: "R02 Start", lat: 13.982, lng: 100.582 },
    { id: "r02-2", name: "R02 End", lat: 13.983, lng: 100.583 },
  ],
};

let activeVehicleFailuresRemaining = 0;
let emptyActiveVehicleResponsesRemaining = 0;
let activeVehicleDelayMs = 0;
let activeVehicleDelayResponsesRemaining = 0;
let adminStatsMode = "ready";

const respondJson = (response, status, payload) => {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "http://127.0.0.1:13000",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload));
};

const readJsonBody = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return null;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "http://127.0.0.1:13000",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
    response.end();
    return;
  }
  if (url.pathname === "/health") {
    respondJson(response, 200, { ok: true });
    return;
  }
  if (url.pathname === "/t14/fail-next-active-vehicles") {
    const requestedCount = Number(url.searchParams.get("count") ?? "1");
    activeVehicleFailuresRemaining = Number.isInteger(requestedCount) && requestedCount > 0
      ? requestedCount
      : 1;
    respondJson(response, 200, { armed: activeVehicleFailuresRemaining });
    return;
  }
  if (url.pathname === "/t14/admin-stats-mode") {
    const requestedMode = url.searchParams.get("mode");
    adminStatsMode = requestedMode === "error" ? "error" : "ready";
    respondJson(response, 200, { mode: adminStatsMode });
    return;
  }
  if (url.pathname === "/t14/empty-next-active-vehicles") {
    emptyActiveVehicleResponsesRemaining = 1;
    respondJson(response, 200, { armed: true });
    return;
  }
  if (url.pathname === "/t14/delay-next-active-vehicles") {
    const requestedDelayMs = Number(url.searchParams.get("ms") ?? "0");
    const requestedCount = Number(url.searchParams.get("count") ?? "1");
    activeVehicleDelayMs = Number.isFinite(requestedDelayMs)
      ? Math.max(0, Math.min(10_000, requestedDelayMs))
      : 0;
    activeVehicleDelayResponsesRemaining = Number.isInteger(requestedCount) && requestedCount > 0
      ? requestedCount
      : 1;
    respondJson(response, 200, {
      delayMs: activeVehicleDelayMs,
      responses: activeVehicleDelayResponsesRemaining,
    });
    return;
  }
  if (url.pathname === "/t8/restore") {
    io.emit("location-update", restoredState);
    respondJson(response, 200, { restored: true });
    return;
  }
  if (url.pathname === "/t8/arm-expiry") {
    io.emit("location-update", expiringState);
    respondJson(response, 200, { expiryArmed: true });
    return;
  }
  if (url.pathname === "/t8/connection-count") {
    respondJson(response, 200, { connectionCount });
    return;
  }
  if (url.pathname === "/api/public/active-vehicles") {
    const responseDelayMs = activeVehicleDelayResponsesRemaining > 0 ? activeVehicleDelayMs : 0;
    if (activeVehicleDelayResponsesRemaining > 0) {
      activeVehicleDelayResponsesRemaining -= 1;
      if (activeVehicleDelayResponsesRemaining === 0) activeVehicleDelayMs = 0;
    }
    if (responseDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, responseDelayMs));
    }
    if (activeVehicleFailuresRemaining > 0) {
      activeVehicleFailuresRemaining -= 1;
      respondJson(response, 503, { error: "Active vehicles temporarily unavailable" });
      return;
    }
    if (emptyActiveVehicleResponsesRemaining > 0) {
      emptyActiveVehicleResponsesRemaining -= 1;
      respondJson(response, 200, []);
      return;
    }
    respondJson(response, 200, [{ id: "t8-vehicle", name: "T8 Test Tram", assignedRouteId: "R01", state: initialState }]);
    return;
  }
  if (url.pathname === "/api/public/feedback" && request.method === "POST") {
    try {
      const body = await readJsonBody(request);
      if (
        !body
        || body.vehicleId !== "t8-vehicle"
        || typeof body.message !== "string"
        || body.message.trim().length === 0
      ) {
        respondJson(response, 400, { error: "Invalid feedback test payload" });
        return;
      }
      respondJson(response, 201, { success: true, data: { id: "t14-feedback" } });
    } catch {
      respondJson(response, 400, { error: "Invalid JSON" });
    }
    return;
  }
  if (url.pathname === "/api/public/active-routes") {
    respondJson(response, 200, routes);
    return;
  }
  if (url.pathname === "/api/auth/me") {
    respondJson(response, 200, {
      user: { id: "t14-admin", username: "admin", role: "ADMIN" },
    });
    return;
  }
  if (url.pathname === "/api/admin/vehicles") {
    if (adminStatsMode === "error") {
      respondJson(response, 503, { error: "Dashboard stats temporarily unavailable" });
      return;
    }
    respondJson(response, 200, [{ id: "t8-vehicle", name: "T8 Test Tram", status: "active" }]);
    return;
  }
  if (url.pathname === "/api/admin/routes") {
    respondJson(response, 200, routes);
    return;
  }
  if (url.pathname === "/api/admin/stops") {
    respondJson(response, 200, [...stops.R01, ...stops.R02]);
    return;
  }

  const match = url.pathname.match(/^\/api\/public\/routes\/(R0[12])\/stops$/);
  if (match) {
    respondJson(response, 200, stops[match[1]]);
    return;
  }

  respondJson(response, 404, { error: "T8 local mock route not found" });
});

const io = new Server(server, { cors: { origin: "http://127.0.0.1:13000" } });
let connectionCount = 0;

io.on("connection", () => {
  connectionCount += 1;
});

server.listen(port, "127.0.0.1");

const close = () => io.close(() => server.close());
process.once("SIGINT", close);
process.once("SIGTERM", close);
