import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../../domain/chat/events/user-created.event';
import { RabbitServicePort } from '../../providers';

@EventsHandler(UserCreatedEvent)
export class UserCreatedSendMailHandler implements IEventHandler<UserCreatedEvent> {
  constructor(private readonly amqp: RabbitServicePort) {}

  async handle(event: UserCreatedEvent) {
    const payload = {
      toEmail: event.email,
      subject: event.userId,
      text: `Hi ${event.userName} your account is created`,
    };

    await this.amqp.AmqpSendMail(payload);
  }
}
