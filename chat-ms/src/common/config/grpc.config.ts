import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { protobufPackage } from '@noildm/contracts/dist/gen/chat';

export function getGrpcConfig(config: ConfigService): MicroserviceOptions {
  return {
    transport: Transport.GRPC,
    options: {
      package: protobufPackage,
      protoPath: 'node_modules/@noildm/contracts/proto/chat.proto',
      url: config.getOrThrow('GRPC_URL'),
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: false,
        oneofs: true,
      },
    },
  };
}
