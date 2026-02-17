import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class RabbitService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitService.name);

  constructor(private readonly amqpConnect: AmqpConnection) {}

  get amqp() {
    return this.amqpConnect;
  }
  async onModuleInit() {
    try {
      await this.amqp.init();
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async onModuleDestroy() {
    try {
      await this.amqpConnect.close();
    } catch (err) {
      this.logger.error(err);
    }
  }

  isConnected() {
    return this.amqpConnect.connected;
  }
}
