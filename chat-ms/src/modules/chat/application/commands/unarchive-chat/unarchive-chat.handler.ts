import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { UnarchiveChatCommand } from './unarchive-chat.command';

@CommandHandler(UnarchiveChatCommand)
export class UnarchiveChatHandler implements ICommandHandler<
  UnarchiveChatCommand,
  void
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: UnarchiveChatCommand): Promise<void> {
    const member = await this.support.requireActiveMember(
      dto.chatId,
      dto.actorUserId,
    );

    member.unarchive({ id: member.id, userId: dto.actorUserId });
    await this.db.saveMember(member);
    await this.support.invalidateUserChats(dto.actorUserId);
  }
}
