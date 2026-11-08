import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import serviceRoutes from './routes/services.js';
import settingRoutes from './routes/settings.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Client build directory for serving public frontend
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Initialize SQLite database & tables
initDatabase();

// CORS configuration for cookies & frontend communication
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and local network development, plus same-origin requests
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev demo
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/settings', settingRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BrightSmile Dental Clinic API',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Explicit 404 handler for unmatched API routes
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve frontend static assets if client/dist exists
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for all frontend routes (e.g. /, /admin, /admin/appointments)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🦷 BrightSmile Dental Clinic Full-Stack Application`);
    console.log(`🌐 Public Website & API Live at: http://localhost:${PORT}`);
    console.log(`🛡️ Admin Portal:                  http://localhost:${PORT}/admin`);
    console.log(`🔒 Strictly Enforced Admin:        ephraimcreations254@gmail.com`);
    console.log(`======================================================\n`);
  });
}

export { app };
export default app;
