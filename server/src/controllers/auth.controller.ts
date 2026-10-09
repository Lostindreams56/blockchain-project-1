import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_COOKIE_NAME,
} from '../utils/token.js';
import { formatSuccessResponse, formatErrorResponse } from '../utils/apiResponse.js';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientMeta = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      };

      const result = await authService.register(req.body, clientMeta);

      // Establish HttpOnly session cookie
      setRefreshTokenCookie(res, result.refreshToken);

      res.status(201).json(
        formatSuccessResponse(
          {
            user: result.user,
            accessToken: result.accessToken,
          },
          'Account created successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientMeta = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      };

      const result = await authService.login(req.body, clientMeta);

      // Establish HttpOnly session cookie
      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json(
        formatSuccessResponse(
          {
            user: result.user,
            accessToken: result.accessToken,
          },
          'Authentication successful'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Rotates session tokens. Reads refresh token from HttpOnly cookie.
   */
  public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken =
        req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

      if (!rawRefreshToken) {
        res.status(401).json(
          formatErrorResponse(
            'Refresh token not provided. Please log in to create a session.',
            'UNAUTHORIZED'
          )
        );
        return;
      }

      const clientMeta = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      };

      const result = await authService.refreshToken(rawRefreshToken, clientMeta);

      // Set rotated HttpOnly cookie
      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json(
        formatSuccessResponse(
          {
            user: result.user,
            accessToken: result.accessToken,
          },
          'Session refreshed successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken =
        req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

      if (rawRefreshToken) {
        await authService.logout(rawRefreshToken);
      }

      clearRefreshTokenCookie(res);

      res.status(200).json(formatSuccessResponse(null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Protected: returns current user safe profile.
   */
  public getMe(req: Request, res: Response): void {
    res.status(200).json(
      formatSuccessResponse(
        { user: req.user },
        'Current user profile retrieved'
      )
    );
  }
}

export const authController = new AuthController();
