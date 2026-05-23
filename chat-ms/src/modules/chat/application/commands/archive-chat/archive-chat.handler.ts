import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { ArchiveChatCommand } from './archive-chat.command';

@CommandHandler(ArchiveChatCommand)
export class ArchiveChatHandler implements ICommandHandler<
  ArchiveChatCommand,
  void
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: ArchiveChatCommand): Promise<void> {
    const member = await this.support.requireActiveMember(
      dto.chatId,
      dto.actorUserId,
    );

    member.archive({ id: member.id, userId: dto.actorUserId });
    await this.db.saveMember(member);
    await this.support.invalidateUserChats(dto.actorUserId);
  }
}
