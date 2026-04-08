import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DependencyUnavailableError } from 'src/common/errors';

@Injectable()
export class RabbitService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitService.name);

  private ready = false;

  constructor(private readonly amqpConnect: AmqpConnection) {}

  get amqp() {
    return this.amqpConnect;
  }
  async onModuleInit() {
    try {
      await this.waitForReady(15000);
      this.ready = true;
    } catch (err) {
      this.ready = false;

      throw new DependencyUnavailableError('amqp', { operation: 'init' }, err);
    }
  }

  async onModuleDestroy() {
    try {
      await this.amqpConnect.close();
      this.ready = false;
    } catch (err) {
      this.logger.error(
        new DependencyUnavailableError('amqp', { operation: 'close' }, err),
      );
    }
  }

  isConnected() {
    return this.ready;
  }

  private async waitForReady(timeoutMs: number): Promise<void> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      if (this.amqpConnect.managedConnection?.isConnected()) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error('AMQP readiness timeout');
  }
}
