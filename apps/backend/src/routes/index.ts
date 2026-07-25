import { Router, Request, Response } from 'express';
import healthRoutes from './healthRoutes';
import auditRoutes from './auditRoutes';
import { ResponseBuilder } from '../utils/responseBuilder';
import { AppError } from '../errors/AppError';

const router = Router();

// Health check endpoint
router.use('/health', healthRoutes);

// Main Audit API endpoints
router.use('/api/v1/audit', auditRoutes);

// Route aliases for backward compatibility & direct API access (/api/audit & /analyze)
router.use('/api/audit', auditRoutes);
router.use('/analyze', auditRoutes);

// 404 Handler for unmatched routes
router.use('*', (req: Request, res: Response) => {
  const requestId = req.id || 'unknown';
  const notFoundError = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    'NOT_FOUND',
    404,
    'The requested API endpoint does not exist on this server.',
    'Check the endpoint path and method (e.g. POST /api/v1/audit, POST /analyze, or GET /health).'
  );
  return ResponseBuilder.error(res, notFoundError, requestId);
});

export default router;
