import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly DATABASE_URL: string;
  constructor(private readonly config: ConfigService) {
    const adapter = new PrismaPg(
      {
        connectionString: config.getOrThrow('DATABASE_URL'),
      },
      {
        schema: 'auth',
      },
    );

    super({
      adapter,
      log: ['warn', 'error'],
    });
    this.DATABASE_URL = this.config.getOrThrow('DATABASE_URL');
  }
  async onModuleInit() {
    try {
      console.log(this.DATABASE_URL);
      await this.$connect();
      this.logger.log('Db is connected');
    } catch (err) {
      this.logger.error(err);
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnect from db');
    try {
      await this.$disconnect();
      this.logger.log('Db is disconnected');
    } catch (err) {
      this.logger.error(err);
    }
  }
}
