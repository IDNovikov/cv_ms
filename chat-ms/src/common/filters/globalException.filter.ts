import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';
import {
  ApiErrorMapper,
  mapAppErrorToHttpStatus,
  toGrpcErrorShape,
  toHttpErrorShape,
} from '../errors';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const appError = ApiErrorMapper.map(exception);
    this.logger.error(
      {
        code: appError.code,
        layer: appError.layer,
        message: appError.message,
        details: appError.details,
      },
      appError.stack,
    );

    if (host.getType() === 'rpc') {
      throw new RpcException(toGrpcErrorShape(appError));
    }

    const context = host.switchToHttp();
    const req = context.getRequest<Request>();
    const res = context.getResponse<Response>();
    const status = mapAppErrorToHttpStatus(appError);

    res
      .status(status)
      .json(toHttpErrorShape(appError, status, req?.url, req?.method));
  }
}
