import { env } from '../config/env.js';
import { dbManager, DbStatus } from '../config/database.js';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
}

export interface ReadinessStatus {
  ready: boolean;
  status: 'ready' | 'not_ready';
  service: string;
  database: DbStatus;
  timestamp: string;
}

export class HealthService {
  private readonly startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Basic liveness check. Confirms the Node.js process is alive and responsive.
   * Does NOT depend on external infrastructure like MongoDB.
   */
  public getHealth(): HealthStatus {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      status: 'ok',
      service: 'ethereum-fraud-detection-api',
      version: '1.0.0',
      environment: env.NODE_ENV,
      uptimeSeconds,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness check. Evaluates whether dependencies (MongoDB) are available
   * and capable of serving user traffic.
   */
  public getReadiness(): ReadinessStatus {
    const dbStatus = dbManager.getStatus();
    const isReady = dbStatus.isReady;

    return {
      ready: isReady,
      status: isReady ? 'ready' : 'not_ready',
      service: 'ethereum-fraud-detection-api',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}

export const healthService = new HealthService();
