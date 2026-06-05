import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  Chat,
  ChatDetails,
  ChatListItem,
  ChatMemberRole,
  ChatParticipant,
  ChatType,
  ChatUserState,
  Message,
  MessageKind,
} from '@noildm/contracts/dist/gen/chat';
import { Timestamp } from '@noildm/contracts/dist/gen/google/protobuf/timestamp';
import { User } from '@/common/decorators/userRefreshToken.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { FacadePort } from '../../providers/facade/facade.port';
import {
  AddMembersDto,
  CreateChatDto,
  GetChatMembersDto,
  ListChatsDto,
  ListMessagesDto,
  MarkAsReadDto,
  MuteChatDto,
  SendMessageDto,
  UpdateChatDto,
  UpdateMessageDto,
} from '../REST/DTO';
import {
  ChatDetailsGqlEntity,
  ChatGqlEntity,
  ChatListItemGqlEntity,
  ChatUserStateGqlEntity,
} from './models/chat-gql.entity';
import { MemberGqlEntity } from './models/member-gql.entity';
import { MessageGqlEntity } from './models/message-gql.entity';
import {
  ChatListResponseGql,
  ChatMembersResponseGql,
  MessageListResponseGql,
} from './response/chat-response.gql';

type AuthUser = { sub: string };

function timestampToDate(value: Timestamp | undefined): Date {
  if (!value) return new Date(0);
  return new Date(Number(value.seconds) * 1000 + Math.trunc(value.nanos / 1_000_000));
}

function nullableTimestampToDate(value: Timestamp | undefined): Date | null {
  return value ? timestampToDate(value) : null;
}

function mapChatToGql(chat: Chat | undefined): ChatGqlEntity | null {
  if (!chat) return null;

  return {
    id: chat.id,
    type: chat.type ?? ChatType.UNSPECIFIED,
    title: chat.title ?? null,
    avatarUrl: chat.avatarUrl ?? null,
    createdById: chat.createdById,
    lastMessageId: chat.lastMessageId ?? null,
    lastMessageAt: nullableTimestampToDate(chat.lastMessageAt),
    createdAt: timestampToDate(chat.createdAt),
    updatedAt: timestampToDate(chat.updatedAt),
  };
}

function mapMessageToGql(message: Message | undefined): MessageGqlEntity | null {
  if (!message) return null;

  return {
    id: message.id,
    chatId: message.chatId,
    authorId: message.authorId,
    kind: message.kind ?? MessageKind.TEXT,
    text: message.text,
    isEdited: message.isEdited,
    editedAt: nullableTimestampToDate(message.editedAt),
    replyToId: message.replyToId ?? null,
    createdAt: timestampToDate(message.createdAt),
    updatedAt: timestampToDate(message.updatedAt),
  };
}

function mapMemberToGql(member: ChatParticipant): MemberGqlEntity {
  return {
    userId: member.userId,
    role: member.role ?? ChatMemberRole.MEMBER,
    joinedAt: timestampToDate(member.joinedAt),
  };
}

function mapUserStateToGql(state: ChatUserState | undefined): ChatUserStateGqlEntity | null {
  if (!state) return null;

  return {
    role: state.role ?? ChatMemberRole.MEMBER,
    joinedAt: timestampToDate(state.joinedAt),
    mutedUntil: nullableTimestampToDate(state.mutedUntil),
    archivedAt: nullableTimestampToDate(state.archivedAt),
    lastReadMessageId: state.lastReadMessageId ?? null,
    lastReadAt: nullableTimestampToDate(state.lastReadAt),
  };
}

function mapChatDetailsToGql(details: ChatDetails): ChatDetailsGqlEntity {
  return {
    chat: mapChatToGql(details.chat),
    myState: mapUserStateToGql(details.myState),
    participants: details.participants.map((member) => mapMemberToGql(member)),
    lastMessage: mapMessageToGql(details.lastMessage),
    unreadCount: details.unreadCount,
  };
}

function mapChatListItemToGql(item: ChatListItem): ChatListItemGqlEntity {
  return {
    chat: mapChatToGql(item.chat),
    myState: mapUserStateToGql(item.myState),
    lastMessage: mapMessageToGql(item.lastMessage),
    unreadCount: item.unreadCount,
  };
}

@UseGuards(JwtAuthGuard)
@Resolver(() => ChatGqlEntity)
export class ChatResolver {
  constructor(private readonly chatFacade: FacadePort) {}

  @Query(() => ChatDetailsGqlEntity, { nullable: true })
  async chat(@User() user: AuthUser, @Args('chatId') chatId: string) {
    const result = await this.chatFacade.getChat({
      chatId,
      actorUserId: user.sub,
    });
    return mapChatDetailsToGql(result);
  }

  @Query(() => ChatListResponseGql)
  async chats(@User() user: AuthUser, @Args('query', { nullable: true }) query?: ListChatsDto) {
    const result = await this.chatFacade.getListChats({
      actorUserId: user.sub,
      limit: query?.limit ?? 20,
      cursor: query?.cursor,
      includeArchived: query?.includeArchived ?? false,
    });

    return {
      chats: result.chats.map((chat) => mapChatListItemToGql(chat)),
      nextCursor: result.nextCursor ?? null,
    };
  }

  @Query(() => ChatMembersResponseGql)
  async chatMembers(
    @User() user: AuthUser,
    @Args('chatId') chatId: string,
    @Args('query', { nullable: true }) query?: GetChatMembersDto,
  ) {
    const result = await this.chatFacade.getChatMembers({
      chatId,
      actorUserId: user.sub,
      limit: query?.limit ?? 20,
      cursor: query?.cursor,
    });

    return {
      participants: result.participants.map((member) => mapMemberToGql(member)),
      nextCursor: result.nextCursor ?? null,
    };
  }

  @Query(() => MessageListResponseGql)
  async messages(
    @User() user: AuthUser,
    @Args('chatId') chatId: string,
    @Args('query', { nullable: true }) query?: ListMessagesDto,
  ) {
    const result = await this.chatFacade.getListMessages({
      chatId,
      actorUserId: user.sub,
      limit: query?.limit ?? 20,
      cursor: query?.cursor,
    });

    return {
      messages: result.messages.map((message) => mapMessageToGql(message)),
      nextCursor: result.nextCursor ?? null,
    };
  }

  @Mutation(() => ChatDetailsGqlEntity)
  async createChat(@User() user: AuthUser, @Args('input') input: CreateChatDto) {
    const result = await this.chatFacade.createChat({
      requestId: input.requestId,
      actorUserId: user.sub,
      type: input.type,
      participantUserIds: input.participantUserIds,
      title: input.title,
      avatarUrl: input.avatarUrl,
    });

    return mapChatDetailsToGql(result);
  }

  @Mutation(() => ChatDetailsGqlEntity)
  async updateChat(
    @User() user: AuthUser,
    @Args('chatId') chatId: string,
    @Args('input') input: UpdateChatDto,
  ) {
    const result = await this.chatFacade.updateChat({
      chatId,
      actorUserId: user.sub,
      title: input.title,
      avatarUrl: input.avatarUrl,
    });

    return mapChatDetailsToGql(result);
  }

  @Mutation(() => Boolean)
  async deleteChat(@User() user: AuthUser, @Args('chatId') chatId: string) {
    await this.chatFacade.deleteChat({
      chatId,
      actorUserId: user.sub,
    });
    return true;
  }

  @Mutation(() => Boolean)
  async addMembers(
    @User() user: AuthUser,
    @Args('chatId') chatId: string,
    @Args('input') input: AddMembersDto,
  ) {
    await this.chatFacade.addMembers({
      chatId,
      actorUserId: user.sub,
      userIds: input.userIds,
    });
    return true;
  }

  @Mutation(() => Boolean)
  async removeMember(
    @User() user: AuthUser,
    @Args('chatId') chatId: string,
    @Args('userId') userId: string,
  ) {
    await this.chatFacade.removeMember({
      chatId,
      actorUserId: user.sub,
      userId,
    });
    return true;
  }

  @Mutation(() => Boolean)
  async leaveChat(@User() user: AuthUser, @Args('chatId') chatId: string) {
    await this.chatFacade.leaveChat({
      chatId,
      actorUserId: user.sub,
    });
    return true;
  }

  @Mutation(() => Boolean)
  async archiveChat(@User() user: AuthUser, @Args('chatId') chatId: string) {
    await this.chatFacade.archiveChat({
      chatId,
      actorUserId: user.sub,
    });
    return true;
  }

  @Mutation(() => Boolean)
  async unarchiveChat(@User() user: AuthUser, @Args('chatId') chatId: string) {
    await this.chatFacade.unarchiveChat({
      chatId,
      actorUserId: user.sub,
    });
    return true;
  }

  @Mutation(() => Boolean)
  async muteChat(
    @User() user: AuthUser,
    @Args('chatId') chatId: string,
    @Args('input') input: MuteChatDto,
  ) {
    await this.chatFacade.muteChat({
      chatId,
      actorUserId: user.sub,
      mutedUntil: input.mutedUntil,
    });
    return true;
  }

  @Mutation(() => Boolean)
  async unmuteChat(@User() user: AuthUser, @Args('chatId') chatId: string) {
    await this.chatFacade.unmuteChat({
      chatId,
      actorUserId: user.sub,
    });
    return true;
  }

  @Mutation(() => MessageGqlEntity)
  async sendMessage(
    @User() user: AuthUser,
    @Args('chatId') chatId: string,
    @Args('input') input: SendMessageDto,
  ) {
    const message = await this.chatFacade.sendMessage({
      requestId: input.requestId,
      chatId,
      authorId: user.sub,
      kind: input.kind,
      text: input.text,
      replyToId: input.replyToId,
    });

    return mapMessageToGql(message);
  }

  @Mutation(() => MessageGqlEntity)
  async updateMessage(
    @User() user: AuthUser,
    @Args('messageId') messageId: string,
    @Args('input') input: UpdateMessageDto,
  ) {
    const message = await this.chatFacade.updateMessage({
      messageId,
      authorId: user.sub,
      text: input.text,
    });

    return mapMessageToGql(message);
  }

  @Mutation(() => Boolean)
  async deleteMessage(@User() user: AuthUser, @Args('messageId') messageId: string) {
    await this.chatFacade.deleteMessage({
      messageId,
      authorId: user.sub,
    });
    return true;
  }

  @Mutation(() => Boolean)
  async markAsRead(
    @User() user: AuthUser,
    @Args('chatId') chatId: string,
    @Args('input') input: MarkAsReadDto,
  ) {
    await this.chatFacade.markAsRead({
      chatId,
      actorUserId: user.sub,
      lastReadMessageId: input.lastReadMessageId,
    });
    return true;
  }
}
