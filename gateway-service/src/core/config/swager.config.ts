import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function getSwaggerConfig(app: INestApplication, config: ConfigService): OpenAPIObject {
  const projectName = config.get<string>('PROJECT_NAME', 'DEFAULT');
  const projectVersion = config.get<string>('PROJECT_VERSION', '1.0.0');

  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${projectName} - project API`)
    .setDescription(`API Gateway for ${projectName} microservices`)
    .setVersion(projectVersion)
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, swaggerConfig);
}
