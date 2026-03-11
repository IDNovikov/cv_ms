import { AppError } from '../../app.error';
import { IApiErrorHandler } from '../api.error';

export class DefaultErrorHandler implements IApiErrorHandler {
  canHandle(_exception: unknown): boolean {
    return true;
  }

  handle(exception: unknown): AppError {
    if (exception instanceof Error) {
      return new AppError({
        code: 'UNEXPECTED_ERROR',
        layer: 'unknown',
        message: exception.message,
        cause: exception,
      });
    }

    return new AppError({
      code: 'UNEXPECTED_ERROR',
      layer: 'unknown',
      message: 'Unknown error',
      details: { raw: String(exception) },
    });
  }
}
