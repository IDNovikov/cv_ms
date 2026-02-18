import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { getRedisConfig } from './redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: IORedis;
  private readonly logger = new Logger();

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.client = new IORedis(getRedisConfig(this.config));
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

  async ping() {
    const ping = await this.client.ping();
    return ping;
  }
}
