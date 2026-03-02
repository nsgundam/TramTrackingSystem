import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/prisma.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRouter from './routes/auth.route.js';
import vehiclesRouter from './routes/vehicles.route.js';
import routeRouter from './routes/route.route.js';
import stopRouter from './routes/stops.route.js';
import routeStopsRouter from './routes/routeStops.route.js';
import trackingRouter from './routes/tracking.route.js';
import tripsRouter from './routes/trips.route.js';

dotenv.config();

const app = express();

// HTTP server and Socket.IO setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io); // Make Socket.IO instance available in routes

app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRouter);
app.use('/api/admin/vehicles', vehiclesRouter);
app.use('/api/admin/routes', routeRouter);
app.use('/api/admin/stops', stopRouter);
app.use('/api/admin/route-stops', routeStopsRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/trips', tripsRouter);


// Logic for handling Socket.IO connections
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});