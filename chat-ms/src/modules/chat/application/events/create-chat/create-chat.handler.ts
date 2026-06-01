import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RabbitServicePort, UserGrpcPort } from 'src/modules/chat/providers';

import { ChatCreatedDomainEvent } from 'src/modules/chat/domain/chat/events/chat-created.event';

@EventsHandler(ChatCreatedDomainEvent)
export class UserCreatedSendMailHandler implements IEventHandler<ChatCreatedDomainEvent> {
  constructor(
    private readonly amqp: RabbitServicePort,
    private readonly user: UserGrpcPort,
  ) {}

  async handle(event: ChatCreatedDomainEvent) {
    const existedUsers = await Promise.all(
      event.invitedById.map((id) => this.user.getUserById({ id })),
    );

    // for (let existUser of existedUsers) {
    //     await this.amqp.AmqpSendMail({subject:existUser.user.})
    // }
  }
}
