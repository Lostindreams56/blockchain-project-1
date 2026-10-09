import pino from 'pino';
import { env } from './env.js';

/**
 * Structured logger configured with Pino.
 * Redacts sensitive fields from logs and uses human-friendly pretty formatting in development.
 */
export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'apiKey',
      'api_key',
      'secret',
      'jwt',
      'accessToken',
      'refreshToken',
      '*.password',
      '*.secret',
    ],
    remove: true,
  },
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});
