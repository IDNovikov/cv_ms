import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundAppError } from 'src/common/errors';
import { MessageAggregate } from 'src/modules/chat/domain';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { UpdateMessageCommand } from './update-message.command';

@CommandHandler(UpdateMessageCommand)
export class UpdateMessageHandler implements ICommandHandler<
  UpdateMessageCommand,
  MessageAggregate
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: UpdateMessageCommand): Promise<MessageAggregate> {
    const message = await this.db.findMessageById(dto.messageId);
    if (!message) {
      throw new NotFoundAppError('Message', { messageId: dto.messageId });
    }

    message.editMessage({
      id: dto.messageId,
      authorId: dto.authorId,
      text: dto.text,
    });

    const saved = await this.db.saveMessage(message);
    await this.support.invalidateMessagesList(saved.chatId);
    return saved;
  }
}
