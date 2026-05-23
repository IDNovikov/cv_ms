import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { DeleteChatCommand } from './delete-chat.command';

@CommandHandler(DeleteChatCommand)
export class DeleteChatHandler implements ICommandHandler<
  DeleteChatCommand,
  void
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: DeleteChatCommand): Promise<void> {
    const chat = await this.support.getChatById(dto.chatId);
    chat.deleteChat({ id: dto.chatId, actorId: dto.actorUserId });

    const saved = await this.db.saveChat(chat);
    await this.support.invalidateChat(saved.id);
    await this.support.invalidateChatMembersLists(saved.id);
  }
}
