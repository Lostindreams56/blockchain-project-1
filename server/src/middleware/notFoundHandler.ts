import { Request, Response } from 'express';
import { formatErrorResponse } from '../utils/apiResponse.js';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(
    formatErrorResponse(
      `Resource not found: ${req.method} ${req.originalUrl}`,
      'NOT_FOUND'
    )
  );
}
