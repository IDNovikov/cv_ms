import { AppError } from '../app.error';

export class InfrastructureError extends AppError {
  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
    cause?: unknown,
    retryable = true,
  ) {
    super({
      code,
      layer: 'infrastructure',
      message,
      details,
      cause,
      retryable,
    });
  }
}
