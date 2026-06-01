import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class deleteUnverifiedAuth {
  private readonly logger = new Logger(deleteUnverifiedAuth.name);

  constructor(private readonly auth: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeUnverifiedUsers() {
    const deletedCount = await this.auth.auth.deleteMany({
      where: { isEmailVerified: false },
    });
    if (deletedCount.count > 0) {
      this.logger.log(`Deleted ${deletedCount.count} unverified users`);
    } else {
      this.logger.log(`No deleted`);
    }
  }
}
