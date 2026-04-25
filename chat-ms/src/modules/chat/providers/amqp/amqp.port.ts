import { SendMailRequest } from '@noildm/contracts';

export abstract class RabbitServicePort {
  abstract AmqpSendMail(payload: SendMailRequest): Promise<void>;
}
