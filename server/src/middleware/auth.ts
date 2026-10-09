import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken, AccessTokenPayload } from '../utils/token.js';
import { User, IUser } from '../models/User.js';
import { formatErrorResponse } from '../utils/apiResponse.js';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: IUser['role'];
  createdAt: Date;
}

// Extend Express Request type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Reusable JWT Authentication Middleware.
 * Enforces Bearer token presence, validity, and active user state in MongoDB.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(
      formatErrorResponse(
        'Authentication required. Please provide a valid Bearer token.',
        'UNAUTHORIZED'
      )
    );
    return;
  }

  const token = authHeader.substring(7).trim();

  let decoded: AccessTokenPayload;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json(
        formatErrorResponse(
          'Access token has expired. Please refresh your session.',
          'TOKEN_EXPIRED'
        )
      );
      return;
    }

    res.status(401).json(
      formatErrorResponse(
        'Access token is invalid or malformed.',
        'INVALID_TOKEN'
      )
    );
    return;
  }

  try {
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json(
        formatErrorResponse(
          'The user associated with this token no longer exists.',
          'USER_NOT_FOUND'
        )
      );
      return;
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    next();
  } catch (error) {
    next(error);
  }
}
