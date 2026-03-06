export abstract class RabbitServicePort {
  abstract AmqpSendMail(payload: unknown): Promise<void>;
}

