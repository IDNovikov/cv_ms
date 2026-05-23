import { PrismaPromise } from '@prisma/client/runtime/client';
import { ChatAggregate, MemberAggregate, MessageAggregate } from '../../domain';

export type ChatListCursor = string | undefined;

export type ListChatsParams = {
  actorUserId: string;
  limit: number;
  cursor?: ChatListCursor;
  includeArchived: boolean;
};

export type ListMessagesParams = {
  chatId: string;
  actorUserId: string;
  limit: number;
  cursor?: ChatListCursor;
};

export type ListMembersParams = {
  chatId: string;
  limit: number;
  cursor?: ChatListCursor;
};

export type ListResult<T> = {
  items: T[];
  nextCursor?: string;
};

export abstract class ChatDBPort {
  abstract saveChat(chat: ChatAggregate): Promise<ChatAggregate>;
  abstract saveMember(member: MemberAggregate): Promise<MemberAggregate>;
  abstract saveMessage(message: MessageAggregate): Promise<MessageAggregate>;

  abstract findChatById(id: string): Promise<ChatAggregate | null>;
  abstract findChatByDirectKey(
    directKey: string,
  ): Promise<ChatAggregate | null>;
  abstract findMemberByChatAndUser(
    chatId: string,
    userId: string,
  ): Promise<MemberAggregate | null>;
  abstract findMessageById(id: string): Promise<MessageAggregate | null>;

  abstract listChats(
    params: ListChatsParams,
  ): Promise<ListResult<ChatAggregate>>;
  abstract listMessages(
    params: ListMessagesParams,
  ): Promise<ListResult<MessageAggregate>>;
  abstract listMembers(chatId: string): Promise<MemberAggregate[]>;
  abstract listMembersPaginated(
    params: ListMembersParams,
  ): Promise<ListResult<MemberAggregate>>;
  abstract countUnreadMessages(
    chatId: string,
    after: Date | null,
  ): Promise<number>;

  abstract deleteMember(chatId: string, userId: string): Promise<boolean>;

  abstract transaction(props: PrismaPromise<any[]>[]): Promise<any[]>;
}
