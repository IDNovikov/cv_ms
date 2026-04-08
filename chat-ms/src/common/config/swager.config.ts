import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function getSwaggerConfig(
  app: INestApplication,
  config: ConfigService,
): OpenAPIObject {
  const SERVICE_NAME = config.get<string>('SERVICE_NAME', 'DEFAULT');
  const projectVersion = config.get<string>('PROJECT_VERSION', '1.0.0');

  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${SERVICE_NAME} - project API`)
    .setDescription(`API Gateway for ${SERVICE_NAME} microservices`)
    .setVersion(projectVersion)
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, swaggerConfig);
}
