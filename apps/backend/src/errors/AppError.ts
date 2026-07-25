export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public developerMessage: string;
  public recoveryAdvice: string;
  public isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    developerMessage: string,
    recoveryAdvice: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.developerMessage = developerMessage;
    this.recoveryAdvice = recoveryAdvice;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
