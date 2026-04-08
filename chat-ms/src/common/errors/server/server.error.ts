import { AppError } from '../app.error';

export class ServerError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super({
      code: 'STARTUP_ERROR',
      layer: 'startup',
      message,
      details,
      cause,
    });
  }
}
