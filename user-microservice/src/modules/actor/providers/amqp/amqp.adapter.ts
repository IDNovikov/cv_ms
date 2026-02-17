import { Injectable } from '@nestjs/common';
import { RabbitServicePort } from './amqp.port';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RabbitService } from 'src/modules/core/amqp/amqp.service';

@Injectable()
export class RabbitServiceAdapter extends RabbitServicePort {
  constructor(private readonly amqp: RabbitService) {
    super();
  }

  async AmqpSendMail(payload: any): Promise<void> {
    console.log(payload);
    await this.amqp.amqp.publish('mail', 'mail.send', payload);
  }
}
