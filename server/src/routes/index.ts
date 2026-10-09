import { Router } from 'express';
import { healthRoutes } from './health.routes.js';

const apiRouter = Router();

// Mount system routes
apiRouter.use('/', healthRoutes);

// Placeholder: Future feature routes will be mounted here:
// apiRouter.use('/auth', authRoutes);
// apiRouter.use('/wallets', walletRoutes);
// apiRouter.use('/analysis', analysisRoutes);
// apiRouter.use('/investigations', investigationRoutes);

export { apiRouter };
