import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptors implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptors.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();
    const handler = `${context.getClass().name}.${context.getHandler().name}`;
    this.logger.log(`Request start: ${handler}`);

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(`Request end: ${handler}, ${Date.now() - now}ms`),
        ),
      );
  }
}
