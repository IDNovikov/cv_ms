import { AppError } from '../app.error';
import { DefaultErrorHandler } from './default/defaultError.handler';
import { RpcExceptionHandler } from './grpc/grpcError.handler';
import { HttpExceptionHandler } from './http/httpError.handler';

export interface IApiErrorHandler {
  canHandle(exception: unknown): boolean;
  handle(exception: unknown): AppError;
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

    return new DefaultErrorHandler().handle(exception);
  }
}

export const ApiErrorMapper = new _ApiErrorMapper([
  new HttpExceptionHandler(),
  new RpcExceptionHandler(),
]);
