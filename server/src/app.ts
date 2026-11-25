import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import serviceRoutes from './routes/services.js';
import settingRoutes from './routes/settings.js';

dotenv.config();

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Client build directory for serving public frontend
const clientDistPath = fs.existsSync(path.resolve(process.cwd(), 'client/dist'))
  ? path.resolve(process.cwd(), 'client/dist')
  : path.resolve(process.cwd(), 'dist');

// Normalize request URL for proxy rewrites, Vercel serverless, and Netlify Functions
app.use((req, _res, next) => {
  if (req.url && req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
    if (!req.url.startsWith('/api')) {
      req.url = '/api' + req.url;
    }
  }

  const xMatched = req.headers['x-matched-path'] as string | undefined;
  const xOriginal = req.headers['x-original-url'] as string | undefined;

  if (xMatched && xMatched.startsWith('/api')) {
    req.url = xMatched;
  } else if (xOriginal && xOriginal.startsWith('/api')) {
    req.url = xOriginal;
  } else if (req.url && req.url.includes('__url=')) {
    const match = req.url.match(/__url=([^&]+)/);
    if (match) {
      req.url = decodeURIComponent(match[1]);
    }
  }
  next();
});

// Ensure SQLite database is fully initialized before processing any requests
app.use(async (_req, _res, next) => {
  try {
    await initDatabase();
    next();
  } catch (err) {
    console.error('[Database] Middleware initialization failed:', err);
    next(err);
  }
});

// CORS configuration for cookies & frontend communication
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for production demo
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API Routes (mounted with /api prefix and direct prefix for proxy/serverless compatibility)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/appointments', '/appointments'], appointmentRoutes);
app.use(['/api/services', '/services'], serviceRoutes);
app.use(['/api/settings', '/settings'], settingRoutes);

// Health check endpoint
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BrightSmile Dental Clinic API',
    timestamp: new Date().toISOString(),
  });
});

// Explicit 404 handler for unmatched API routes
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve frontend static assets if client/dist or dist exists
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for frontend routes (only if accessed through express)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handler for uncaught exceptions in routes/middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Error]:', err);
  res.status(500).json({
    success: false,
    error: err?.message || 'Internal Server Error',
  });
});

const handler = (req: any, res: any) => {
  return app(req, res);
};

export { app, handler };
export default handler;
