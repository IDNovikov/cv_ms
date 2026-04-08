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
import { FacadePort as AuthFacadePort } from './auth/providers/facade/facade.port';
import { FacadeAdapter as AuthFacadeAdapter } from './auth/providers/facade/facade.adapter';
import { JwtStrategy } from './shared/jwt.strategy';
import { RefreshJwtStrategy } from './shared/refreshJwt.stratagy';
import { AuthGrpcClient } from '@/common/config/authGrpc.config';
import { UserGrpcClient } from '@/common/config/userGrpc.config';
import { UsersController } from './user/controllers/REST/users.controller';
import { UserResolver } from './user/controllers/GQL/users.resolver';
import { FacadePort as UserFacadePort } from './user/providers/facade/facade.port';
import { FacadeAdapter as UserFacadeAdapter } from './user/providers/facade/facade.adapter';

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
    UsersController,
  ],
  providers: [
    { provide: AuthFacadePort, useClass: AuthFacadeAdapter },
    { provide: UserFacadePort, useClass: UserFacadeAdapter },
    UserResolver,
    JwtStrategy,
    RefreshJwtStrategy,
    JwtAuthGuard,
    RefreshJwtAuthGuard,
    RolesGuard,
  ],
})
export class GatewayModule {}
