import { Module } from '@nestjs/common';
import { UserCreatedSendMailHandler } from './application/events/actor-created-send-mail.handler';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { UpdateUserHandler } from './application/commands/update-author-actor/update-author-actor.handler';
import { DeleteUserHandler } from './application/commands/delete-user/delete-user.handler';
import { UserDBAdapter } from './providers/prisma/prisma.adapter';
import { UserFacade } from './application';
import { UserFacadeFactory } from './providers/user-facade.factory';
import { PrismaModule } from '../core/prisma/prisma.module';
import { RedisModule } from '../core/redis/redis.module';
import { AmqpModule } from '../core/amqp/amqp.module';
import { UserDBPort, RabbitServicePort, RedisServicePort } from './providers';
import { RabbitServiceAdapter } from './providers/amqp/amqp.adapter';
import { RedisServiceAdapter } from './providers/redis/redis.adapter';
import { UserGrpcController } from './api/gRPC/user.grpc.controller';
import { GetUserQueryHandler } from './application/queries/get-actor/get-actor-query.handler';
import { GetUsersQueryHandler } from './application/queries/get-all-actors/get-actors-query.handler';
import { GetUserByUserNameHandler } from './application/queries/get-user-by-username/get-user-by-username.handler';

const EventHandlers = [UserCreatedSendMailHandler];
const CommandHandlers = [CreateUserHandler, UpdateUserHandler, DeleteUserHandler];
const QueryHandlers = [
  GetUserQueryHandler,
  GetUsersQueryHandler,
  GetUserByUserNameHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule, RedisModule, AmqpModule],
  controllers: [UserGrpcController],
  providers: [
    {
      provide: UserFacade,
      inject: [CommandBus, QueryBus],
      useFactory: UserFacadeFactory,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: RabbitServicePort, useClass: RabbitServiceAdapter },
    { provide: RedisServicePort, useClass: RedisServiceAdapter },
    { provide: UserDBPort, useClass: UserDBAdapter },
    ...EventHandlers,
  ],
})
export class UserModule {}
