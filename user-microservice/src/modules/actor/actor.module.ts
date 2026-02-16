import { Module } from '@nestjs/common';
import { ActorCreatedSendMailHandler } from './application/events/actor-created-send-mail.handler';
import { CommandBus, CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateActorHandler } from './application/commands/create-actor/create-actor.handler';
import { MSController } from './api/http/actor.controller';
import { ActorDBPort, RabbitConsumer } from './providers';
import { PrismaService } from '../core/prisma/prisma.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RedisService } from '../core/redis/redis.service';
import { ActorDBAdapter } from './providers/prisma/prisma.adapter';
import { ActorFacade } from './application';
import { actorFacadeFactory } from './providers/actor-facade.factory';
import { PrismaModule } from '../core/prisma/prisma.module';
import { RedisModule } from '../core/redis/redis.module';
import { AmqpModule } from '../core/amqp/amqp.module';
import { RabbitPublisher } from './providers/amqp/amqp.adapter';

const EventHandlers = [ActorCreatedSendMailHandler /*, ... */];

@Module({
  imports: [CqrsModule, PrismaModule, RedisModule, AmqpModule],
  controllers: [MSController],
  providers: [
    //AmqpConnection,
    PrismaService,
    RedisService,
    {
      provide: ActorFacade,
      inject: [CommandBus, QueryBus, EventBus],
      useFactory: actorFacadeFactory,
    },
    CreateActorHandler,
    { provide: RabbitConsumer, useClass: RabbitPublisher },
    { provide: ActorDBPort, useClass: ActorDBAdapter },
    ...EventHandlers,
  ],
})
export class ActorModule {}
