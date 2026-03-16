import { HttpStatus } from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';

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

export type ErrorLayer =
  | 'domain'
  | 'application'
  | 'infrastructure'
  | 'api'
  | 'startup'
  | 'unknown';

export interface AppErrorOptions {
  code: string;
  layer: ErrorLayer;
  message: string;
  details?: Record<string, unknown>;
  cause?: unknown;
  retryable?: boolean;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly layer: ErrorLayer;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: unknown;
  public readonly retryable: boolean;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = new.target.name;
    this.code = options.code;
    this.layer = options.layer;
    this.details = options.details;
    this.cause = options.cause;
    this.retryable = options.retryable ?? false;
  }
}

export function mapAppErrorToHttpStatus(error: AppError): number {
  switch (error.code) {
    case 'DOMAIN_VALIDATION_FAILED':
    case 'BAD_REQUEST':
    case 'UNPROCESSABLE_ENTITY':
      return HttpStatus.BAD_REQUEST;
    case 'UNAUTHORIZED':
      return HttpStatus.UNAUTHORIZED;
    case 'FORBIDDEN':
      return HttpStatus.FORBIDDEN;
    case 'ENTITY_NOT_FOUND':
    case 'NOT_FOUND':
      return HttpStatus.NOT_FOUND;
    case 'ENTITY_CONFLICT':
    case 'CONFLICT':
      return HttpStatus.CONFLICT;
    case 'TOO_MANY_REQUESTS':
      return HttpStatus.TOO_MANY_REQUESTS;
    case 'DEPENDENCY_UNAVAILABLE':
    case 'STARTUP_ERROR':
    case 'SERVICE_UNAVAILABLE':
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
    case 'BAD_REQUEST':
    case 'UNPROCESSABLE_ENTITY':
      return GrpcStatus.INVALID_ARGUMENT;
    case 'UNAUTHORIZED':
      return GrpcStatus.UNAUTHENTICATED;
    case 'FORBIDDEN':
      return GrpcStatus.PERMISSION_DENIED;
    case 'ENTITY_NOT_FOUND':
    case 'NOT_FOUND':
      return GrpcStatus.NOT_FOUND;
    case 'ENTITY_CONFLICT':
    case 'CONFLICT':
      return GrpcStatus.ALREADY_EXISTS;
    case 'TOO_MANY_REQUESTS':
      return GrpcStatus.RESOURCE_EXHAUSTED;
    case 'DEPENDENCY_UNAVAILABLE':
    case 'STARTUP_ERROR':
    case 'SERVICE_UNAVAILABLE':
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
