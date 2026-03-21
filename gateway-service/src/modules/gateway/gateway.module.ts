import { Module } from '@nestjs/common';
import { AuthController } from './auth/controllers/REST/auth.controller';
import { ClientsModule } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { RegistrationController } from './auth/controllers/REST/registration.controller';
import { SessionsController } from './auth/controllers/REST/session.controller';
import { PasswordController } from './auth/controllers/REST/password.controller';
import { AdminController } from './auth/controllers/REST/admin.controller';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RefreshJwtAuthGuard } from '../../shared/guards/refresh-jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { FacadePort } from './auth/providers/facade/facade.port';
import { FacadeAdapter } from './auth/providers/facade/facade.adapter';
import { JwtStrategy } from './shared/jwt.strategy';
import { RefreshJwtStrategy } from './shared/refreshJwt.stratagy';
import { AuthGrpcClient } from '@/common/config/authGrpc.config';
import { UserGrpcClient } from '@/common/config/userGrpc.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ClientsModule.registerAsync([AuthGrpcClient, UserGrpcClient]),
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
    JwtStrategy,
    RefreshJwtStrategy,
    JwtAuthGuard,
    RefreshJwtAuthGuard,
    RolesGuard,
  ],
})
export class GatewayModule {}
