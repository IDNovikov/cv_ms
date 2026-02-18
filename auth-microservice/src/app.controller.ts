import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './modules/core/prisma/prisma.service';
import { RedisService } from './modules/core/redis/redis.service';
import { RabbitService } from './modules/core/amqp/amqp.service';

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
      if (pong !== 'PONG') throw new Error(`Redis ping: ${pong}`);
      const amqp = await this.rabbit.isConnected();
      return { status: 'ok', redis: pong, rabbit: amqp };
    } catch (e) {
      throw new ServiceUnavailableException({
        status: 'fail',
        message: (e as Error).message,
      });
    }
  }
}
