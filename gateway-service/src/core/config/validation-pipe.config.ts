import { BadRequestException, ValidationPipeOptions } from '@nestjs/common';

export function getValidationPipeConfig(): ValidationPipeOptions {
  return {
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      console.log(JSON.stringify(errors, null, 2));
      return new BadRequestException(errors);
    },
  };
}
