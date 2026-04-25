import { Module } from '@nestjs/common';
import { PrismaModule } from '../core/prisma/prisma.module';
import { RedisModule } from '../core/redis/redis.module';
import { AmqpModule } from '../core/amqp/amqp.module';
import { ChatGrpcController } from './api/gRPC/chat.grpc.controller';
import { ChatFacade } from './application';
import { ChatDBAdapter } from './providers/prisma/prisma.adapter';
import { ChatDBPort, RabbitServicePort, RedisServicePort } from './providers';
import { RabbitServiceAdapter } from './providers/amqp/amqp.adapter';
import { RedisServiceAdapter } from './providers/redis/redis.adapter';

@Module({
  imports: [PrismaModule, RedisModule, AmqpModule],
  controllers: [ChatGrpcController],
  providers: [
    ChatFacade,
    { provide: ChatDBPort, useClass: ChatDBAdapter },
    { provide: RabbitServicePort, useClass: RabbitServiceAdapter },
    { provide: RedisServicePort, useClass: RedisServiceAdapter },
  ],
})
export class ChatModule {}
