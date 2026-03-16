import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import {
  MessageHandlerErrorBehavior,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { SendMailContract } from '@noildm/contracts';

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
    const trueRequest =
      typeof request === 'string'
        ? JSON.parse(request)
        : Buffer.isBuffer(request)
          ? JSON.parse(request.toString('utf8'))
          : request;

    const payload = trueRequest.payload ?? trueRequest;
    try {
      const sendedMail = await this.mailService.sendMail(payload);
      this.logger.log(sendedMail);
      if (!sendedMail.messageId) throw new Error('Message not sended');
    } catch (err) {
      this.logger.error(err);
    }
  }
}
