import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME, protobufPackage } from '@noildm/contracts/dist/gen/auth';
import { ConfigService } from '@nestjs/config';
import { AuthClientGRPC } from './auth.grpc';

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
            url: configService.getOrThrow<string>('AUTH_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthClientGRPC],
})
export class AuthModule {}
