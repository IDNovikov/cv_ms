import { Module } from '@nestjs/common';
import { UserCreatedSendMailHandler } from './application/events/actor-created-send-mail.handler';
import { CommandBus, CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { MSController } from './api/http/actor.controller';
import { PrismaService } from '../core/prisma/prisma.service';
import { RedisService } from '../core/redis/redis.service';
import { UserDBAdapter } from './providers/prisma/prisma.adapter';
import { UserFacade } from './application';
import { UserFacadeFactory } from './providers/user-facade.factory';
import { PrismaModule } from '../core/prisma/prisma.module';
import { RedisModule } from '../core/redis/redis.module';
import { AmqpModule } from '../core/amqp/amqp.module';
import { UserDBPort, RabbitServicePort } from './providers';
import { RabbitServiceAdapter } from './providers/amqp/amqp.adapter';
import { RabbitService } from '../core/amqp/amqp.service';
import { UserGrpcController } from './api/gRPC/user.grpc.controller';

const EventHandlers = [UserCreatedSendMailHandler];

@Module({
  imports: [CqrsModule, PrismaModule, RedisModule, AmqpModule],
  controllers: [MSController, UserGrpcController],
  providers: [
    RabbitService,
    PrismaService,
    RedisService,
    {
      provide: UserFacade,
      inject: [CommandBus, QueryBus, EventBus],
      useFactory: UserFacadeFactory,
    },
    CreateUserHandler,
    { provide: RabbitServicePort, useClass: RabbitServiceAdapter },
    { provide: UserDBPort, useClass: UserDBAdapter },
    ...EventHandlers,
  ],
})
export class UserModule {}
