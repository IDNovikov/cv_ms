import { ChatType } from '@noildm/contracts/dist/gen/chat';
import { DomainValidationError } from 'src/common/errors';
import { v7 } from 'uuid';
import {
  CreateChatInput,
  DeleteChatInput,
  IChat,
  TouchLastMessageInput,
  UpdateChatProfileInput,
} from './chat.interface';
import { AggregateRoot } from '../common/aggregate-root';
import { ChatCreatedDomainEvent } from './events/chat-created.event';

export class ChatAggregate
  extends AggregateRoot<ChatCreatedDomainEvent>
  implements IChat
{
  private constructor(private props: IChat) {
    super();
  }

  get id() {
    return this.props.id;
  }

  get requestId() {
    return this.props.requestId;
  }

  get type() {
    return this.props.type;
  }

  get title() {
    return this.props.title;
  }

  get avatarUrl() {
    return this.props.avatarUrl;
  }

  get directKey() {
    return this.props.directKey;
  }

  get createdById() {
    return this.props.createdById;
  }

  get lastMessageId() {
    return this.props.lastMessageId;
  }

  get lastMessageAt() {
    return this.props.lastMessageAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(input: CreateChatInput): ChatAggregate {
    const now = new Date();
    const type = input.type;

    const directKey = ChatAggregate.createDirectKey([
      input.createdById,
      ...input.invitedById,
    ]);

    if (
      type === ChatType.DIRECT &&
      !ChatAggregate.normalizeNullable(directKey)
    ) {
      throw new DomainValidationError('directKey is required for direct chat', {
        field: 'directKey',
      });
    }

    const chat = new ChatAggregate({
      id: v7(),
      requestId: ChatAggregate.normalizeRequired(input.requestId, 'requestId'),
      type,
      title: ChatAggregate.normalizeNullable(input.title),
      avatarUrl: ChatAggregate.normalizeNullable(input.avatarUrl),
      directKey:
        type === ChatType.DIRECT
          ? ChatAggregate.normalizeRequired(directKey, 'directKey')
          : null,
      createdById: ChatAggregate.normalizeRequired(
        input.createdById,
        'createdById',
      ),
      lastMessageId: null,
      lastMessageAt: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    chat.addEvent({
      chatId: chat.id,
      type: chat.type,
      createdAt: chat.createdAt,
      createdById: chat.createdById,
      invitedById: input.invitedById,
    });
    return chat;
  }

  static restore(props: IChat): ChatAggregate {
    return new ChatAggregate({ ...props });
  }

  updateProfile(input: UpdateChatProfileInput): ChatAggregate {
    this.assertSameChat(input.id);
    this.assertNotDeleted();

    if (input.title !== undefined) {
      this.props.title = ChatAggregate.normalizeNullable(input.title);
    }

    if (input.avatarUrl !== undefined) {
      this.props.avatarUrl = ChatAggregate.normalizeNullable(input.avatarUrl);
    }

    this.props.updatedAt = new Date();
    return this;
  }

  touchLastMessage(input: TouchLastMessageInput): ChatAggregate {
    this.assertNotDeleted();

    this.props.lastMessageId = input.messageId;
    this.props.lastMessageAt = input.messageCreatedAt;
    this.props.updatedAt = new Date();

    return this;
  }

  deleteChat(input: DeleteChatInput): ChatAggregate {
    this.assertSameChat(input.id);
    this.assertNotDeleted();

    if (input.actorId !== this.createdById) {
      throw new DomainValidationError('Only chat creator can delete chat', {
        field: 'actorId',
      });
    }

    const now = new Date();
    this.props.deletedAt = now;
    this.props.updatedAt = now;

    return this;
  }

  toPersistence(): IChat {
    return { ...this.props };
  }

  private assertSameChat(id: string): void {
    if (id !== this.id) {
      throw new DomainValidationError('Cannot change another chat', {
        field: 'id',
      });
    }
  }

  private assertNotDeleted(): void {
    if (this.deletedAt) {
      throw new DomainValidationError('Chat has already deleted');
    }
  }

  private static normalizeRequired(
    value: string | null | undefined,
    field: string,
  ): string {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainValidationError(`${field} is required`, { field });
    }

    return normalized;
  }

  private static normalizeNullable(value?: string | null): string | null {
    if (value === undefined || value === null) return null;

    const normalized = value.trim();
    return normalized.length ? normalized : null;
  }

  private static createDirectKey(userIds: string[]): string {
    return [...userIds].sort().join(':');
  }
}
