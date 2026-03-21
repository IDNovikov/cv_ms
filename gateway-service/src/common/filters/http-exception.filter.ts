import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorDetails = unknown;

type ErrorResponseBody = {
  success: false;
  error: {
    statusCode: number;
    error: string;
    code: string;
    message: string;
    details?: ErrorDetails;
  };
  timestamp: string;
  path: string;
  method: string;
};

type GrpcErrorPayload = {
  code?: string;
  layer?: string;
  retryable?: boolean;
  details?: ErrorDetails;
};

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const req = context.getRequest<Request>();
    const res = context.getResponse<Response>();

    const error = exception instanceof HttpException
      ? this.fromHttpException(exception)
      : this.fromUnknownException(exception);

    const body: ErrorResponseBody = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    };

    res.status(error.statusCode).json(body);
  }

  private fromHttpException(exception: HttpException) {
    const statusCode = exception.getStatus();
    const response = exception.getResponse();
    const body =
      typeof response === 'object' && response !== null
        ? (response as Record<string, unknown>)
        : { message: response };

    return {
      statusCode,
      error: this.resolveHttpErrorName(statusCode),
      code: this.resolveErrorCode(statusCode, body.code),
      message: this.resolveMessage(body.message, exception.message),
      details: body.details,
    };
  }

  private fromUnknownException(exception: unknown) {
    if (this.isGrpcException(exception)) {
      return this.fromGrpcException(exception);
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
        message: exception.message,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unknown error',
    };
  }

  private fromGrpcException(exception: Record<string, unknown>) {
    const statusCode = this.mapGrpcStatusToHttpStatus(Number(exception.code));
    const payload = this.parseGrpcPayload(exception.details);
    const message = this.resolveGrpcMessage(exception, payload);

    return {
      statusCode,
      error: this.resolveHttpErrorName(statusCode),
      code: payload?.code ?? this.resolveErrorCode(statusCode),
      message,
      details: payload?.details,
    };
  }

  private isGrpcException(exception: unknown): exception is Record<string, unknown> {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      'details' in exception
    );
  }

  private parseGrpcPayload(details: unknown): GrpcErrorPayload | null {
    if (typeof details !== 'string') return null;

    try {
      const parsed = JSON.parse(details) as GrpcErrorPayload;
      if (parsed && typeof parsed === 'object') return parsed;
      return null;
    } catch {
      return null;
    }
  }

  private resolveGrpcMessage(
    exception: Record<string, unknown>,
    payload: GrpcErrorPayload | null,
  ): string {
    if (payload?.details && typeof payload.details === 'object') {
      const details = payload.details as Record<string, unknown>;
      if (typeof details.message === 'string') return details.message;
    }

    if (typeof exception.details === 'string' && !this.looksLikeJson(exception.details)) {
      return exception.details;
    }

    if (typeof exception.message === 'string') {
      return exception.message.replace(/^\d+\s+[A-Z_]+:\s*/, '');
    }

    return 'Upstream service error';
  }

  private looksLikeJson(value: string): boolean {
    return value.trim().startsWith('{') || value.trim().startsWith('[');
  }

  private resolveMessage(message: unknown, fallback: string): string {
    if (Array.isArray(message)) {
      return 'Validation failed';
    }

    if (typeof message === 'string') {
      return message;
    }

    return fallback;
  }

  private resolveErrorCode(statusCode: number, code?: unknown): string {
    if (typeof code === 'string' && code.length > 0) {
      return code;
    }

    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }

  private resolveHttpErrorName(statusCode: number): string {
    return HttpStatus[statusCode] ?? 'Error';
  }

  private mapGrpcStatusToHttpStatus(status: number): number {
    switch (status) {
      case 3:
        return HttpStatus.BAD_REQUEST;
      case 16:
        return HttpStatus.UNAUTHORIZED;
      case 7:
        return HttpStatus.FORBIDDEN;
      case 5:
        return HttpStatus.NOT_FOUND;
      case 6:
        return HttpStatus.CONFLICT;
      case 8:
        return HttpStatus.TOO_MANY_REQUESTS;
      case 14:
        return HttpStatus.SERVICE_UNAVAILABLE;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
