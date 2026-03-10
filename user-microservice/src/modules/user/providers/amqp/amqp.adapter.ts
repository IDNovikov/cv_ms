import { Injectable } from '@nestjs/common';
import { RabbitServicePort } from './amqp.port';
import { RabbitService } from 'src/modules/core/amqp/amqp.service';
import { DependencyUnavailableError } from 'src/common/errors';

@Injectable()
export class RabbitServiceAdapter extends RabbitServicePort {
  constructor(private readonly amqp: RabbitService) {
    super();
  }

  async AmqpSendMail(payload: unknown): Promise<void> {
    try {
      await this.amqp.amqp.publish('mail', 'mail-send', payload);
    } catch (error) {
      throw new DependencyUnavailableError(
        'amqp',
        { operation: 'publish', exchange: 'mail', routingKey: 'mail-send' },
        error,
      );
    }
  }
}

