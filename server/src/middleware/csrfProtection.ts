import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { formatErrorResponse } from '../utils/apiResponse.js';

/**
 * CSRF Protection Middleware for Cookie-Authenticated Endpoints.
 * Validates Origin / Referer against authorized client URLs and checks for custom headers.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Safe HTTP methods do not alter state
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  // In test environment, allow simulated requests without full browser headers
  if (env.NODE_ENV === 'test') {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const clientUrl = env.CLIENT_URL.replace(/\/$/, '');

  // If origin is present, ensure it matches allowed client URL
  if (origin) {
    if (origin.replace(/\/$/, '') !== clientUrl) {
      res.status(403).json(
        formatErrorResponse(
          'Cross-Site Request Forgery (CSRF) check failed: invalid origin.',
          'CSRF_FORBIDDEN'
        )
      );
      return;
    }
    return next();
  }

  // Fallback to referer if origin is absent
  if (referer) {
    if (!referer.startsWith(clientUrl)) {
      res.status(403).json(
        formatErrorResponse(
          'Cross-Site Request Forgery (CSRF) check failed: invalid referer.',
          'CSRF_FORBIDDEN'
        )
      );
      return;
    }
    return next();
  }

  // If neither origin nor referer is provided for a cookie-authenticated POST request
  const hasCustomHeader = Boolean(req.headers['x-requested-with']);
  if (!hasCustomHeader && env.NODE_ENV === 'production') {
    res.status(403).json(
      formatErrorResponse(
        'Cross-Site Request Forgery (CSRF) check failed: missing origin verification.',
        'CSRF_FORBIDDEN'
      )
    );
    return;
  }

  next();
}
