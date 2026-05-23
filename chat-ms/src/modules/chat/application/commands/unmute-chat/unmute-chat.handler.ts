import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { UnmuteChatCommand } from './unmute-chat.command';

@CommandHandler(UnmuteChatCommand)
export class UnmuteChatHandler implements ICommandHandler<
  UnmuteChatCommand,
  void
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: UnmuteChatCommand): Promise<void> {
    const member = await this.support.requireActiveMember(
      dto.chatId,
      dto.actorUserId,
    );

    member.mute({
      id: member.id,
      userId: dto.actorUserId,
      mutedUntil: null,
    });

    await this.db.saveMember(member);
    await this.support.invalidateUserChats(dto.actorUserId);
  }
}
