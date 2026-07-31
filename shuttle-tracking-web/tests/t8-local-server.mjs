import { createServer } from "node:http";
import { Server } from "socket.io";

const port = Number(process.env.T8_MOCK_PORT ?? "13001");

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
    observedAt: "2026-08-01T00:00:00.000Z",
    receivedAt: "2026-08-01T00:00:00.000Z",
    selectedAt: "2026-08-01T00:00:00.000Z",
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
    { id: "r01-1", name: "R01 Start", lat: 13.98, lng: 100.58 },
    { id: "r01-2", name: "R01 End", lat: 13.981, lng: 100.581 },
  ],
  R02: [
    { id: "r02-1", name: "R02 Start", lat: 13.982, lng: 100.582 },
    { id: "r02-2", name: "R02 End", lat: 13.983, lng: 100.583 },
  ],
};

const respondJson = (response, status, payload) => {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "http://127.0.0.1:13000",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload));
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);

  if (url.pathname === "/health") {
    respondJson(response, 200, { ok: true });
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
    respondJson(response, 200, [{ id: "t8-vehicle", name: "T8 Test Tram", assignedRouteId: "R01", state: initialState }]);
    return;
  }
  if (url.pathname === "/api/public/active-routes") {
    respondJson(response, 200, routes);
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
