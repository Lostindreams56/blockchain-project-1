import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  familyId: string;
}

export const REFRESH_COOKIE_NAME = 'refreshToken';

/**
 * Creates SHA-256 hash of a token string for safe database persistence.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a signed, short-lived JWT access token.
 */
export function generateAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

/**
 * Generates a signed, longer-lived JWT refresh token with a token family identifier.
 * Uses a unique UUID jwtid (jti) per issuance to guarantee cryptographic uniqueness
 * on every rotation, even within the same second.
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.REFRESH_TOKEN_TTL as jwt.SignOptions['expiresIn'],
    jwtid: crypto.randomUUID(), // RFC 7519 jti claim ensures unique token on each rotation
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

/**
 * Verifies and decodes an access token.
 * Throws JsonWebTokenError / TokenExpiredError on failure.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

/**
 * Verifies and decodes a refresh token.
 * Throws JsonWebTokenError / TokenExpiredError on failure.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

/**
 * Sets a secure, HttpOnly cookie containing the refresh token.
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  const isProduction = env.NODE_ENV === 'production';

  // 7 days in milliseconds
  const maxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/api/v1/auth',
    maxAge,
  });
}

/**
 * Clears the refresh token cookie.
 */
export function clearRefreshTokenCookie(res: Response): void {
  const isProduction = env.NODE_ENV === 'production';

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/api/v1/auth',
  });
}
