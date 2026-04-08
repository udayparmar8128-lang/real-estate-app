import dotenv from 'dotenv';
dotenv.config(); // Load env vars FIRST — before any other module reads process.env

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Connect to MongoDB
connectDB();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// CLIENT_URL supports a comma-separated list so you can allow both localhost
// and your production Vercel domain without changing code.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
  credentials: true,
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/upload', uploadRoutes);

// Health check (used by Render/Railway to detect live containers)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Real Estate API is running 🚀',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
