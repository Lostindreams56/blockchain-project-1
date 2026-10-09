export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | unknown;
  timestamp: string;
}

export function formatSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function formatErrorResponse(error: string | unknown, message?: string): ApiResponse {
  return {
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  };
}
