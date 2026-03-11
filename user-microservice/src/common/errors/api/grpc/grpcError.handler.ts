import { RpcException } from '@nestjs/microservices';
import { ApiError, IApiErrorHandler } from '../api.error';

export class RpcExceptionHandler implements IApiErrorHandler {
  canHandle(exception: unknown): boolean {
    return exception instanceof RpcException;
  }

  handle(exception: unknown): ApiError {
    const rpcException = exception as RpcException;
    const rpcError = rpcException.getError();

    const message =
      typeof rpcError === 'string'
        ? rpcError
        : ((rpcError as { message?: string })?.message ?? 'RPC error');

    return new ApiError(
      'RPC_ERROR',
      message,
      typeof rpcError === 'object'
        ? (rpcError as Record<string, unknown>)
        : undefined,
      rpcException,
    );
  }
}
