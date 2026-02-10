import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/prisma.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get('/health', async (req, res) => {
  const users = await prisma.user.count();
  res.json({ status: 'ok', users });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});