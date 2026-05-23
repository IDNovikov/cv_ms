import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundAppError } from 'src/common/errors';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { MarkAsReadCommand } from './mark-as-read.command';

@CommandHandler(MarkAsReadCommand)
export class MarkAsReadHandler implements ICommandHandler<
  MarkAsReadCommand,
  void
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: MarkAsReadCommand): Promise<void> {
    const member = await this.support.requireActiveMember(
      dto.chatId,
      dto.actorUserId,
    );
    const message = await this.db.findMessageById(dto.lastReadMessageId);
    if (!message || message.chatId !== dto.chatId) {
      throw new NotFoundAppError('Message', {
        messageId: dto.lastReadMessageId,
        chatId: dto.chatId,
      });
    }

    member.markRead({
      id: member.id,
      userId: dto.actorUserId,
      lastReadMessageId: dto.lastReadMessageId,
    });

    await this.db.saveMember(member);
    await this.support.invalidateUserChats(dto.actorUserId);
  }
}
