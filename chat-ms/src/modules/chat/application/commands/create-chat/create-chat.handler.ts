import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatDBPort } from 'src/modules/chat/providers';
import { ConflictAppError } from 'src/common/errors';
import { ChatAggregate, MemberAggregate } from 'src/modules/chat/domain';
import { ChatApplicationSupport } from '../../chat.application-support';
import { ChatDetailsView } from '../../chat.new.facade';
import { CreateChatCommand } from './create-chat.command';

@CommandHandler(CreateChatCommand)
export class CreateChatHandler implements ICommandHandler<
  CreateChatCommand,
  ChatDetailsView
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({ dto }: CreateChatCommand): Promise<ChatDetailsView> {
    const participantIds = this.support.normalizeUserIds([
      dto.actorUserId,
      ...dto.participantUserIds,
    ]);
    const type = this.support.toDomainChatType(dto.type);

    if (type === 'DIRECT' && participantIds.length !== 2) {
      throw new ConflictAppError('DirectChat', { participantIds });
    }

    const directKey =
      type === 'DIRECT' ? this.support.createDirectKey(participantIds) : null;

    if (directKey) {
      const existing = await this.db.findChatByDirectKey(directKey);
      if (existing)
        return this.support.buildChatDetails(existing, dto.actorUserId);
    }

    const chat = ChatAggregate.create({
      requestId: dto.requestId,
      type,
      createdById: dto.actorUserId,
      title: dto.title ?? null,
      avatarUrl: dto.avatarUrl ?? null,
      directKey,
    });

    const savedChat = await this.db.saveChat(chat);

    for (const userId of participantIds) {
      const member = MemberAggregate.create({
        requestId: dto.requestId,
        chatId: savedChat.id,
        userId,
        role: userId === dto.actorUserId ? 'OWNER' : 'MEMBER',
      });

      await this.db.saveMember(member);
      await this.support.invalidateUserChats(userId);
    }

    await this.support.cacheChat(savedChat);
    return this.support.buildChatDetails(savedChat, dto.actorUserId);
  }
}
