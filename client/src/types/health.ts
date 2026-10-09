export interface HealthData {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
}

export interface DatabaseStatus {
  status: 'connected' | 'connecting' | 'disconnecting' | 'disconnected';
  readyState: number;
  isReady: boolean;
}

export interface ReadinessData {
  ready: boolean;
  status: 'ready' | 'not_ready';
  service: string;
  database: DatabaseStatus;
  timestamp: string;
}
