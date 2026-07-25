import { AppError } from './AppError';

export class TimeoutError extends AppError {
  constructor(
    message: string,
    developerMessage: string = 'The request to the target URL timed out.',
    recoveryAdvice: string = 'Try again later or check if the target server is slow to respond.'
  ) {
    super(message, 'TIMEOUT_ERROR', 504, developerMessage, recoveryAdvice);
  }
}
