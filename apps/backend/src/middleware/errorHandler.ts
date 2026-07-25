import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ResponseBuilder } from '../utils/responseBuilder';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.id || 'unknown';

  if (err instanceof AppError) {
    logger.error(`[${requestId}] AppError (${err.code}): ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      developerMessage: err.developerMessage,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
    return ResponseBuilder.error(res, err, requestId);
  }

  logger.error(`[${requestId}] Unhandled Error: ${err.message}`, {
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  return ResponseBuilder.internalError(res, 'An unexpected server error occurred.', requestId);
};

