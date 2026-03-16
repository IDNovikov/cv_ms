import { Injectable } from '@nestjs/common';
import { RabbitServicePort } from './amqp.port';
import { RabbitService } from 'src/modules/core/amqp/amqp.service';
import { DependencyUnavailableError } from 'src/common/errors';
import { SendMailContract, SendMailRequest } from '@noildm/contracts';
@Injectable()
export class RabbitServiceAdapter extends RabbitServicePort {
  constructor(private readonly amqp: RabbitService) {
    super();
  }

  async AmqpSendMail(payload: SendMailRequest): Promise<void> {
    console.log(payload);
    const { queue } = SendMailContract;
    try {
      await this.amqp.amqp.publish(
        queue.exchange.name,
        queue.routingKey,
        payload,
      );
    } catch (error) {
      throw new DependencyUnavailableError(
        'amqp',
        {
          operation: 'publish',
          exchange: queue.exchange.name,
          routingKey: queue.routingKey,
        },
        error,
      );
    }
  }
}
