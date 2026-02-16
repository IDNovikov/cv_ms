import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ActorCreatedEvent } from '../../domain/events/actor-created.event';
import { RabbitConsumer } from '../../providers';

@EventsHandler(ActorCreatedEvent)
export class ActorCreatedSendMailHandler implements IEventHandler<ActorCreatedEvent> {
  constructor(private readonly amqp: RabbitConsumer) {}

  request = `{
"type": "SEND_MAIL",
"requestId": "debug-1",
"timeStamp": "2026-01-29T10:00:00.000Z",
"payload": {
"from":"gay",
"toEmail": "billcozy@yandex.ru",
"subject": "Test",
"text": "Hello"
}
}`;
  async handle(event: ActorCreatedEvent) {
    const text = `This is text message to ${event.actorId}`;
    console.log(text);
    const isSended = await this.amqp.AmqpSendMail(this.request);
  }
}
