import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: IORedis;
  private readonly logger = new Logger();

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const options: RedisOptions = {
      host: this.config.get('REDIS_HOST', '127.0.0.1'),
      port: Number(this.config.get('REDIS_PORT', 6379)),
      password: this.config.get('REDIS_PASSWORD', undefined),
      db: Number(this.config.get('REDIS_DB', 0)),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 5000,
      lazyConnect: true,
    };
    this.client = new IORedis(options);
    await this.client.connect();
    this.client.on('error', (e) => this.logger.error(e));
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  get raw() {
    return this.client;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }

  async set(key: string, value: unknown, ttlSec = 60) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSec);
  }
  async del(key: string): Promise<any> {
    const deleted = await this.client.del(key);
    return deleted;
  }

  async getMany<T = unknown>(
    key: string,
  ): Promise<{ key: string; value: T | null }[]> {
    const pattern = `${key}:*`;
    let cursor = '0';
    const keys: string[] = [];

    do {
      const [newCursor, foundKeys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = newCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');

    if (keys.length === 0) return [];

    const values = await this.client.mget(keys);

    return keys.map((key, i) => {
      const raw = values[i];
      let parsed: T;

      parsed = raw ? JSON.parse(raw) : null;

      return { key, value: parsed as T | null };
    });
  }

  async delMany(key: string): Promise<void> {
    const pattern = `${key}:*`;
    let cursor = '0';
    do {
      const [newCursor, foundKeys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = newCursor;
      if (foundKeys.length > 0) {
        await this.client.del(...foundKeys);
      }
    } while (cursor !== '0');
  }

  async ping() {
    const ping = await this.client.ping();
    return ping;
  }
}
