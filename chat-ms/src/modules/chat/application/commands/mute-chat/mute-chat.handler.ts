import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { MuteChatCommand } from './mute-chat.command';

@CommandHandler(MuteChatCommand)
export class MuteChatHandler implements ICommandHandler<MuteChatCommand, void> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: MuteChatCommand): Promise<void> {
    const member = await this.support.requireActiveMember(
      dto.chatId,
      dto.actorUserId,
    );

    member.mute({
      id: member.id,
      userId: dto.actorUserId,
      mutedUntil: this.support.toDate(dto.mutedUntil),
    });

    await this.db.saveMember(member);
    await this.support.invalidateUserChats(dto.actorUserId);
  }
}
