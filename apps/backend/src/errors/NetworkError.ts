import { AppError } from './AppError';

export class NetworkError extends AppError {
  constructor(
    message: string,
    developerMessage: string = 'A network error occurred while communicating with the target URL.',
    recoveryAdvice: string = 'Verify the URL is reachable and the server is responding correctly.'
  ) {
    super(message, 'NETWORK_ERROR', 502, developerMessage, recoveryAdvice);
  }
}
