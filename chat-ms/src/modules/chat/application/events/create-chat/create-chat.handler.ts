import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RabbitServicePort, AuthGrpcPort } from 'src/modules/chat/providers';

import { ChatCreatedDomainEvent } from 'src/modules/chat/domain/chat/events/chat-created.event';

@EventsHandler(ChatCreatedDomainEvent)
export class UserCreatedSendMailHandler implements IEventHandler<ChatCreatedDomainEvent> {
  constructor(
    private readonly amqp: RabbitServicePort,
    private readonly auth: AuthGrpcPort,
  ) {}

  async handle(event: ChatCreatedDomainEvent) {
    const existedUsers = await Promise.all(
      event.invitedById.map((userId) => this.auth.getAuthById({ userId })),
    );

    for (let existUser of existedUsers) {
      await this.amqp.AmqpSendMail({
        subject: existUser.email,
        text: `Новый диалог с профилем id ${event.createdById}`,
        toEmail: existUser.email,
      });
    }
  }
}
