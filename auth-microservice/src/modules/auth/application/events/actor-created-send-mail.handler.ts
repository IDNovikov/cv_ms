import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ActorCreatedEvent } from '../../domain/auth/events/actor-created.event';
import { RabbitServicePort } from '../../providers';

@EventsHandler(ActorCreatedEvent)
export class ActorCreatedSendMailHandler implements IEventHandler<ActorCreatedEvent> {
  constructor(private readonly amqp: RabbitServicePort) {}

  async handle(event: ActorCreatedEvent) {
    const request = `{
"type": "SEND_MAIL",
"requestId": "debug-1",
"timeStamp": "2026-01-29T10:00:00.000Z",
"payload": {
"from":"gay",
"toEmail": "lmasha99@mail.ru",
"subject": "Test",
"text": "${event.actor}"
}
}`;
    console.log(`TO-RMQ ${request}`);
    await this.amqp.AmqpSendMail(request);
  }
}
