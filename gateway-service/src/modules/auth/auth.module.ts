import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TEST_SERVICE_NAME, protobufPackage } from '@noildm/contracts/dist/gen/test';
import { ConfigService } from '@nestjs/config';
import { AuthClientGRPC } from './auth.grpc';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: TEST_SERVICE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: protobufPackage,
            protoPath: 'node_modules/@noildm/contracts/proto/test.proto',
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
  controllers: [AuthController],
  providers: [AuthClientGRPC],
})
export class AuthModule {}
