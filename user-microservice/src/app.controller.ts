import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './modules/core/prisma/prisma.service';
import { RedisService } from './modules/core/redis/redis.service';
import { RabbitService } from './modules/core/amqp/amqp.service';
import { DependencyUnavailableError } from './common/errors/infrastructure/errors/dependencyUnavailable.error';

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly rabbit: RabbitService,
  ) {}

  @Get('health')
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const pong = await this.redis.ping();
      if (pong !== 'PONG') {
        throw new DependencyUnavailableError('redis', {
          operation: 'ping',
          response: pong,
        });
      }
      const amqp = await this.rabbit.isConnected();
      return { status: 'ok', redis: pong, rabbit: amqp };
    } catch (e) {
      throw new DependencyUnavailableError(
        'healthcheck dependency',
        { reason: (e as Error).message },
        e,
      );
    }
  }
}
