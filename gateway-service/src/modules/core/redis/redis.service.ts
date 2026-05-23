import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { getRedisConfig } from './redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: IORedis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly config: ConfigService) {}

  async get<T = unknown>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }

  async onModuleInit() {
    this.client = new IORedis(getRedisConfig(this.config));
    this.client.on('error', (e) => this.logger.error(e));
    this.client.on('connect', () => this.logger.log('Redis connected'));

    try {
      await this.client.connect();
    } catch (error) {
      throw new Error('Failed to connect Redis', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client?.quit();
    } catch (error) {
      this.logger.error('redis', {}, error);
    }
  }

  get raw() {
    return this.client;
  }

  async ping() {
    try {
      const ping = await this.client.ping();
      return ping;
    } catch (error) {
      throw new Error('redis', error);
    }
  }
}
