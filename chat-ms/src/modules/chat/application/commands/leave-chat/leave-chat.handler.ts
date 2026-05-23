import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { LeaveChatCommand } from './leave-chat.command';

@CommandHandler(LeaveChatCommand)
export class LeaveChatHandler implements ICommandHandler<
  LeaveChatCommand,
  void
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: LeaveChatCommand): Promise<void> {
    const member = await this.support.requireActiveMember(
      dto.chatId,
      dto.actorUserId,
    );

    member.leave({ id: member.id, userId: dto.actorUserId });
    await this.db.saveMember(member);
    await this.support.invalidateUserChats(dto.actorUserId);
    await this.support.invalidateChatMembersLists(dto.chatId);
  }
}
