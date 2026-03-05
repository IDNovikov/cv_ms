import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RedisService,
      useFactory: (config: ConfigService) =>
        new RedisService({
          host: config.getOrThrow('REDIS_HOST', '127.0.0.1'),
          port: Number(config.getOrThrow('REDIS_PORT', 6379)),
          password: config.getOrThrow('REDIS_PASSWORD', undefined),
          db: Number(config.getOrThrow('REDIS_DB', 0)),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
