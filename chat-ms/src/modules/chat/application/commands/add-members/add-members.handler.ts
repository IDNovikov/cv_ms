import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { ChatDBPort } from 'src/modules/chat/providers';
import { MemberAggregate } from 'src/modules/chat/domain';
import { ChatApplicationSupport } from '../../chat.application-support';
import { AddMembersCommand } from './add-members.command';

@CommandHandler(AddMembersCommand)
export class AddMembersHandler implements ICommandHandler<
  AddMembersCommand,
  void
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: AddMembersCommand): Promise<void> {
    await this.support.getChatById(dto.chatId);
    await this.support.requirePrivilegedMember(dto.chatId, dto.actorUserId);

    for (const userId of this.support.normalizeUserIds(dto.userIds)) {
      const existing = await this.db.findMemberByChatAndUser(
        dto.chatId,
        userId,
      );
      if (existing && !existing.leftAt) continue;

      const member = MemberAggregate.create({
        requestId: randomUUID(),
        chatId: dto.chatId,
        userId,
      });

      await this.db.saveMember(member);
      await this.support.invalidateUserChats(userId);
    }

    await this.support.invalidateChatMembersLists(dto.chatId);
  }
}
