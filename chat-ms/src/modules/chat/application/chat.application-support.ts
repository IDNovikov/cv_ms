import { Injectable } from '@nestjs/common';
import { ChatType, MessageKind } from '@noildm/contracts/dist/gen/chat';
import { Timestamp } from '@noildm/contracts/dist/gen/google/protobuf/timestamp';
import { ConflictAppError, NotFoundAppError } from 'src/common/errors';
import {
  ChatAggregate,
  IChat,
  IMessage,
  MemberAggregate,
  MessageAggregate,
} from '../domain';
import { ChatDBPort, RedisServicePort } from '../providers';
import type { ChatDetailsView, ChatListItemView } from './chat.new.facade';

@Injectable()
export class ChatApplicationSupport {
  private readonly chatCacheTtlSec = 60;

  constructor(
    private readonly db: ChatDBPort,
    private readonly redis: RedisServicePort,
  ) {}

  async getChatById(chatId: string): Promise<ChatAggregate> {
    const cached = await this.redis.get<
      ReturnType<ChatAggregate['toPersistence']>
    >(this.chatKey(chatId));
    if (cached) return ChatAggregate.restore(this.hydrateChat(cached));

    const chat = await this.db.findChatById(chatId);
    if (!chat) throw new NotFoundAppError('Chat', { chatId });

    await this.cacheChat(chat);
    return chat;
  }

  async requireActiveMember(
    chatId: string,
    userId: string,
  ): Promise<MemberAggregate> {
    const member = await this.db.findMemberByChatAndUser(chatId, userId);
    if (!member || member.leftAt) {
      throw new NotFoundAppError('ChatMember', { chatId, userId });
    }

    return member;
  }

  async requirePrivilegedMember(
    chatId: string,
    userId: string,
  ): Promise<MemberAggregate> {
    const member = await this.requireActiveMember(chatId, userId);
    if (member.role !== 'OWNER' && member.role !== 'ADMIN') {
      throw new ConflictAppError('ChatPermission', { chatId, userId });
    }

    return member;
  }

  async buildChatDetails(
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

  async buildChatListItem(
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

  async cacheChat(chat: ChatAggregate): Promise<void> {
    await this.redis.set(
      this.chatKey(chat.id),
      chat.toPersistence(),
      this.chatCacheTtlSec,
    );
  }

  async invalidateChat(chatId: string): Promise<void> {
    await this.redis.del(this.chatKey(chatId));
  }

  async invalidateUserChats(userId: string): Promise<void> {
    await this.redis.delMany(`chats:${userId}`);
  }

  async invalidateChatMembersLists(chatId: string): Promise<void> {
    const members = await this.db.listMembers(chatId);
    await Promise.all(
      members.map((member) => this.invalidateUserChats(member.userId)),
    );
  }

  async invalidateMessagesList(chatId: string): Promise<void> {
    await this.redis.delMany(`messages:${chatId}`);
  }

  normalizeUserIds(userIds: string[]): string[] {
    const normalized = [
      ...new Set(userIds.map((id) => id.trim()).filter(Boolean)),
    ];
    if (normalized.length === 0) {
      throw new ConflictAppError('ChatMembers', { reason: 'userIds required' });
    }

    return normalized;
  }

  toDomainChatType(type: ChatType | IChat['type']): IChat['type'] {
    const value = String(type);
    if (value === 'DIRECT') return 'DIRECT';
    if (value === 'GROUP') return 'GROUP';

    throw new ConflictAppError('ChatType', { type });
  }

  toDomainMessageKind(kind: MessageKind | IMessage['kind']): IMessage['kind'] {
    if (String(kind) === 'SYSTEM') return 'SYSTEM';
    return 'TEXT';
  }

  toDate(value: Date | Timestamp | undefined): Date {
    if (value instanceof Date) return value;
    if (!value) {
      throw new ConflictAppError('Date', { reason: 'date required' });
    }

    return new Date(
      Number(value.seconds) * 1000 + Math.trunc(value.nanos / 1_000_000),
    );
  }

  hydrateChat(
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

  hydrateMessage(
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

  chatKey(chatId: string): string {
    return `chat:${chatId}`;
  }

  chatsListKey(
    userId: string,
    limit: number,
    cursor?: string,
    includeArchived = false,
  ): string {
    return `chats:${userId}:${limit}:${cursor ?? 'first'}:${includeArchived}`;
  }

  messagesListKey(chatId: string, limit: number, cursor?: string): string {
    return `messages:${chatId}:${limit}:${cursor ?? 'first'}`;
  }
  createDirectKey(userIds: string[]): string {
    return [...userIds].sort().join(':');
  }
}
