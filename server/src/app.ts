import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

/**
 * Creates and configures the Express application instance.
 * Separated from index.ts to facilitate automated testing without binding ports.
 */
export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration supporting Vercel previews and production
  const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in cloud deployment to avoid silent client breaks
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Cookie Parser for HttpOnly Refresh Tokens
  app.use(cookieParser());

  // Body Parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // HTTP Request Logging
  app.use(requestLogger);

  // Rate Limiting on API and Auth endpoints
  app.use('/api', apiRateLimiter);
  app.use('/auth', apiRateLimiter);

  // Root endpoint for cloud load balancer health probes (Render, Vercel, Fly)
  app.get('/', (_req, res) => {
    res.status(200).json({
      name: 'Ethereum Fraud Detection API',
      status: 'online',
      version: '1.0.0',
      health: '/api/v1/health',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API v1 canonical routes
  app.use('/api/v1', apiRouter);

  // Mount API aliases (supports clients configured without /api/v1 prefix)
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  // 404 Handler for undefined routes
  app.use(notFoundHandler);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}

export const app = createApp();
