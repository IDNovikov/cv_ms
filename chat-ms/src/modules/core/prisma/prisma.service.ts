import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'prisma/generated/client';
import { DependencyUnavailableError, ServerError } from 'src/common/errors';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new ServerError('DATABASE_URL is not defined');
    }

    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({
      adapter,
      log: ['warn', 'error'],
    });
  }
  async onModuleInit() {
    this.logger.log('Connection to db');
    try {
      await this.$connect();
      this.logger.log('Db is connected');
    } catch (err) {
      throw new ServerError('Failed to connect PostgreSQL', {}, err);
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnect from db');
    try {
      await this.$disconnect();
      this.logger.log('Db is disconnected');
    } catch (err) {
      this.logger.error(
        new DependencyUnavailableError(
          'postgres',
          { operation: 'disconnect' },
          err,
        ),
      );
    }
  }
}
