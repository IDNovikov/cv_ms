import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import { RabbitServicePort } from '../../providers';

@EventsHandler(UserCreatedEvent)
export class UserCreatedSendMailHandler implements IEventHandler<UserCreatedEvent> {
  constructor(private readonly amqp: RabbitServicePort) {}

  async handle(event: UserCreatedEvent) {
    const payload = {
      type: 'USER_CREATED',
      userId: event.userId,
      userName: event.userName,
      createdAt: event.at.toISOString(),
    };

    await this.amqp.AmqpSendMail(payload);
  }
}
