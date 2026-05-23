import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { LoggingInterceptors } from './common/interceptors/loggining.intrceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpErrorFilter } from './common/filters/http-exception.filter';
import { getCorsConfig, getSwaggerConfig, getValidationPipeConfig } from './common/config';
import { RedisIoAdapter } from './modules/core/redis/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = app.get(ConfigService);
  const logger = new Logger();
  app.useGlobalFilters(new HttpErrorFilter());
  app.useGlobalInterceptors(new LoggingInterceptors(), new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()));
  app.enableCors(getCorsConfig(config));
  app.use(cookieParser());

  SwaggerModule.setup('/api/docs', app, getSwaggerConfig(app, config), {
    yamlDocumentUrl: '/openapi.yaml',
    jsonDocumentUrl: 'jsonapi.json',
  });

  const redisIoAdapter = new RedisIoAdapter(config);

  app.useWebSocketAdapter(redisIoAdapter);

  process.on('SIGINT', async () => {
    await redisIoAdapter.closeRedisConnections();
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await redisIoAdapter.closeRedisConnections();
    await app.close();
    process.exit(0);
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
