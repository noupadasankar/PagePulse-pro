import { AppError } from './AppError';

export class ParserError extends AppError {
  constructor(
    message: string,
    developerMessage: string = 'Failed to parse the HTML content.',
    recoveryAdvice: string = 'The HTML content might be malformed or too complex.'
  ) {
    super(message, 'PARSER_ERROR', 422, developerMessage, recoveryAdvice);
  }
}
