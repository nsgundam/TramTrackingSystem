import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRouter from './routes/auth.route.js';
import vehiclesRouter from './routes/vehicles.route.js';
import routeRouter from './routes/route.route.js';
import stopRouter from './routes/stops.route.js';
import routeStopsRouter from './routes/routeStops.route.js';
import tripsRouter from './routes/trips.route.js';
import publicRouter from './routes/public.route.js';

import { authenticateToken } from './middleware/auth.js';

import { handleLocationData } from './services/tracking.service.js';

const app = express();

// HTTP server and Socket.IO setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRouter);

// Admin Routes (Protected)
app.use('/api/admin/vehicles', authenticateToken, vehiclesRouter);
app.use('/api/admin/routes', authenticateToken, routeRouter);
app.use('/api/admin/stops', authenticateToken, stopRouter);
app.use('/api/admin/route-stops', authenticateToken, routeStopsRouter);

// Public Routes (Open)
app.use('/api/public', publicRouter);

app.use('/api/trips', tripsRouter);

// Logic for handling Socket.IO connections
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('send-location', async (rawData) => {
    const result = await handleLocationData(rawData);
    io.emit('location-update', result);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});