import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export function getRedisConfig(config: ConfigService): RedisOptions {
  const options: RedisOptions = {
    host: config.getOrThrow('REDIS_HOST'),
    port: Number(config.getOrThrow('REDIS_PORT')),
    password: config.getOrThrow('REDIS_PASSWORD'),
    db: Number(config.getOrThrow('REDIS_DB')),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 5000,
    lazyConnect: true,
    offlineQueue: true,
  };
  return Object.freeze(options);
}
