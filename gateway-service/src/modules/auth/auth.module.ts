import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME, protobufPackage } from '@noildm/contracts/dist/gen/auth';
import { ConfigService } from '@nestjs/config';
import { RegistrationController } from './controllers/registration.controller';
import { SessionsController } from './controllers/session.controller';
import { PasswordController } from './controllers/password.controller';
import { AdminController } from './controllers/admin.controller';

import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RefreshJwtAuthGuard } from '../../shared/guards/refresh-jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { FacadePort } from './providers/facade/facade.port';
import { FacadeAdapter } from './providers/facade/facade.adapter';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: protobufPackage,
            protoPath: 'node_modules/@noildm/contracts/proto/auth.proto',
            url: 'localhost:50052',
            loader: {
              keepCase: false,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    AuthController,
    RegistrationController,
    SessionsController,
    PasswordController,
    AdminController,
  ],
  providers: [
    { provide: FacadePort, useClass: FacadeAdapter },
    JwtAuthGuard,
    RefreshJwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
