import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { requireClientKey } from './middleware/clientKey.js';
import { aiRateLimiter } from './middleware/rateLimiter.js';
import planRoutes from './routes/plan.routes.js';
import chatRoutes from './routes/chat.routes.js';

export const app = express();

// Render sits behind a reverse proxy, so without this every request's
// req.ip resolves to the proxy's address instead of the real client --
// collapsing express-rate-limit's per-client buckets into one shared
// bucket for the entire app.
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : false }));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/plan', requireClientKey, aiRateLimiter, planRoutes);
app.use('/api/chat', requireClientKey, aiRateLimiter, chatRoutes);

app.use(notFound);
app.use(errorHandler);
