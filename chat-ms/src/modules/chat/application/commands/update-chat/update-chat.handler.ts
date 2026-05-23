import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { ChatDetailsView } from '../../chat.new.facade';
import { UpdateChatCommand } from './update-chat.command';

@CommandHandler(UpdateChatCommand)
export class UpdateChatHandler implements ICommandHandler<
  UpdateChatCommand,
  ChatDetailsView
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: UpdateChatCommand): Promise<ChatDetailsView> {
    const chat = await this.support.getChatById(dto.chatId);
    await this.support.requirePrivilegedMember(dto.chatId, dto.actorUserId);

    chat.updateProfile({
      id: dto.chatId,
      title: dto.title,
      avatarUrl: dto.avatarUrl,
    });

    const saved = await this.db.saveChat(chat);
    await this.support.invalidateChat(saved.id);
    await this.support.invalidateChatMembersLists(saved.id);
    await this.support.cacheChat(saved);

    return this.support.buildChatDetails(saved, dto.actorUserId);
  }
}
