import { CreateMessageDTO } from 'src/modules/mail/domain/dto/CreateMessageDTO';
import { EXCHANGE_MAIL } from '../../exchanges/mail.exchange';
import { AmqpBaseRequest } from '../../shared/amqp-base-request.interface';
import { QueueDeclaration } from '../../shared/queue-declaration.interface';
import { AmqpBaseResponse } from '../../shared/amqp-base-response.interface';
import { SendMailRequest } from './interfaces';

export namespace SendMailContract {
  export const queue: QueueDeclaration = {
    exchange: EXCHANGE_MAIL,
    queue: `${EXCHANGE_MAIL.name}-send`,
    routingKey: `${EXCHANGE_MAIL.name}-send`,
    queueOptions: { durable: true },
  };
export type request= AmqpBaseRequest<CreateMessageDTO>

export type response = AmqpBaseResponse<SendMailRequest>
}
