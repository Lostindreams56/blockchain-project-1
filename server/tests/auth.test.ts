import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Session } from '../src/models/Session.js';
import { env } from '../src/config/env.js';
import { REFRESH_COOKIE_NAME, hashToken } from '../src/utils/token.js';

const TEST_DB_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/ethereum_fraud_test';

describe('Authentication API (/api/v1/auth)', () => {
  beforeAll(async () => {
    // Connect to isolated test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
    }
  });

  afterAll(async () => {
    // Drop test database and close connection cleanly
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  });

  beforeEach(async () => {
    // Clean collections before each test for complete test isolation
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user and set HttpOnly refresh cookie', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Alice Security',
          email: 'Alice.Security@Example.Com', // Test uppercase normalization
          password: 'Password123!@#',
          passwordConfirmation: 'Password123!@#',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.name).toBe('Alice Security');
      expect(response.body.data.user.email).toBe('alice.security@example.com');
      expect(response.body.data.user.role).toBe('user');
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
      expect(response.body.data).toHaveProperty('accessToken');

      // Verify HttpOnly refresh cookie in headers
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join(';') : cookies;
      expect(cookieStr).toContain(`${REFRESH_COOKIE_NAME}=`);
      expect(cookieStr.toLowerCase()).toContain('httponly');
    });

    it('should hash passwords securely and never store plaintext in database', async () => {
      const plainPassword = 'SuperSecurePassword999!';
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Hashing Tester',
          email: 'hashing@example.com',
          password: plainPassword,
        });

      const userInDb = await User.findOne({ email: 'hashing@example.com' }).select('+passwordHash');
      expect(userInDb).not.toBeNull();
      expect(userInDb!.passwordHash).not.toBe(plainPassword);
      // Bcrypt hash starts with $2a$ or $2b$
      expect(userInDb!.passwordHash).toMatch(/^\$2[ab]\$\d+\$/);
    });

    it('should reject duplicate email registration with 409 Conflict', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'First User',
          email: 'duplicate@example.com',
          password: 'Password123!@#',
        });

      // Attempt second registration with same email
      const duplicateResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'AnotherPassword123!@#',
        });

      expect(duplicateResponse.status).toBe(409);
      expect(duplicateResponse.body).toHaveProperty('success', false);
      expect(duplicateResponse.body.error).toContain('already exists');
    });

    it('should reject registration when request body violates Zod schema', async () => {
      // Weak password (< 8 chars, no uppercase, no numbers, no special chars)
      const invalidResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'A', // Too short
          email: 'not-an-email',
          password: 'short',
        });

      expect(invalidResponse.status).toBe(400);
      expect(invalidResponse.body).toHaveProperty('success', false);
      expect(Array.isArray(invalidResponse.body.error)).toBe(true);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Login User',
          email: 'login.user@example.com',
          password: 'Password123!@#',
        });
    });

    it('should authenticate user with valid credentials and issue tokens', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login.user@example.com',
          password: 'Password123!@#',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe('login.user@example.com');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
    });

    it('should reject login with wrong password using generic error message', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login.user@example.com',
          password: 'WrongPassword999!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password.');
    });

    it('should reject login with nonexistent email using generic error message', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!@#',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password.');
    });
  });

  describe('Protected endpoint: GET /api/v1/auth/me', () => {
    let validAccessToken: string;

    beforeEach(async () => {
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Protected User',
          email: 'protected@example.com',
          password: 'Password123!@#',
        });
      validAccessToken = regRes.body.data.accessToken;
    });

    it('should reject access without Bearer token with 401 Unauthorized', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toBe('UNAUTHORIZED');
    });

    it('should allow access with valid access token and return safe profile', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe('protected@example.com');
      expect(response.body.data.user.name).toBe('Protected User');
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
    });

    it('should reject access with an expired access token', async () => {
      // Craft an expired token
      const expiredToken = jwt.sign(
        { userId: new mongoose.Types.ObjectId().toString(), role: 'user' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '-10s' }
      );

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('TOKEN_EXPIRED');
    });

    it('should reject access with a forged/invalid access token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer forged.token.signature');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('INVALID_TOKEN');
    });
  });

  describe('Session Management: Token Rotation, Reuse Detection, and Logout', () => {
    let initialRefreshToken: string;
    let initialCookie: string;

    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Session User',
          email: 'session.user@example.com',
          password: 'Password123!@#',
        });

      const cookies = loginRes.headers['set-cookie'] as string[];
      initialCookie = cookies[0]!;
      // Extract raw token value
      const match = initialCookie.match(/refreshToken=([^;]+)/);
      initialRefreshToken = match ? match[1]! : '';
    });

    it('should successfully rotate refresh token and issue new access token', async () => {
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`${REFRESH_COOKIE_NAME}=${initialRefreshToken}`]);

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.data).toHaveProperty('accessToken');

      // Old token should be deleted/rotated from MongoDB
      const oldSessionInDb = await Session.findOne({ tokenHash: hashToken(initialRefreshToken) });
      expect(oldSessionInDb).toBeNull();

      // New cookie should be set
      const newCookies = refreshResponse.headers['set-cookie'] as string[];
      expect(newCookies).toBeDefined();
      const newCookieStr = newCookies[0]!;
      expect(newCookieStr).toContain(`${REFRESH_COOKIE_NAME}=`);
      expect(newCookieStr).not.toContain(initialRefreshToken);
    });

    it('should detect reuse of an already rotated refresh token and revoke family', async () => {
      // 1. Perform first legitimate refresh
      const firstRefresh = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`${REFRESH_COOKIE_NAME}=${initialRefreshToken}`]);
      expect(firstRefresh.status).toBe(200);

      // 2. Attacker attempts to reuse the old initialRefreshToken!
      const reuseAttempt = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`${REFRESH_COOKIE_NAME}=${initialRefreshToken}`]);

      // Must be rejected
      expect(reuseAttempt.status).toBe(401);
      expect(reuseAttempt.body.error).toContain('reused session token');

      // 3. Verify that all sessions for that family are now marked revoked
      const decoded = jwt.decode(initialRefreshToken) as { familyId: string };
      const familySessions = await Session.find({ familyId: decoded.familyId });
      for (const s of familySessions) {
        expect(s.isRevoked).toBe(true);
      }
    });

    it('should successfully logout, invalidate session in MongoDB, and clear cookie', async () => {
      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', [`${REFRESH_COOKIE_NAME}=${initialRefreshToken}`]);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body).toHaveProperty('success', true);

      // Session record should be removed from database
      const sessionInDb = await Session.findOne({ tokenHash: hashToken(initialRefreshToken) });
      expect(sessionInDb).toBeNull();

      // Cookie header should clear the cookie
      const cookies = logoutResponse.headers['set-cookie'] as string[];
      expect(cookies).toBeDefined();
      const clearedCookie = cookies[0]!;
      expect(clearedCookie).toContain(`${REFRESH_COOKIE_NAME}=;`);
    });
  });
});
