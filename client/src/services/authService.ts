import { apiClient, setAccessToken } from '../lib/axios';
import { ApiResponse } from '../types/api';
import {
  AuthResponseData,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types/auth';

export const authService = {
  /**
   * Registers a new account and initializes authenticated session.
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      '/auth/register',
      credentials
    );
    const data = response.data.data;
    setAccessToken(data.accessToken);
    return data;
  },

  /**
   * Authenticates user with email and password.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      '/auth/login',
      credentials
    );
    const data = response.data.data;
    setAccessToken(data.accessToken);
    return data;
  },

  /**
   * Refreshes access token using the HttpOnly refresh token cookie.
   */
  async refresh(): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      '/auth/refresh',
      {}
    );
    const data = response.data.data;
    setAccessToken(data.accessToken);
    return data;
  },

  /**
   * Invalidate session in database and clear HttpOnly cookie.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse<null>>('/auth/logout', {});
    } finally {
      setAccessToken(null);
    }
  },

  /**
   * Retrieves current authenticated user profile.
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data.user;
  },
};
