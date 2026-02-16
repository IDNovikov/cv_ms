import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import {
  MessageHandlerErrorBehavior,
  RabbitRPC,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { SendMailContract } from '../amqp/contracts/queues/mail/send-mail.contract';

@Injectable()
export class ConsumerService {
  private readonly logger = new Logger(ConsumerService.name);
  constructor(private readonly mailService: MailService) {}

  @RabbitSubscribe({
    exchange: SendMailContract.queue.exchange.name,
    routingKey: SendMailContract.queue.routingKey,
    queue: SendMailContract.queue.queue,
    errorBehavior: MessageHandlerErrorBehavior.NACK,
    errorHandler: (channel, msg, err) => {
      console.error('RPC error:', err);
      channel.nack(msg, false, false);
    },
  })
  private async sendVerifyMail(
    request: SendMailContract.request,
  ): Promise<void> {
    this.logger.log(request);
    const { payload } = request;
    try {
      const sendedMail = await this.mailService.sendMail(payload);
      this.logger.log(sendedMail);
      if (!sendedMail.messageId) throw new Error('Message not sended');
    } catch (err) {
      this.logger.error(err);
    }
  }
}
