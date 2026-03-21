import { BadRequestException, ValidationPipeOptions } from '@nestjs/common';

export function getValidationPipeConfig(): ValidationPipeOptions {
  return {
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      return new BadRequestException({
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        details: errors.map((error) => ({
          field: error.property,
          constraints: error.constraints ?? {},
        })),
      });
    },
  };
}
