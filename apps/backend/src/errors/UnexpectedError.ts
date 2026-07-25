import { AppError } from './AppError';

export class UnexpectedError extends AppError {
  constructor(
    message: string = 'An unexpected error occurred.',
    developerMessage: string = 'An internal server error happened.',
    recoveryAdvice: string = 'Check the server logs for more details.'
  ) {
    super(message, 'INTERNAL_ERROR', 500, developerMessage, recoveryAdvice, false);
  }
}
