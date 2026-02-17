import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export function getRedisConfig(config: ConfigService): RedisOptions {
  const options: RedisOptions = {
    host: config.get('REDIS_HOST', '127.0.0.1'),
    port: Number(config.get('REDIS_PORT', 6379)),
    password: config.get('REDIS_PASSWORD', undefined),
    db: Number(config.get('REDIS_DB', 0)),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 5000,
    lazyConnect: true,
  };
  return Object.freeze(options);
}
