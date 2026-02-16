export abstract class RabbitConsumer {
  abstract AmqpSendMail(payload): Promise<void>;
}
