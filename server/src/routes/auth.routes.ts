import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateBody, registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { csrfProtection } from '../middleware/csrfProtection.js';

const router = Router();

// Public Authentication Endpoints
router.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema),
  (req, res, next) => authController.register(req, res, next)
);

router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  (req, res, next) => authController.login(req, res, next)
);

// Session Endpoints (Cookie-based, protected by CSRF origin verification)
router.post(
  '/refresh',
  csrfProtection,
  (req, res, next) => authController.refresh(req, res, next)
);

router.post(
  '/logout',
  csrfProtection,
  (req, res, next) => authController.logout(req, res, next)
);

// Protected Identity Endpoint
router.get(
  '/me',
  authenticate,
  (req, res) => authController.getMe(req, res)
);

export const authRoutes = router;
