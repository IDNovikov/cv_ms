import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RedisIoAdapter } from './redis-io.adapter';

@Global()
@Module({
  providers: [RedisService, RedisIoAdapter],
  exports: [RedisService, RedisIoAdapter],
})
export class RedisModule {}
