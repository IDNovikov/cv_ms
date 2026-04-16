import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiError, IApiErrorHandler } from '../api.error';

export class HttpExceptionHandler implements IApiErrorHandler {
  public canHandle(exception: unknown): boolean {
    return exception instanceof HttpException;
  }

  public handle(exception: unknown): ApiError {
    const httpException = exception as HttpException;
    const response = httpException.getResponse();
    const status = httpException.getStatus() as HttpStatus;

    const body =
      typeof response === 'object' && response !== null
        ? (response as Record<string, unknown>)
        : { message: response };

    return new ApiError(
      (body.code as string) ?? this.httpStatusToCode(status),
      this.resolveMessage(body.message, httpException.message),
      body,
      httpException,
    );
  }

  private resolveMessage(message: unknown, fallback: string): string {
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) {
      return message.map((item) => String(item)).join(', ');
    }

    return fallback;
  }

  private httpStatusToCode(status: HttpStatus): string {
    switch (status) {
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
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'HTTP_EXCEPTION';
    }
  }
}
