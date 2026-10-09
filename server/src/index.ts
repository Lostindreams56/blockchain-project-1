import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { dbManager } from './config/database.js';

let server: http.Server | null = null;
let isShuttingDown = false;

async function bootstrap(): Promise<void> {
  try {
    // Attempt database connection (non-blocking for server startup in local development)
    dbManager.connect().catch((err) => {
      logger.warn({ err }, 'Initial MongoDB connection failed. Application will retry or operate in degraded mode.');
    });

    // Start HTTP listener
    server = app.listen(env.PORT, () => {
      logger.info('======================================================');
      logger.info(` Ethereum Fraud Detection & Risk Intelligence Platform `);
      logger.info(` Environment: ${env.NODE_ENV}`);
      logger.info(` Server URL:  http://localhost:${env.PORT}`);
      logger.info(` Health URL:  http://localhost:${env.PORT}/api/v1/health`);
      logger.info(` Ready URL:   http://localhost:${env.PORT}/api/v1/ready`);
      logger.info(` Client CORS: ${env.CLIENT_URL}`);
      logger.info('======================================================');
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${env.PORT} is already in use.`);
      } else {
        logger.error({ error }, 'HTTP Server error');
      }
      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to bootstrap server');
    process.exit(1);
  }
}

/**
 * Handles graceful shutdown by closing the HTTP listener and DB connections.
 */
async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Force exit safety timeout (10 seconds)
  const forceExitTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
  forceExitTimeout.unref();

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((err) => {
          if (err) return reject(err);
          logger.info('HTTP server stopped accepting connections.');
          resolve();
        });
      });
    }

    await dbManager.disconnect();
    logger.info('Graceful shutdown complete. Exiting process.');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error occurred during graceful shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'Uncaught Exception detected!');
  void shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ reason }, 'Unhandled Promise Rejection detected!');
  void shutdown('unhandledRejection');
});

void bootstrap();
