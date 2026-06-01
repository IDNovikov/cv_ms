import { Global, Module } from '@nestjs/common';
import { deleteUnverifiedAuth } from './cron/deleteUnverifiedAuth.cron';
import { AmqpModule } from './amqp/amqp.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [ScheduleModule.forRoot(), AmqpModule, PrismaModule, RedisModule],
  providers: [deleteUnverifiedAuth],
  exports: [],
})
export class CoreModule {}
