import { Module } from '@nestjs/common';
import { ActorCreatedSendMailHandler } from './application/events/actor-created-send-mail.handler';
import { CommandBus, CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateActorHandler } from './application/commands/create-actor/create-actor.handler';
import { MSController } from './api/http/actor.controller';
import { PrismaService } from '../core/prisma/prisma.service';
import { RedisService } from '../core/redis/redis.service';
import { ActorDBAdapter } from './providers/prisma/prisma.adapter';
import { ActorFacade } from './application';
import { actorFacadeFactory } from './providers/actor-facade.factory';
import { PrismaModule } from '../core/prisma/prisma.module';
import { RedisModule } from '../core/redis/redis.module';
import { AmqpModule } from '../core/amqp/amqp.module';
import { ActorDBPort, RabbitServicePort } from './providers';
import { RabbitServiceAdapter } from './providers/amqp/amqp.adapter';
import { RabbitService } from '../core/amqp/amqp.service';

const EventHandlers = [ActorCreatedSendMailHandler];

@Module({
  imports: [CqrsModule, PrismaModule, RedisModule, AmqpModule],
  controllers: [MSController],
  providers: [
    RabbitService,
    PrismaService,
    RedisService,
    {
      provide: ActorFacade,
      inject: [CommandBus, QueryBus, EventBus],
      useFactory: actorFacadeFactory,
    },
    CreateActorHandler,
    { provide: RabbitServicePort, useClass: RabbitServiceAdapter },
    { provide: ActorDBPort, useClass: ActorDBAdapter },
    ...EventHandlers,
  ],
})
export class ActorModule {}
