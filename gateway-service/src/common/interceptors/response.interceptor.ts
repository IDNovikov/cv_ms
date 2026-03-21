import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => {
        if (this.isAlreadyWrapped(data)) {
          return data;
        }

        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          path: req.url,
          method: req.method,
        };
      }),
    );
  }

  private isAlreadyWrapped(data: unknown): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      typeof (data as { success?: unknown }).success === 'boolean'
    );
  }
}
