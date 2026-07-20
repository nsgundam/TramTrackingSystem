import express, { type NextFunction, type Request, type Response } from "express";
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

import {
  authenticateToken,
  extractBearerToken,
  getSenderFromToken,
  SenderAuthDependencyError,
} from "./middleware/auth.js";
import type { SenderContext } from "./middleware/auth.js";

import { processObservation } from "./services/tracking.service.js";
import {
  BoundaryError,
  logBoundaryFailure,
  mapBoundaryError,
} from "./middleware/boundary-errors.js";
import { consumeRateLimit, RATE_LIMITS } from "./middleware/rate-limit.js";
import { parseObservation } from "./middleware/validation.js";

import { connectRedis, redisClient } from "./config/redis.js";
import { prisma } from "./config/prisma.js";

const app = express();

const configuredBodyLimit = (() => {
  const match = /^(\d+)(b|kb|mb)$/i.exec(process.env.REQUEST_BODY_LIMIT || '');
  if (!match) return '64kb';

  const amount = Number(match[1]!);
  const unit = match[2]!.toLowerCase();
  const multiplier = unit === 'mb'
    ? 1024 * 1024
    : unit === 'kb'
      ? 1024
      : 1;
  const bytes = amount * multiplier;
  return Number.isSafeInteger(bytes) && bytes > 0 && bytes <= 1024 * 1024
    ? `${bytes}b`
    : '64kb';
})();
const configuredSocketBuffer = (() => {
  const parsed = Number(process.env.SOCKET_MAX_BUFFER_BYTES);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 1024 * 1024
    ? parsed
    : 64 * 1024;
})();

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
app.use(express.json({ limit: configuredBodyLimit }));

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
    logBoundaryFailure('Ready check', error);
    res.status(503).json({
      status: "NOT_READY",
      error: 'Dependencies are unavailable'
    });
  }
});

const io = new Server(httpServer, {
  cors: corsOptions,
  maxHttpBufferSize: configuredSocketBuffer,
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
    socket.data.senderToken = authToken;
    next();
  } catch (error) {
    next(new Error(
      error instanceof SenderAuthDependencyError
        ? 'Sender authentication temporarily unavailable'
        : 'Invalid or inactive sender credential',
    ));
  }
});

// Logic for handling Socket.IO connections
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("send-location", async (rawData, acknowledge) => {
    const respond = typeof acknowledge === 'function' ? acknowledge : () => {};
    const senderToken = socket.data.senderToken;

    if (typeof senderToken !== 'string') {
      const error = { ok: false, code: 'SENDER_AUTH_REQUIRED', error: 'Sender authentication required' };
      respond(error);
      socket.emit('error-response', error);
      return;
    }

    try {
      let observation;
      try {
        observation = parseObservation(rawData);
      } catch (error) {
        const invalid = mapBoundaryError(error, new BoundaryError(400, 'INVALID_REQUEST', 'Location payload is invalid'));
        const response = { ok: false, code: invalid.code, error: invalid.message };
        respond(response);
        socket.emit('error-response', response);
        return;
      }

      // Handshake authentication is not enough for a long-lived sender socket.
      // Revalidate expiry, source status, vehicle binding, and credential version
      // for every write so rotation/revocation takes effect immediately.
      let sender: SenderContext;
      try {
        sender = await getSenderFromToken(senderToken);
      } catch (error) {
        if (error instanceof SenderAuthDependencyError) {
          const response = {
            ok: false,
            code: 'SENDER_AUTH_UNAVAILABLE',
            error: 'Sender authentication temporarily unavailable',
          };
          respond(response);
          socket.emit("error-response", response);
          return;
        }

        const response = {
          ok: false,
          code: 'SENDER_CREDENTIAL_INVALID',
          error: 'Sender credential is invalid or no longer active',
        };
        respond(response);
        socket.emit("error-response", response);
        socket.disconnect(true);
        return;
      }

      socket.data.sender = sender;

      let quota;
      try {
        quota = await consumeRateLimit({
          scope: 'sender:observation',
          ...RATE_LIMITS.sender,
          key: sender.sourceId,
        });
      } catch {
        throw new BoundaryError(503, 'DEPENDENCY_UNAVAILABLE', 'Rate limiting is temporarily unavailable');
      }
      if (!quota.allowed) {
        const response = {
          ok: false,
          code: 'RATE_LIMITED',
          error: 'Too many requests',
          retryAfter: quota.retryAfterSeconds,
        };
        respond(response);
        socket.emit('error-response', response);
        return;
      }

      if (
        observation.sourceId !== sender.sourceId ||
        (observation.vehicleId && observation.vehicleId !== sender.vehicleId)
      ) {
        const error = { ok: false, code: 'SENDER_OWNERSHIP_MISMATCH', error: 'Sender cannot submit for this source or vehicle' };
        respond(error);
        socket.emit('error-response', error);
        return;
      }

      const canonicalLocation = await processObservation({
        sourceId: observation.sourceId,
        sender,
        tripId: observation.tripId,
        lat: observation.lat,
        lng: observation.lng,
        speed: observation.speed,
        bearing: observation.bearing,
        accuracy: observation.accuracy,
        station: observation.station,
      });

      if (canonicalLocation) {
        io.emit("location-update", canonicalLocation);
      }

      respond({ ok: true, canonicalLocation });
    } catch (error) {
      logBoundaryFailure('Socket location', error);
      const mapped = mapBoundaryError(
        error,
        new BoundaryError(500, 'INTERNAL_ERROR', 'Location observation was rejected'),
      );
      const response = { ok: false, code: mapped.code, error: mapped.message };
      respond(response);
      socket.emit("error-response", response);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large') {
    res.status(413).json({ code: 'REQUEST_TOO_LARGE', error: 'Request body is too large' });
    return;
  }

  if (error instanceof SyntaxError) {
    res.status(400).json({ code: 'INVALID_REQUEST', error: 'Malformed JSON request' });
    return;
  }

  logBoundaryFailure('HTTP boundary', error);
  const mapped = mapBoundaryError(error);
  res.status(mapped.status).json({ code: mapped.code, error: mapped.message });
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
    logBoundaryFailure('Server startup', error);
    process.exit(1);
  }
};

startServer();
