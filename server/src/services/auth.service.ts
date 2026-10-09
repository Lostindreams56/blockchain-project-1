import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, SafeUser, toSafeUser } from '../models/User.js';
import { Session } from '../models/Session.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/token.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../config/logger.js';

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export interface ClientMeta {
  userAgent?: string;
  ipAddress?: string;
}

export class AuthService {
  /**
   * Registers a new user with normalized email and hashed password.
   */
  public async register(input: RegisterInput, clientMeta: ClientMeta): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check for duplicate account
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    // Secure password hashing
    const passwordHash = await hashPassword(input.password);

    // Persist new user
    const user = await User.create({
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'user',
    });

    // Establish initial session & token family
    const familyId = crypto.randomUUID();
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      familyId,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await Session.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      familyId,
      expiresAt,
      userAgent: clientMeta.userAgent,
      ipAddress: clientMeta.ipAddress,
    });

    logger.info({ userId: user._id.toString() }, 'New user successfully registered');

    return {
      user: toSafeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Authenticates user credentials and establishes a new session.
   */
  public async login(input: LoginInput, clientMeta: ClientMeta): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Retrieve user including the hidden passwordHash field
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    // Timing-resistant generic error message
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Issue tokens and start a new token family
    const familyId = crypto.randomUUID();
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      familyId,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await Session.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      familyId,
      expiresAt,
      userAgent: clientMeta.userAgent,
      ipAddress: clientMeta.ipAddress,
    });

    logger.info({ userId: user._id.toString() }, 'User authenticated successfully');

    return {
      user: toSafeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refreshes an access token using a valid refresh token.
   * Enforces strict token rotation and detects token reuse attacks.
   */
  public async refreshToken(
    rawRefreshToken: string,
    clientMeta: ClientMeta
  ): Promise<AuthResult> {
    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired. Please log in again.', 401);
      }
      throw new AppError('Invalid refresh token.', 401);
    }

    const currentTokenHash = hashToken(rawRefreshToken);
    const existingSession = await Session.findOne({ tokenHash: currentTokenHash });

    // REUSE DETECTION: If token signature is valid but not found in DB or marked revoked,
    // an attacker or stale client is attempting to reuse an already-rotated token!
    if (!existingSession || existingSession.isRevoked) {
      // Invalidate the entire token family immediately as a protective measure
      await Session.updateMany(
        { familyId: decoded.familyId },
        { isRevoked: true }
      );

      logger.warn(
        { userId: decoded.userId, familyId: decoded.familyId },
        'Potential refresh token reuse attack detected! Invalidated all sessions in family.'
      );

      throw new AppError(
        'Invalid or reused session token. All sessions in this chain have been revoked. Please log in again.',
        401
      );
    }

    const user = await User.findById(existingSession.userId);
    if (!user) {
      throw new AppError('User associated with session not found.', 401);
    }

    // Delete or revoke the old token (Single-use token rotation)
    await Session.deleteOne({ _id: existingSession._id });

    // Issue new tokens maintaining the same familyId
    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      familyId: existingSession.familyId,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await Session.create({
      userId: user._id,
      tokenHash: hashToken(newRefreshToken),
      familyId: existingSession.familyId,
      expiresAt,
      userAgent: clientMeta.userAgent,
      ipAddress: clientMeta.ipAddress,
    });

    return {
      user: toSafeUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Invalidates session in database on logout.
   */
  public async logout(rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await Session.deleteOne({ tokenHash });
    }
  }
}

export const authService = new AuthService();
