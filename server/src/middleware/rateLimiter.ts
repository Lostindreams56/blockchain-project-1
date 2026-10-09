import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { formatErrorResponse } from '../utils/apiResponse.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'test' ? 1000 : env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(
      formatErrorResponse(
        'Too many requests from this IP address. Please try again later.',
        'RATE_LIMIT_EXCEEDED'
      )
    );
  },
});

/**
 * Stricter rate limiter specifically for authentication attempts (login & register).
 * Prevents credential stuffing and brute-force attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'test' ? 1000 : env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (_req, res) => {
    res.status(429).json(
      formatErrorResponse(
        'Too many authentication attempts. Please try again after 15 minutes.',
        'AUTH_RATE_LIMIT_EXCEEDED'
      )
    );
  },
});
