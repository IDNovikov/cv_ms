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
import { ServerError } from './common/errors/server/server.error';

async function bootstrap() {
  const bootstrapLogger = new Logger('Bootstrap');
  setupProcessHandlers(bootstrapLogger);

  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Main');

  app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()));
  app.useGlobalInterceptors(new LoggingInterceptors());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableCors(getCorsConfig(config));

  SwaggerModule.setup('/docs', app, getSwaggerConfig(app, config), {
    yamlDocumentUrl: '/openapi.yaml',
    jsonDocumentUrl: 'jsonapi.json',
  });

  app.connectMicroservice<MicroserviceOptions>(getGrpcConfig(config), {
    inheritAppConfig: true,
  });
  await app.startAllMicroservices();

  const port = config.getOrThrow<number>('PORT');
  const host = config.getOrThrow<string>('HOST');
  app.setGlobalPrefix('chats');

  try {
    await app.listen(port);
  } catch (error) {
    throw new ServerError('Failed to start HTTP server', { host, port }, error);
  }

  logger.log(`Service started: ${host}:${port}`);
  logger.log(`Swagger: ${host}:${port}/docs`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(error);
  process.exit(1);
});

function setupProcessHandlers(logger: Logger) {
  process.on('unhandledRejection', (reason) => {
    logger.error(
      new ServerError(
        'Unhandled promise rejection',
        { reason: String(reason) },
        reason,
      ),
    );
  });

  process.on('uncaughtException', (error) => {
    logger.error(new ServerError('Uncaught exception', {}, error), error.stack);
    process.exit(1);
  });
}
