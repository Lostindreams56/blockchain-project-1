import { Request, Response } from 'express';
import { healthService } from '../services/health.service.js';
import { formatSuccessResponse } from '../utils/apiResponse.js';

export class HealthController {
  /**
   * GET /api/v1/health
   * Liveness probe: returns basic service metadata and uptime.
   */
  public getHealth(_req: Request, res: Response): void {
    const health = healthService.getHealth();
    res.status(200).json(formatSuccessResponse(health, 'Service is healthy'));
  }

  /**
   * GET /api/v1/ready
   * Readiness probe: checks underlying dependencies like MongoDB Atlas.
   */
  public getReadiness(_req: Request, res: Response): void {
    const readiness = healthService.getReadiness();
    const httpStatus = readiness.ready ? 200 : 503;
    const message = readiness.ready
      ? 'Service is ready to handle traffic'
      : 'Service dependencies not yet ready';

    res.status(httpStatus).json(formatSuccessResponse(readiness, message));
  }
}

export const healthController = new HealthController();
