export abstract class RabbitServicePort {
  abstract AmqpSendMail(payload): Promise<void>;
}

