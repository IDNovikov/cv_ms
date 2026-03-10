import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { protobufPackage } from '@noildm/contracts/dist/gen/user';

export function getGrpcConfig(): MicroserviceOptions {
  return {
    transport: Transport.GRPC,
    options: {
      package: protobufPackage,
      protoPath: 'node_modules/@noildm/contracts/proto/user.proto',
      url: 'localhost:50053',
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
