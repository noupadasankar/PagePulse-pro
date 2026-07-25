import { AppError } from './AppError';

export class ValidationError extends AppError {
  public details: unknown;

  constructor(
    message: string,
    developerMessage: string = 'Validation failed for the provided input.',
    recoveryAdvice: string = 'Check the details object for specific validation errors.',
    details?: unknown
  ) {
    super(message, 'VALIDATION_ERROR', 400, developerMessage, recoveryAdvice);
    this.details = details;
  }
}
