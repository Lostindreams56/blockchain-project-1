import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { formatErrorResponse } from '../utils/apiResponse.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : 'An unexpected internal server error occurred';

  logger.error(
    {
      err: err instanceof Error ? { message: err.message, stack: err.stack } : err,
      path: req.originalUrl,
      method: req.method,
      statusCode,
    },
    'Centralized error handler caught exception'
  );

  const errorPayload =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred. Please contact system support.'
      : message;

  res.status(statusCode).json(
    formatErrorResponse(
      errorPayload,
      isAppError && err.details ? String(err.details) : undefined
    )
  );
}
