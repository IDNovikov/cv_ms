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

  constructor(private readonly amqpConnect: AmqpConnection) {}

  get amqp() {
    return this.amqpConnect;
  }
  async onModuleInit() {
    try {
      if (!this.amqpConnect.connected) {
        throw new DependencyUnavailableError('amqp', { operation: 'init' });
      }
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async onModuleDestroy() {
    try {
      await this.amqpConnect.close();
    } catch (err) {
      this.logger.error(
        new DependencyUnavailableError('amqp', { operation: 'close' }, err),
      );
    }
  }

  isConnected() {
    return this.amqpConnect.connected;
  }
}
