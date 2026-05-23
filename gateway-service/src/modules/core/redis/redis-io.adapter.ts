import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server, ServerOptions } from 'socket.io';
import { getRedisConfig } from './redis.config';

@Injectable()
export class RedisIoAdapter extends IoAdapter implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisIoAdapter.name);

  private pubClient?: Redis;
  private subClient?: Redis;

  constructor(private readonly config: ConfigService) {
    super();
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options);

    this.pubClient = new Redis(getRedisConfig(this.config));
    this.subClient = this.pubClient.duplicate();

    this.pubClient.on('connect', () => {
      this.logger.log('Socket.IO Redis pub connected');
    });

    this.subClient.on('connect', () => {
      this.logger.log('Socket.IO Redis sub connected');
    });

    this.pubClient.on('error', (error) => {
      this.logger.error(`Socket.IO Redis pub error: ${error.message}`);
    });

    this.subClient.on('error', (error) => {
      this.logger.error(`Socket.IO Redis sub error: ${error.message}`);
    });

    server.adapter(createAdapter(this.pubClient, this.subClient));

    return server;
  }

  async onApplicationShutdown(): Promise<void> {
    await this.closeRedisConnections();
  }

  async closeRedisConnections(): Promise<void> {
    await Promise.allSettled([this.pubClient?.quit(), this.subClient?.quit()]);

    this.logger.log('Socket.IO Redis connections closed');
  }
}
