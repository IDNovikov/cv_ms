import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatDBPort } from 'src/modules/chat/providers';
import { MessageAggregate } from 'src/modules/chat/domain';
import { ChatApplicationSupport } from '../../chat.application-support';
import { SendMessageCommand } from './send-message.command';

@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<
  SendMessageCommand,
  MessageAggregate
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: SendMessageCommand): Promise<MessageAggregate> {
    const chat = await this.support.getChatById(dto.chatId);
    await this.support.requireActiveMember(dto.chatId, dto.authorId);

    const message = MessageAggregate.create({
      requestId: dto.requestId,
      chatId: dto.chatId,
      authorId: dto.authorId,
      kind: this.support.toDomainMessageKind(dto.kind),
      text: dto.text,
      replyToId: dto.replyToId ?? null,
    });

    const savedMessage = await this.db.saveMessage(message);
    chat.touchLastMessage({
      messageId: savedMessage.id,
      messageCreatedAt: savedMessage.createdAt,
    });

    await this.db.saveChat(chat);
    await this.support.invalidateChat(chat.id);
    await this.support.invalidateMessagesList(chat.id);
    await this.support.invalidateChatMembersLists(chat.id);

    return savedMessage;
  }
}
