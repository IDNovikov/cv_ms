import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { getCorsConfig, getSwaggerConfig, getValidationPipeConfig } from './core/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = app.get(ConfigService);
  const logger = new Logger();

  app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()));
  app.enableCors(getCorsConfig(config));
  app.use(cookieParser());

  SwaggerModule.setup('/api/docs', app, getSwaggerConfig(app, config), {
    yamlDocumentUrl: '/openapi.yaml',
    jsonDocumentUrl: 'jsonapi.json',
  });

  const port = config.getOrThrow<number>('PORT');
  const host = config.getOrThrow<string>('HOST');

  await app.listen(port);

  logger.log(`Gateway started: ${host}`);
  logger.log(`Server is running on http://localhost:${port}/`);
  logger.log(`REST:    http://localhost:${port}/api`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
  logger.log(`GraphQL: http://localhost:${port}/graphql`);
  logger.log(`Sandbox: https://studio.apollographql.com/sandbox/explorer`);
}

bootstrap();
