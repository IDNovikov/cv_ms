import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import {
  getCorsConfig,
  getGrpcConfig,
  getSwaggerConfig,
  getValidationPipeConfig,
} from './common/config';
import { LoggingInterceptors } from './common/interceptors/loggining.intrceptor';
import { MicroserviceOptions } from '@nestjs/microservices';
import { GlobalExceptionFilter } from './common/filters/globalException.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger();

  //PIPES
  app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()));
  //Interceptors
  app.useGlobalInterceptors(new LoggingInterceptors());
  //Filters
  app.useGlobalFilters(new GlobalExceptionFilter());
  //CORS
  app.enableCors(getCorsConfig(config));

  //SWAGGER
  SwaggerModule.setup('/docs', app, getSwaggerConfig(app, config), {
    yamlDocumentUrl: '/openapi.yaml',
    jsonDocumentUrl: 'jsonapi.json',
  });
  //MS
  app.connectMicroservice<MicroserviceOptions>(getGrpcConfig(config), {
    inheritAppConfig: true,
  });
  await app.startAllMicroservices();
  //HTTP
  const port = config.getOrThrow<number>('PORT');
  const host = config.getOrThrow<string>('HOST');
  app.setGlobalPrefix('auth');
  await app.listen(port);
  logger.log(`🚀 Service started: ${host}:${port}`);
  logger.log(`📜 Swagger: ${host}:${port}/docs`);
}
bootstrap();
