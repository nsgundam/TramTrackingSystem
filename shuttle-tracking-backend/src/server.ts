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

import { authenticateToken } from "./middleware/auth.js";

import { handleLocationData } from "./services/tracking.service.js";

import { connectRedis, redisClient } from "./config/redis.js";

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

//Routes
app.use("/api/auth", authRouter);

// Admin Routes (Protected)
app.use("/api/admin/vehicles", authenticateToken, vehiclesRouter);
app.use("/api/admin/routes", authenticateToken, routeRouter);
app.use("/api/admin/stops", authenticateToken, stopRouter);
app.use("/api/admin/route-stops", authenticateToken, routeStopsRouter);

// Public Routes (Open)
app.use("/api/public", publicRouter);

app.use("/api/trips", tripsRouter);

const io = new Server(httpServer, {
  cors: corsOptions,
});

// Logic for handling Socket.IO connections
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("send-location", async (rawData) => {
    const result = await handleLocationData(rawData);
    io.emit("location-update", result);
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
