import { ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME, protobufPackage } from '@noildm/contracts/dist/gen/auth';

export const AuthGrpcClient: ClientsProviderAsyncOptions = {
  name: AUTH_SERVICE_NAME,
  useFactory: (cfg: ConfigService) => ({
    transport: Transport.GRPC,
    options: {
      package: protobufPackage,
      protoPath: 'node_modules/@noildm/contracts/proto/auth.proto',
      url: cfg.getOrThrow('AUTH_GRPC'),
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
};
