import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/prisma.js';
import authRouter from './routes/auth.route.js';
import vehiclesRouter from './routes/vehicles.route.js';
import routeRouter from './routes/route.route.js';
import stopRouter from './routes/stops.route.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRouter);
app.use('/api/admin/vehicles', vehiclesRouter);
app.use('/api/admin/routes', routeRouter);
app.use('/api/admin/stops', stopRouter);

// Test route
app.get('/health', async (req, res) => {
  const users = await prisma.user.count();
  res.json({ status: 'ok', users });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});