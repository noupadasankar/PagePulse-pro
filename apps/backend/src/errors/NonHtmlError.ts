import { AppError } from './AppError';

export class NonHtmlError extends AppError {
  constructor(
    message: string,
    developerMessage: string = 'The target URL returned non-HTML content.',
    recoveryAdvice: string = 'Ensure the target URL points to a web page, not an image, document, or API endpoint.'
  ) {
    super(message, 'NON_HTML_CONTENT', 415, developerMessage, recoveryAdvice);
  }
}
