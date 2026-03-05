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
    .addCookieAuth('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refresh_token',
      description: 'JWT Refresh Token stored in cookie',
    })
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token (example: Bearer eyJhbGciOi...)',
        in: 'header',
      },
      'access_token',
    )
    .build();
  return SwaggerModule.createDocument(app, swaggerConfig);
}
