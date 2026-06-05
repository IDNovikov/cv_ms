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
    queueOptions: SendMailContract.queue.queueOptions,
    errorBehavior: MessageHandlerErrorBehavior.REQUEUE,
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
    const sentMail = await this.mailService.sendMail(payload);
    this.logger.log(`Mail sent: ${sentMail.messageId}`);
    if (!sentMail.messageId) throw new Error('Message not sent');
  }
}
