import { AppError } from '../app.error';

export class ApplicationError extends AppError {
  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super({ code, layer: 'application', message, details, cause });
  }
}
