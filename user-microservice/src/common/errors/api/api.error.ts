import { AppError } from '../app.error';
import { RpcExceptionHandler } from './grpc/grpcError.handler';
import { HttpExceptionHandler } from './http/httpError.handler';

export interface IApiErrorHandler {
  canHandle(exception: unknown): boolean;
  handle(exception: unknown): ApiError;
}

export class ApiError extends AppError {
  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
    cause?: unknown,
    retryable = false,
  ) {
    super({
      code,
      layer: 'api',
      message,
      details,
      cause,
      retryable,
    });
  }
}

class _ApiErrorMapper {
  constructor(private readonly handlers: IApiErrorHandler[]) {}

  public map(exception: unknown): AppError {
    if (exception instanceof AppError) {
      return exception;
    }

    for (const handler of this.handlers) {
      if (handler.canHandle(exception)) {
        return handler.handle(exception);
      }
    }

    if (exception instanceof Error) {
      return new ApiError(
        'UNEXPECTED_API_ERROR',
        exception.message,
        undefined,
        exception,
      );
    }

    return new ApiError('UNKNOWN_API_ERROR', 'Unknown error', {
      raw: String(exception),
    });
  }
}

export const ApiErrorMapper = new _ApiErrorMapper([
  new HttpExceptionHandler(),
  new RpcExceptionHandler(),
]);
