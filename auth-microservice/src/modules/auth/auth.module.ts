import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../core/redis/redis.module';
import { AuthController } from './auth/auth.controller';
import { AdminController } from './admin/admin.controller';
import { PasswordController } from './password/password.controller';
import { RegistrationController } from './registration/registration.controller';
import { SessionsController } from './session/session.controller';
import { AuthService } from './auth/auth.service';
import { PasswordService } from './password/password.service';
import { RegistrationService } from './registration/registration.service';
import { SessionsService } from './session/session.service';
import { AuthFacade } from './auth/auth.facade';
import { RegistrationFacade } from './registration/registration.facade';
import { AdminFacade } from './admin/admin.facade';
import { PasswordFacade } from './password/password.facade';
import { SessionFacade } from './session/session.facade';
import { AmqpModule } from '../core/amqp/amqp.module';
import { AuthGrpcController } from './api/gRPC/auth.grpc.controller';
import { AuthDBPort } from './providers/prisma/prisma.port';
import { ActorDBAdapter } from './providers/prisma/prisma.adapter';
import { HashPort } from './providers/hash/hash.port';
import { HashAdapter } from './providers/hash/hash.adapter';
import { RedisServicePort } from './providers/redis/redis.port';
import { RedisServiceAdapter } from './providers/redis/redis.adapter';
import { RabbitServicePort } from './providers/amqp/amqp.port';
import { RabbitServiceAdapter } from './providers/amqp/amqp.adapter';
import { UserRpcPort } from './providers/user-rpc/user-rpc.port';
import { UserRpcAdapter } from './providers/user-rpc/user-rpc.adapter';
import { ClientsModule } from '@nestjs/microservices';
import { UserGrpcClient } from 'src/common/config/userGrpc.config';
@Module({
  imports: [
    ClientsModule.registerAsync([UserGrpcClient]),
    ConfigModule,
    RedisModule,
    AmqpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [
    AuthController,
    AdminController,
    PasswordController,
    RegistrationController,
    SessionsController,
    AuthGrpcController,
  ],
  providers: [
    { provide: AuthDBPort, useClass: ActorDBAdapter },
    {
      provide: HashPort,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new HashAdapter({
          rounds: Number(config.get('BCRYPT_SALT_ROUNDS', 10)),
          pepper: config.get<string>('PASSWORD_PEPPER', ''),
        }),
    },
    { provide: RedisServicePort, useClass: RedisServiceAdapter },
    { provide: RabbitServicePort, useClass: RabbitServiceAdapter },
    { provide: UserRpcPort, useClass: UserRpcAdapter },
    AuthService,
    PasswordService,
    RegistrationService,
    SessionsService,
    JwtModule,
    AuthFacade,
    AdminFacade,
    RegistrationFacade,
    PasswordFacade,
    SessionFacade,
  ],
})
export class AuthModule {}
