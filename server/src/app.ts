import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { IStorageRepository } from './services/storage/types';
import { createApiRouter } from './routes/api';
import { config, isOriginAllowed } from './config/env';

export function createApp(storage: IStorageRepository): Express {
  const app = express();

  // Security headers with helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible websocket & local scripts
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Dynamic CORS configuration supporting local dev and live client URLs
  app.use(
    cors({
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked for origin: ${origin}`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting for expensive translation/summary endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use('/api', apiLimiter);

  // Mount API router
  app.use('/api', createApiRouter(storage));

  // Root health fallback
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', app: 'VerbaLoop Backend' });
  });

  return app;
}

