import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundAppError } from 'src/common/errors';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { DeleteMessageCommand } from './delete-message.command';

@CommandHandler(DeleteMessageCommand)
export class DeleteMessageHandler implements ICommandHandler<
  DeleteMessageCommand,
  void
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: DeleteMessageCommand): Promise<void> {
    const message = await this.db.findMessageById(dto.messageId);
    if (!message) {
      throw new NotFoundAppError('Message', {
        messageId: dto.messageId,
        authorId: dto.authorId,
      });
    }

    message.deleteMessage({
      id: dto.messageId,
      authorId: dto.authorId,
    });

    const saved = await this.db.saveMessage(message);
    await this.support.invalidateMessagesList(saved.chatId);
  }
}
