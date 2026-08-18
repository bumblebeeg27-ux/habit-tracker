import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { requireClientKey } from './middleware/clientKey.js';
import { aiRateLimiter } from './middleware/rateLimiter.js';
import planRoutes from './routes/plan.routes.js';

export const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : false }));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/plan', requireClientKey, aiRateLimiter, planRoutes);

app.use(notFound);
app.use(errorHandler);
