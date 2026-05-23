import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundAppError } from 'src/common/errors';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { RemoveMemberCommand } from './remove-member.command';

@CommandHandler(RemoveMemberCommand)
export class RemoveMemberHandler implements ICommandHandler<
  RemoveMemberCommand,
  void
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: RemoveMemberCommand): Promise<void> {
    await this.support.requirePrivilegedMember(dto.chatId, dto.actorUserId);

    const deleted = await this.db.deleteMember(dto.chatId, dto.userId);
    if (!deleted) {
      throw new NotFoundAppError('ChatMember', {
        chatId: dto.chatId,
        userId: dto.userId,
      });
    }

    await this.support.invalidateUserChats(dto.userId);
    await this.support.invalidateChatMembersLists(dto.chatId);
  }
}
