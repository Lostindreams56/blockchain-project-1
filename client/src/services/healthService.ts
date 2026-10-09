import { apiClient } from '../lib/axios';
import { ApiResponse } from '../types/api';
import { HealthData, ReadinessData } from '../types/health';

export const healthService = {
  /**
   * Fetches service liveness and runtime metadata.
   */
  async getHealth(): Promise<HealthData> {
    const response = await apiClient.get<ApiResponse<HealthData>>('/health');
    return response.data.data;
  },

  /**
   * Fetches infrastructure readiness (MongoDB Atlas connection state).
   */
  async getReadiness(): Promise<ReadinessData> {
    const response = await apiClient.get<ApiResponse<ReadinessData>>('/ready');
    return response.data.data;
  },
};
