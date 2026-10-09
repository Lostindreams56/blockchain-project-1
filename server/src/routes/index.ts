import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { authRoutes } from './auth.routes.js';

const apiRouter = Router();

// Mount system routes
apiRouter.use('/', healthRoutes);

// Mount Stage 2 Authentication routes
apiRouter.use('/auth', authRoutes);

// Placeholder: Future feature routes will be mounted in upcoming stages:
// apiRouter.use('/wallets', walletRoutes);
// apiRouter.use('/analysis', analysisRoutes);
// apiRouter.use('/investigations', investigationRoutes);

export { apiRouter };
