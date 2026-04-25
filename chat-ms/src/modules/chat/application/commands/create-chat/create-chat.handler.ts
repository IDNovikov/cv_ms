import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateChatCommand } from './create-chat.command';

import { ChatDBPort } from 'src/modules/chat/providers';
import { ConflictAppError } from 'src/common/errors';
import { ChatDetailsView } from '../../chat.facade';

@CommandHandler(CreateChatCommand)
export class CreateChatHandler implements ICommandHandler<
  CreateChatCommand,
  ChatDetailsView
> {
  constructor(
    private readonly chatRepository: ChatDBPort,
    private readonly publisher: EventPublisher,
  ) {}

  async execute({ dto }: CreateChatCommand): Promise<ChatDetailsView> {
    // const existingUser = await this.userRepository.findByUserName(dto.userName);
    // if (existingUser) {
    //   throw new ConflictAppError('User', { userName: dto.userName });
    // }

    // const user = this.publisher.mergeObjectContext(UserAggregate.create(dto));
    // const created = await this.userRepository.save(user);

    // user.commit();
    // return created;

    const participantIds = this.normalizeUserIds([
      dto.actorUserId,
      ...dto.participantUserIds,
    ]);

    const type = this.toDomainChatType(input.type);

    const directKey =
      type === 'DIRECT' ? this.createDirectKey(participantIds) : null;

    if (type === 'DIRECT' && participantIds.length !== 2) {
      throw new ConflictAppError('DirectChat', { participantIds });
    }

    if (directKey) {
      const existing = await this.db.findChatByDirectKey(directKey);
      if (existing) return this.buildChatDetails(existing, input.actorUserId);
    }

    const chat = ChatAggregate.create({
      requestId: input.requestId,
      type,
      createdById: input.actorUserId,
      title: input.title ?? null,
      avatarUrl: input.avatarUrl ?? null,
      directKey,
    });

    const savedChat = await this.db.saveChat(chat);

    for (const userId of participantIds) {
      const member = MemberAggregate.create({
        requestId: input.requestId,
        chatId: savedChat.id,
        userId,
        role: userId === input.actorUserId ? 'OWNER' : 'MEMBER',
      });
      await this.db.saveMember(member);
      await this.invalidateUserChats(userId);
    }

    await this.cacheChat(savedChat);
    return this.buildChatDetails(savedChat, input.actorUserId);
  }

  private normalizeUserIds(userIds: string[]): string[] {
    const normalized = [
      ...new Set(userIds.map((id) => id.trim()).filter(Boolean)),
    ];
    if (normalized.length === 0) {
      throw new ConflictAppError('ChatMembers', { reason: 'userIds required' });
    }
    return normalized;
  }
}
