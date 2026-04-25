import { Injectable } from '@nestjs/common';
import { ChatType } from '@noildm/contracts/dist/gen/chat';
import { ChatAggregate, MemberAggregate, MessageAggregate } from '../domain';
import { ChatDBPort, RedisServicePort } from '../providers';
import { ConflictAppError, NotFoundAppError } from 'src/common/errors';

export type ChatDetailsView = {
  chat: ChatAggregate;
  myState: MemberAggregate;
  participants: MemberAggregate[];
  lastMessage: MessageAggregate | null;
  unreadCount: number;
};

export type ChatListItemView = {
  chat: ChatAggregate;
  myState: MemberAggregate;
  lastMessage: MessageAggregate | null;
  unreadCount: number;
};

export type CreateChatInput = {
  requestId: string;
  actorUserId: string;
  type: ChatType;
  participantUserIds: string[];
  title?: string;
  avatarUrl?: string;
};

export type GetChatInput = {
  chatId: string;
  actorUserId: string;
};

export type UpdateChatInput = {
  chatId: string;
  actorUserId: string;
  title?: string;
  avatarUrl?: string;
};

export type DeleteChatInput = {
  chatId: string;
  actorUserId: string;
};

export type ListChatsInput = {
  actorUserId: string;
  limit: number;
  cursor?: string;
  includeArchived: boolean;
};

export type GetChatMembersInput = {
  chatId: string;
  actorUserId: string;
  limit: number;
  cursor?: string;
};

export type AddMembersInput = {
  chatId: string;
  actorUserId: string;
  userIds: string[];
};

export type RemoveMemberInput = {
  chatId: string;
  actorUserId: string;
  userId: string;
};

export type LeaveChatInput = {
  chatId: string;
  actorUserId: string;
};

export type ArchiveChatInput = {
  chatId: string;
  actorUserId: string;
};

export type UnarchiveChatInput = {
  chatId: string;
  actorUserId: string;
};

export type MuteChatInput = {
  chatId: string;
  actorUserId: string;
  mutedUntil: Date;
};

export type UnmuteChatInput = {
  chatId: string;
  actorUserId: string;
};

export type SendMessageInput = {
  requestId: string;
  chatId: string;
  authorId: string;
  kind: MessageKind;
  text: string;
  replyToId?: string;
};

export type UpdateMessageInput = {
  messageId: string;
  authorId: string;
  text: string;
};

export type DeleteMessageInput = {
  messageId: string;
  authorId: string;
};

export type ListMessagesInput = {
  chatId: string;
  actorUserId: string;
  limit: number;
  cursor?: string;
};

export type MarkAsReadInput = {
  chatId: string;
  actorUserId: string;
  lastReadMessageId: string;
};

@Injectable()
export class ChatFacade {
  private readonly chatCacheTtlSec = 60;
  private readonly listCacheTtlSec = 20;

  constructor(
    private readonly db: ChatDBPort,
    private readonly redis: RedisServicePort,
  ) {}

  async createChat(input: CreateChatInput): Promise<ChatDetailsView> {
    const participantIds = this.normalizeUserIds([
      input.actorUserId,
      ...input.participantUserIds,
    ]);
    const type = input.type;

    const directKey =
      type === ChatType.DIRECT ? this.createDirectKey(participantIds) : null;

    if (type === ChatType.UNSPECIFIED || type === ChatType.UNRECOGNIZED) {
      throw new ConflictAppError('ChatType', { type });
    }

    if (type === ChatType.DIRECT && participantIds.length !== 2) {
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

  async getChat(input: GetChatInput): Promise<ChatDetailsView> {
    const chat = await this.getChatById(input.chatId);
    await this.requireActiveMember(input.chatId, input.actorUserId);
    return this.buildChatDetails(chat, input.actorUserId);
  }

  async updateChat(input: UpdateChatInput): Promise<ChatDetailsView> {
    const chat = await this.getChatById(input.chatId);
    await this.requirePrivilegedMember(input.chatId, input.actorUserId);

    chat.updateProfile({
      id: input.chatId,
      title: input.title,
      avatarUrl: input.avatarUrl,
    });

    const saved = await this.db.saveChat(chat);
    await this.invalidateChat(saved.id);
    await this.invalidateChatMembersLists(saved.id);
    await this.cacheChat(saved);
    return this.buildChatDetails(saved, input.actorUserId);
  }

  async deleteChat(input: DeleteChatInput): Promise<void> {
    const chat = await this.getChatById(input.chatId);
    chat.deleteChat({ id: input.chatId, actorId: input.actorUserId });

    const saved = await this.db.saveChat(chat);
    await this.invalidateChat(saved.id);
    await this.invalidateChatMembersLists(saved.id);
  }

  async listChats(input: ListChatsInput) {
    const cacheKey = this.chatsListKey(
      input.actorUserId,
      input.limit,
      input.cursor,
      input.includeArchived,
    );
    const cached = await this.redis.get<{
      items: ReturnType<ChatAggregate['toPersistence']>[];
      nextCursor?: string;
    }>(cacheKey);

    const result = cached
      ? {
          items: cached.items.map((item) =>
            ChatAggregate.restore(this.hydrateChat(item)),
          ),
          nextCursor: cached.nextCursor,
        }
      : await this.db.listChats(input);

    if (!cached) {
      await this.redis.set(
        cacheKey,
        {
          items: result.items.map((chat) => chat.toPersistence()),
          nextCursor: result.nextCursor,
        },
        this.listCacheTtlSec,
      );
    }

    return {
      items: await Promise.all(
        result.items.map((chat) =>
          this.buildChatListItem(chat, input.actorUserId),
        ),
      ),
      nextCursor: result.nextCursor,
    };
  }

  async getChatMembers(input: GetChatMembersInput) {
    await this.requireActiveMember(input.chatId, input.actorUserId);
    return this.db.listMembersPaginated(input);
  }

  async addMembers(input: AddMembersInput): Promise<void> {
    await this.getChatById(input.chatId);
    await this.requirePrivilegedMember(input.chatId, input.actorUserId);

    for (const userId of this.normalizeUserIds(input.userIds)) {
      const existing = await this.db.findMemberByChatAndUser(
        input.chatId,
        userId,
      );
      if (existing && !existing.leftAt) continue;

      const member = MemberAggregate.create({
        requestId: crypto.randomUUID(),
        chatId: input.chatId,
        userId,
      });
      await this.db.saveMember(member);
      await this.invalidateUserChats(userId);
    }

    await this.invalidateChatMembersLists(input.chatId);
  }

  async removeMember(input: RemoveMemberInput): Promise<void> {
    await this.requirePrivilegedMember(input.chatId, input.actorUserId);

    const deleted = await this.db.deleteMember(input.chatId, input.userId);
    if (!deleted) {
      throw new NotFoundAppError('ChatMember', {
        chatId: input.chatId,
        userId: input.userId,
      });
    }

    await this.invalidateUserChats(input.userId);
    await this.invalidateChatMembersLists(input.chatId);
  }

  async leaveChat(input: LeaveChatInput): Promise<void> {
    const member = await this.requireActiveMember(
      input.chatId,
      input.actorUserId,
    );

    member.leave({ id: member.id, userId: input.actorUserId });
    await this.db.saveMember(member);
    await this.invalidateUserChats(input.actorUserId);
    await this.invalidateChatMembersLists(input.chatId);
  }

  async archiveChat(input: ArchiveChatInput): Promise<void> {
    const member = await this.requireActiveMember(
      input.chatId,
      input.actorUserId,
    );
    member.archive({ id: member.id, userId: input.actorUserId });
    await this.db.saveMember(member);
    await this.invalidateUserChats(input.actorUserId);
  }

  async unarchiveChat(input: UnarchiveChatInput): Promise<void> {
    const member = await this.requireActiveMember(
      input.chatId,
      input.actorUserId,
    );
    member.unarchive({ id: member.id, userId: input.actorUserId });
    await this.db.saveMember(member);
    await this.invalidateUserChats(input.actorUserId);
  }

  async muteChat(input: MuteChatInput): Promise<void> {
    const member = await this.requireActiveMember(
      input.chatId,
      input.actorUserId,
    );
    member.mute({
      id: member.id,
      userId: input.actorUserId,
      mutedUntil: input.mutedUntil,
    });
    await this.db.saveMember(member);
    await this.invalidateUserChats(input.actorUserId);
  }

  async unmuteChat(input: UnmuteChatInput): Promise<void> {
    const member = await this.requireActiveMember(
      input.chatId,
      input.actorUserId,
    );
    member.mute({
      id: member.id,
      userId: input.actorUserId,
      mutedUntil: null,
    });
    await this.db.saveMember(member);
    await this.invalidateUserChats(input.actorUserId);
  }

  async sendMessage(input: SendMessageInput): Promise<MessageAggregate> {
    const chat = await this.getChatById(input.chatId);
    await this.requireActiveMember(input.chatId, input.authorId);

    const message = MessageAggregate.create({
      requestId: input.requestId,
      chatId: input.chatId,
      authorId: input.authorId,
      kind: input.kind,
      text: input.text,
      replyToId: input.replyToId ?? null,
    });

    const savedMessage = await this.db.saveMessage(message);
    chat.touchLastMessage({
      messageId: savedMessage.id,
      messageCreatedAt: savedMessage.createdAt,
    });
    await this.db.saveChat(chat);
    await this.invalidateChat(chat.id);
    await this.invalidateMessagesList(chat.id);
    await this.invalidateChatMembersLists(chat.id);

    return savedMessage;
  }

  async updateMessage(input: UpdateMessageInput): Promise<MessageAggregate> {
    const message = await this.db.findMessageById(input.messageId);
    if (!message) {
      throw new NotFoundAppError('Message', { messageId: input.messageId });
    }

    message.editMessage({
      id: input.messageId,
      authorId: input.authorId,
      text: input.text,
    });
    const saved = await this.db.saveMessage(message);
    await this.invalidateMessagesList(saved.chatId);
    return saved;
  }

  async deleteMessage(input: DeleteMessageInput): Promise<void> {
    const message = await this.db.findMessageById(input.messageId);
    if (!message) {
      throw new NotFoundAppError('Message', {
        messageId: input.messageId,
        authorId: input.authorId,
      });
    }

    message.deleteMessage({
      id: input.messageId,
      authorId: input.authorId,
    });
    const saved = await this.db.saveMessage(message);
    await this.invalidateMessagesList(saved.chatId);
  }

  async listMessages(input: ListMessagesInput) {
    await this.requireActiveMember(input.chatId, input.actorUserId);

    const cacheKey = this.messagesListKey(
      input.chatId,
      input.limit,
      input.cursor,
    );
    const cached = await this.redis.get<{
      items: ReturnType<MessageAggregate['toPersistence']>[];
      nextCursor?: string;
    }>(cacheKey);
    if (cached) {
      return {
        items: cached.items.map((item) =>
          MessageAggregate.restore(this.hydrateMessage(item)),
        ),
        nextCursor: cached.nextCursor,
      };
    }

    const result = await this.db.listMessages(input);
    await this.redis.set(
      cacheKey,
      {
        items: result.items.map((message) => message.toPersistence()),
        nextCursor: result.nextCursor,
      },
      this.listCacheTtlSec,
    );
    return result;
  }

  async markAsRead(input: MarkAsReadInput): Promise<void> {
    const member = await this.requireActiveMember(
      input.chatId,
      input.actorUserId,
    );
    const message = await this.db.findMessageById(input.lastReadMessageId);
    if (!message || message.chatId !== input.chatId) {
      throw new NotFoundAppError('Message', {
        messageId: input.lastReadMessageId,
        chatId: input.chatId,
      });
    }

    member.markRead({
      id: member.id,
      userId: input.actorUserId,
      lastReadMessageId: input.lastReadMessageId,
    });
    await this.db.saveMember(member);
    await this.invalidateUserChats(input.actorUserId);
  }

  private async getChatById(chatId: string): Promise<ChatAggregate> {
    const cacheKey = this.chatKey(chatId);
    const cached =
      await this.redis.get<ReturnType<ChatAggregate['toPersistence']>>(
        cacheKey,
      );
    if (cached) return ChatAggregate.restore(this.hydrateChat(cached));

    const chat = await this.db.findChatById(chatId);
    if (!chat) throw new NotFoundAppError('Chat', { chatId });

    await this.cacheChat(chat);
    return chat;
  }

  private async buildChatDetails(
    chat: ChatAggregate,
    actorUserId: string,
  ): Promise<ChatDetailsView> {
    const myState = await this.requireActiveMember(chat.id, actorUserId);
    const participants = await this.db.listMembers(chat.id);
    const lastMessage = chat.lastMessageId
      ? await this.db.findMessageById(chat.lastMessageId)
      : null;
    const unreadCount = await this.db.countUnreadMessages(
      chat.id,
      myState.lastReadAt,
    );

    return { chat, myState, participants, lastMessage, unreadCount };
  }

  private async buildChatListItem(
    chat: ChatAggregate,
    actorUserId: string,
  ): Promise<ChatListItemView> {
    const myState = await this.requireActiveMember(chat.id, actorUserId);
    const lastMessage = chat.lastMessageId
      ? await this.db.findMessageById(chat.lastMessageId)
      : null;
    const unreadCount = await this.db.countUnreadMessages(
      chat.id,
      myState.lastReadAt,
    );

    return { chat, myState, lastMessage, unreadCount };
  }

  private async requireActiveMember(
    chatId: string,
    userId: string,
  ): Promise<MemberAggregate> {
    const member = await this.db.findMemberByChatAndUser(chatId, userId);
    if (!member || member.leftAt) {
      throw new NotFoundAppError('ChatMember', { chatId, userId });
    }
    return member;
  }

  private async requirePrivilegedMember(
    chatId: string,
    userId: string,
  ): Promise<MemberAggregate> {
    const member = await this.requireActiveMember(chatId, userId);
    if (!this.isPrivilegedRole(member.role)) {
      throw new ConflictAppError('ChatPermission', { chatId, userId });
    }
    return member;
  }

  private isPrivilegedRole(role: ChatMemberRole): boolean {
    return role === 'OWNER' || role === 'ADMIN';
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

  private createDirectKey(userIds: string[]): string {
    return [...userIds].sort().join(':');
  }

  private hydrateChat(
    value: ReturnType<ChatAggregate['toPersistence']>,
  ): ReturnType<ChatAggregate['toPersistence']> {
    return {
      ...value,
      lastMessageAt: value.lastMessageAt ? new Date(value.lastMessageAt) : null,
      deletedAt: value.deletedAt ? new Date(value.deletedAt) : null,
      createdAt: new Date(value.createdAt),
      updatedAt: new Date(value.updatedAt),
    };
  }

  private hydrateMessage(
    value: ReturnType<MessageAggregate['toPersistence']>,
  ): ReturnType<MessageAggregate['toPersistence']> {
    return {
      ...value,
      editedAt: value.editedAt ? new Date(value.editedAt) : null,
      deletedAt: value.deletedAt ? new Date(value.deletedAt) : null,
      createdAt: new Date(value.createdAt),
      updatedAt: new Date(value.updatedAt),
    };
  }

  private async cacheChat(chat: ChatAggregate): Promise<void> {
    await this.redis.set(
      this.chatKey(chat.id),
      chat.toPersistence(),
      this.chatCacheTtlSec,
    );
  }

  private async invalidateChat(chatId: string): Promise<void> {
    await this.redis.del(this.chatKey(chatId));
  }

  private async invalidateUserChats(userId: string): Promise<void> {
    await this.redis.delMany(`chats:${userId}`);
  }

  private async invalidateChatMembersLists(chatId: string): Promise<void> {
    const members = await this.db.listMembers(chatId);
    for (const member of members) {
      await this.invalidateUserChats(member.userId);
    }
  }

  private async invalidateMessagesList(chatId: string): Promise<void> {
    await this.redis.delMany(`messages:${chatId}`);
  }

  private chatKey(chatId: string): string {
    return `chat:${chatId}`;
  }

  private chatsListKey(
    userId: string,
    limit: number,
    cursor?: string,
    includeArchived = false,
  ): string {
    return `chats:${userId}:${limit}:${cursor ?? 'first'}:${includeArchived}`;
  }

  private messagesListKey(
    chatId: string,
    limit: number,
    cursor?: string,
  ): string {
    return `messages:${chatId}:${limit}:${cursor ?? 'first'}`;
  }
}
