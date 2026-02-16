import { NestFactory } from '@nestjs/core';
import { AppModule } from './core/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { getCorsConfig, getSwaggerConfig, getValidationPipeConfig } from './core/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const logger = new Logger();
  //PIPES
  app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()));

  //CORS
  app.enableCors(getCorsConfig(config));

  //SWAGGER
  SwaggerModule.setup('/docs', app, getSwaggerConfig(app, config), {
    yamlDocumentUrl: '/openapi.yaml',
    jsonDocumentUrl: 'jsonapi.json',
  });

  //APP
  const port = config.getOrThrow<number>('PORT');
  const host = config.getOrThrow<string>('HOST');

  await app.listen(port);

  logger.log(`🚀 Gateway started: ${host}`);
  logger.log(`📜 Swagger: ${host}/docs`);
}
bootstrap();
