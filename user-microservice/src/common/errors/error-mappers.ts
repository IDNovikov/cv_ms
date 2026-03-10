import { HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { AppError } from './app.error';

export interface HttpErrorShape {
  statusCode: number;
  error: string;
  code: string;
  layer: string;
  message: string;
  timestamp: string;
  path?: string;
  method?: string;
  details?: Record<string, unknown>;
}

export interface GrpcErrorShape {
  code: number;
  message: string;
  details?: string;
  metadata?: Record<string, unknown>;
}

export function toAppError(exception: unknown): AppError {
  if (exception instanceof AppError) {
    return exception;
  }

  if (exception instanceof RpcException) {
    const rpcError = exception.getError();
    const message =
      typeof rpcError === 'string'
        ? rpcError
        : (rpcError as { message?: string })?.message ?? 'RPC error';
    return new AppError({
      code: 'RPC_ERROR',
      layer: 'transport',
      message,
      details: typeof rpcError === 'object' ? (rpcError as Record<string, unknown>) : undefined,
      cause: exception,
    });
  }

  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    const status = exception.getStatus();
    const body =
      typeof response === 'object' && response !== null
        ? (response as Record<string, unknown>)
        : { message: response };

    return new AppError({
      code: (body.code as string) ?? httpStatusToCode(status),
      layer: 'transport',
      message: String(body.message ?? exception.message),
      details: body,
      cause: exception,
    });
  }

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

export function mapAppErrorToHttpStatus(error: AppError): number {
  switch (error.code) {
    case 'DOMAIN_VALIDATION_FAILED':
      return HttpStatus.BAD_REQUEST;
    case 'ENTITY_NOT_FOUND':
      return HttpStatus.NOT_FOUND;
    case 'ENTITY_CONFLICT':
      return HttpStatus.CONFLICT;
    case 'DEPENDENCY_UNAVAILABLE':
      return HttpStatus.SERVICE_UNAVAILABLE;
    case 'STARTUP_ERROR':
      return HttpStatus.SERVICE_UNAVAILABLE;
    case 'PERSISTENCE_ERROR':
      return HttpStatus.INTERNAL_SERVER_ERROR;
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

export function mapAppErrorToGrpcStatus(error: AppError): number {
  switch (error.code) {
    case 'DOMAIN_VALIDATION_FAILED':
      return GrpcStatus.INVALID_ARGUMENT;
    case 'ENTITY_NOT_FOUND':
      return GrpcStatus.NOT_FOUND;
    case 'ENTITY_CONFLICT':
      return GrpcStatus.ALREADY_EXISTS;
    case 'DEPENDENCY_UNAVAILABLE':
      return GrpcStatus.UNAVAILABLE;
    case 'STARTUP_ERROR':
      return GrpcStatus.UNAVAILABLE;
    case 'PERSISTENCE_ERROR':
      return GrpcStatus.INTERNAL;
    default:
      return GrpcStatus.INTERNAL;
  }
}

export function toHttpErrorShape(
  error: AppError,
  status: number,
  path?: string,
  method?: string,
): HttpErrorShape {
  return {
    statusCode: status,
    error: HttpStatus[status] ?? 'Error',
    code: error.code,
    layer: error.layer,
    message: error.message,
    timestamp: new Date().toISOString(),
    path,
    method,
    details: error.details,
  };
}

export function toGrpcErrorShape(error: AppError): GrpcErrorShape {
  const code = mapAppErrorToGrpcStatus(error);
  return {
    code,
    message: error.message,
    details: JSON.stringify({
      code: error.code,
      layer: error.layer,
      retryable: error.retryable,
      details: error.details,
    }),
  };
}

function httpStatusToCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.SERVICE_UNAVAILABLE:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'HTTP_EXCEPTION';
  }
}
