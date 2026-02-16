import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'prisma/generated/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });

    super({
      adapter,
      log: ['warn', 'error'],
    });
  }

  // async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
  //   return this.$transaction((tx) => fn(tx));
  // }
}
