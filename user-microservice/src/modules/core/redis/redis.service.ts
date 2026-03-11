import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { getRedisConfig } from './redis.config';
import { DependencyUnavailableError, ServerError } from 'src/common/errors';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: IORedis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.client = new IORedis(getRedisConfig(this.config));
    this.client.on('error', (e) => this.logger.error(e));
    this.client.on('connect', () => this.logger.log('Redis connected'));

    try {
      await this.client.connect();
    } catch (error) {
      throw new ServerError('Failed to connect Redis', {}, error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client?.quit();
    } catch (error) {
      this.logger.error(new DependencyUnavailableError('redis', {}, error));
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
      throw new DependencyUnavailableError(
        'redis',
        { operation: 'ping' },
        error,
      );
    }
  }
}
