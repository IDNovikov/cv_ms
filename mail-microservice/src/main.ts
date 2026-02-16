import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './modules/config/env.interface';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptors } from './interceptors/loggining.intrceptor';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService<EnvConfig>);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          console.log(JSON.stringify(errors, null, 2));
          return new BadRequestException(errors);
        },
      }),
    );
    app.useGlobalInterceptors(new LoggingInterceptors());
    const port = config.get('PORT');
    await app.listen(port);
    console.log(`🚀 Server is running on http://localhost:${port}/`);
  } catch (error) {
    console.log(error);
  }
}
//
bootstrap();
