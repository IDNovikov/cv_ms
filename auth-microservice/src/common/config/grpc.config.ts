import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { protobufPackage } from '@noildm/contracts/dist/gen/auth';

export function getGrpcConfig(): MicroserviceOptions {
  return {
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
  };
}
