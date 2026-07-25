import { Response } from 'express';
import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '@pagepulse/shared-types';
import { AppError } from '../errors/AppError';
import { HTTP_STATUS } from '../constants';
import { ValidationError } from '../errors/ValidationError';
import { UnexpectedError } from '../errors/UnexpectedError';

export class ResponseBuilder {
  static success<T>(
    res: Response,
    data: T,
    statusCode: number = HTTP_STATUS.OK,
    meta?: { requestId: string; durationMs?: number }
  ): Response<ApiSuccessEnvelope<T>> {
    return res.status(statusCode).json({
      success: true,
      data,
      meta: {
        requestId: meta?.requestId || 'unknown',
        timestamp: new Date().toISOString(),
        durationMs: meta?.durationMs,
      },
    });
  }

  static error(
    res: Response,
    appError: AppError,
    requestId: string
  ): Response<ApiErrorEnvelope> {
    const errorDetails = (appError as ValidationError).details;
    
    return res.status(appError.statusCode).json({
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        developerMessage: appError.developerMessage,
        recoveryAdvice: appError.recoveryAdvice,
        details: errorDetails,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static validationError(
    res: Response,
    message: string,
    details: unknown,
    requestId: string
  ): Response<ApiErrorEnvelope> {
    const error = new ValidationError(message, undefined, undefined, details);
    return this.error(res, error, requestId);
  }

  static internalError(
    res: Response,
    message: string,
    requestId: string
  ): Response<ApiErrorEnvelope> {
    const error = new UnexpectedError(message);
    return this.error(res, error, requestId);
  }
}
