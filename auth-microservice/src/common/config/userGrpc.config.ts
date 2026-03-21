import { ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';
import {
  protobufPackage,
  USER_SERVICE_NAME,
} from '@noildm/contracts/dist/gen/user';

export const UserGrpcClient: ClientsProviderAsyncOptions = {
  name: USER_SERVICE_NAME,
  useFactory: (cfg: ConfigService) => ({
    transport: Transport.GRPC,
    options: {
      package: protobufPackage,
      protoPath: 'node_modules/@noildm/contracts/proto/user.proto',
      url: cfg.getOrThrow('USER_GRPC'),
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: false,
        oneofs: true,
      },
    },
  }),
  inject: [ConfigService],
};
