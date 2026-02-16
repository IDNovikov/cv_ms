import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { RedisModule } from './modules/core/redis/redis.module';
import { PrismaModule } from './modules/core/prisma/prisma.module';
import { AmqpModule } from './modules/core/amqp/amqp.module';
import { ActorModule } from './modules/actor/actor.module';

@Module({
  imports: [
    RedisModule,
    AmqpModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ActorModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
