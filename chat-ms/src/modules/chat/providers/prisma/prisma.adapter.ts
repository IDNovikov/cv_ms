import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/core/prisma/prisma.service';
import {
  ChatAggregate,
  IChat,
  IMember,
  IMessage,
  MemberAggregate,
  MessageAggregate,
} from '../../domain';
import {
  ChatDBPort,
  ListChatsParams,
  ListMembersParams,
  ListMessagesParams,
  ListResult,
} from './prisma.port';
import { DependencyUnavailableError } from 'src/common/errors';
import { PrismaPromise } from 'prisma/generated/internal/prismaNamespace';

@Injectable()
export class ChatDBAdapter extends ChatDBPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async saveChat(chat: ChatAggregate): Promise<ChatAggregate> {
    try {
      const data = chat.toPersistence();
      const row = await this.prisma.chat.upsert({
        where: { id: data.id },
        create: data,
        update: {
          requestId: data.requestId,
          type: data.type,
          title: data.title,
          avatarUrl: data.avatarUrl,
          directKey: data.directKey,
          createdById: data.createdById,
          lastMessageId: data.lastMessageId,
          lastMessageAt: data.lastMessageAt,
          deletedAt: data.deletedAt,
        },
      });

      return ChatAggregate.restore(this.mapChat(row));
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'saveChat' },
        error,
      );
    }
  }

  async saveMember(member: MemberAggregate): Promise<MemberAggregate> {
    try {
      const data = member.toPersistence();
      const row = await this.prisma.chatMember.upsert({
        where: { id: data.id },
        create: data,
        update: {
          requestId: data.requestId,
          role: data.role,
          leftAt: data.leftAt,
          archivedAt: data.archivedAt,
          mutedUntil: data.mutedUntil,
          lastReadMessageId: data.lastReadMessageId,
          lastReadAt: data.lastReadAt,
        },
      });

      return MemberAggregate.restore(this.mapMember(row));
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'saveMember' },
        error,
      );
    }
  }

  async saveMessage(message: MessageAggregate): Promise<MessageAggregate> {
    try {
      const data = message.toPersistence();
      const row = await this.prisma.message.upsert({
        where: { id: data.id },
        create: data,
        update: {
          requestId: data.requestId,
          kind: data.kind,
          text: data.text,
          isEdited: data.isEdited,
          editedAt: data.editedAt,
          deletedAt: data.deletedAt,
          replyToId: data.replyToId,
        },
      });

      return MessageAggregate.restore(this.mapMessage(row));
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'saveMessage' },
        error,
      );
    }
  }

  async findChatById(id: string): Promise<ChatAggregate | null> {
    try {
      const row = await this.prisma.chat.findUnique({ where: { id } });
      return row ? ChatAggregate.restore(this.mapChat(row)) : null;
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'findChatById', id },
        error,
      );
    }
  }

  async findChatByDirectKey(directKey: string): Promise<ChatAggregate | null> {
    try {
      const row = await this.prisma.chat.findUnique({ where: { directKey } });
      return row ? ChatAggregate.restore(this.mapChat(row)) : null;
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'findChatByDirectKey', directKey },
        error,
      );
    }
  }

  async findMemberByChatAndUser(
    chatId: string,
    userId: string,
  ): Promise<MemberAggregate | null> {
    try {
      const row = await this.prisma.chatMember.findUnique({
        where: { chatId_userId: { chatId, userId } },
      });
      return row ? MemberAggregate.restore(this.mapMember(row)) : null;
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'findMemberByChatAndUser', chatId, userId },
        error,
      );
    }
  }

  async findMessageById(id: string): Promise<MessageAggregate | null> {
    try {
      const row = await this.prisma.message.findUnique({ where: { id } });
      return row ? MessageAggregate.restore(this.mapMessage(row)) : null;
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'findMessageById', id },
        error,
      );
    }
  }

  async listChats(params: ListChatsParams): Promise<ListResult<ChatAggregate>> {
    try {
      const limit = this.normalizeLimit(params.limit);
      const rows = await this.prisma.chatMember.findMany({
        where: {
          userId: params.actorUserId,
          leftAt: null,
          ...(params.includeArchived ? {} : { archivedAt: null }),
          chat: {
            deletedAt: null,
            ...(params.cursor
              ? { updatedAt: { lt: new Date(params.cursor) } }
              : {}),
          },
        },
        include: { chat: true },
        orderBy: { chat: { updatedAt: 'desc' } },
        take: limit + 1,
      });

      const visibleRows = rows.slice(0, limit);
      const items = visibleRows.map((row) =>
        ChatAggregate.restore(this.mapChat(row.chat)),
      );
      const nextCursor =
        rows.length > limit
          ? visibleRows[visibleRows.length - 1]?.chat.updatedAt.toISOString()
          : undefined;

      return { items, nextCursor };
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'listChats', ...params },
        error,
      );
    }
  }

  async listMessages(
    params: ListMessagesParams,
  ): Promise<ListResult<MessageAggregate>> {
    try {
      const limit = this.normalizeLimit(params.limit);
      const rows = await this.prisma.message.findMany({
        where: {
          chatId: params.chatId,
          deletedAt: null,
          ...(params.cursor
            ? { createdAt: { lt: new Date(params.cursor) } }
            : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
      });

      const visibleRows = rows.slice(0, limit);
      const items = visibleRows.map((row) =>
        MessageAggregate.restore(this.mapMessage(row)),
      );
      const nextCursor =
        rows.length > limit
          ? visibleRows[visibleRows.length - 1]?.createdAt.toISOString()
          : undefined;

      return { items, nextCursor };
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'listMessages', ...params },
        error,
      );
    }
  }

  async listMembers(chatId: string): Promise<MemberAggregate[]> {
    try {
      const rows = await this.prisma.chatMember.findMany({
        where: { chatId, leftAt: null },
      });
      return rows.map((row) => MemberAggregate.restore(this.mapMember(row)));
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'listMembers', chatId },
        error,
      );
    }
  }

  async listMembersPaginated(
    params: ListMembersParams,
  ): Promise<ListResult<MemberAggregate>> {
    try {
      const limit = this.normalizeLimit(params.limit);
      const rows = await this.prisma.chatMember.findMany({
        where: {
          chatId: params.chatId,
          leftAt: null,
          ...(params.cursor
            ? { joinedAt: { gt: new Date(params.cursor) } }
            : {}),
        },
        orderBy: { joinedAt: 'asc' },
        take: limit + 1,
      });

      const visibleRows = rows.slice(0, limit);
      const items = visibleRows.map((row) =>
        MemberAggregate.restore(this.mapMember(row)),
      );
      const nextCursor =
        rows.length > limit
          ? visibleRows[visibleRows.length - 1]?.joinedAt.toISOString()
          : undefined;

      return { items, nextCursor };
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'listMembersPaginated', ...params },
        error,
      );
    }
  }

  async countUnreadMessages(
    chatId: string,
    after: Date | null,
  ): Promise<number> {
    try {
      return await this.prisma.message.count({
        where: {
          chatId,
          deletedAt: null,
          ...(after ? { createdAt: { gt: after } } : {}),
        },
      });
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'countUnreadMessages', chatId },
        error,
      );
    }
  }

  async deleteMember(chatId: string, userId: string): Promise<boolean> {
    try {
      const deleted = await this.prisma.chatMember.deleteMany({
        where: { chatId, userId },
      });
      return deleted.count > 0;
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'deleteMember', chatId, userId },
        error,
      );
    }
  }

  async transaction(props: PrismaPromise<any[]>[]): Promise<any[]> {
    try {
      const results = await this.prisma.$transaction([...props]);
      return results;
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'transaction' },
        error,
      );
    }
  }

  private normalizeLimit(limit: number): number {
    if (!Number.isFinite(limit) || limit <= 0) return 20;
    return Math.min(Math.trunc(limit), 100);
  }

  private mapChat(row: IChat): IChat {
    return { ...row };
  }

  private mapMember(row: IMember): IMember {
    return { ...row };
  }

  private mapMessage(row: IMessage): IMessage {
    return { ...row };
  }
}
