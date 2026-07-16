import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

// Import routes
import authRouter from "./routes/auth.route.js";
import vehiclesRouter from "./routes/vehicles.route.js";
import routeRouter from "./routes/route.route.js";
import stopRouter from "./routes/stops.route.js";
import routeStopsRouter from "./routes/routeStops.route.js";
import tripsRouter from "./routes/trips.route.js";
import publicRouter from "./routes/public.route.js";
import ingestRouter from "./routes/ingest.route.js";
import devicesRouter from "./routes/devices.route.js";

import { authenticateToken, extractBearerToken, getSenderFromToken } from "./middleware/auth.js";

import { processObservation } from "./services/tracking.service.js";

import { connectRedis, redisClient } from "./config/redis.js";
import { prisma } from "./config/prisma.js";

const app = express();

// HTTP server and Socket.IO setup
const httpServer = createServer(app);

const FRONTEND_URLS = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000"
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {

    if (!origin || FRONTEND_URLS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);

// Admin Routes (Protected)
app.use("/api/admin/vehicles", authenticateToken, vehiclesRouter);
app.use("/api/admin/routes", authenticateToken, routeRouter);
app.use("/api/admin/stops", authenticateToken, stopRouter);
app.use("/api/admin/route-stops", authenticateToken, routeStopsRouter);
app.use("/api/admin/devices", authenticateToken, devicesRouter);

// Public & Ingest Routes (Open)
app.use("/api/public", publicRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/ingest", ingestRouter);

// Health & Readiness Checks
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

app.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redisClient.ping();
    res.status(200).json({
      status: "READY",
      database: "connected",
      redis: "connected"
    });
  } catch (error: any) {
    console.error("[Ready Check] Failed:", error.message);
    res.status(503).json({
      status: "NOT_READY",
      error: error.message
    });
  }
});

const io = new Server(httpServer, {
  cors: corsOptions,
});

app.set('socketio', io); // Share Socket.IO instance to REST controllers

// Public viewers may connect without credentials, but any sender connection is
// authenticated during the handshake and receives a bound sender context.
io.use(async (socket, next) => {
  const authToken = typeof socket.handshake.auth?.token === 'string'
    ? socket.handshake.auth.token
    : extractBearerToken(socket.handshake.headers.authorization);

  if (!authToken) {
    next();
    return;
  }

  try {
    socket.data.sender = await getSenderFromToken(authToken);
    next();
  } catch {
    next(new Error('Invalid or inactive sender credential'));
  }
});

// Logic for handling Socket.IO connections
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("send-location", async (rawData, acknowledge) => {
    const respond = typeof acknowledge === 'function' ? acknowledge : () => {};
    const sender = socket.data.sender;

    if (!sender) {
      const error = { ok: false, code: 'SENDER_AUTH_REQUIRED', error: 'Sender authentication required' };
      respond(error);
      socket.emit('error-response', error);
      return;
    }

    try {
      if (!rawData || typeof rawData !== 'object' || !rawData.sourceId) {
        throw new Error('sourceId is required');
      }

      if (
        rawData.sourceId !== sender.sourceId ||
        (rawData.vehicleId && rawData.vehicleId !== sender.vehicleId)
      ) {
        const error = { ok: false, code: 'SENDER_OWNERSHIP_MISMATCH', error: 'Sender cannot submit for this source or vehicle' };
        respond(error);
        socket.emit('error-response', error);
        return;
      }

      const canonicalLocation = await processObservation({
        sourceId: rawData.sourceId,
        sender,
        tripId: rawData.tripId,
        lat: rawData.lat,
        lng: rawData.lng,
        speed: rawData.speed,
        bearing: rawData.bearing || rawData.heading,
        accuracy: rawData.accuracy,
        station: rawData.station
      });

      if (canonicalLocation) {
        io.emit("location-update", canonicalLocation);
      }

      respond({ ok: true, canonicalLocation });
    } catch (error: any) {
      console.error("[Socket.IO] Error processing send-location:", error.message);
      const response = { ok: false, code: 'LOCATION_REJECTED', error: error.message };
      respond(response);
      socket.emit("error-response", response);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();

    // Create pub/sub clients for Socket.IO adapter
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);

    // Mount Redis adapter – enables broadcasting across multiple Node processes
    io.adapter(createAdapter(pubClient, subClient));
    console.log("[Socket.IO] Redis adapter attached");

    httpServer.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
};

startServer();
