import { AggregateRoot } from '@nestjs/cqrs';
import {
  CreateMessageInput,
  DeleteMessageInput,
  EditMessageInput,
  IMessage,
} from './message.interface';
import { v7 } from 'uuid';
import { DomainValidationError } from 'src/common/errors';

export class MessageAggregate extends AggregateRoot implements IMessage {
  private constructor(private props: IMessage) {
    super();
  }

  get id() {
    return this.props.id;
  }
  get requestId() {
    return this.props.requestId;
  }

  get chatId() {
    return this.props.chatId;
  }
  get authorId() {
    return this.props.authorId;
  }
  get kind() {
    return this.props.kind;
  }

  get text() {
    return this.props.text;
  }
  get isEdited() {
    return this.props.isEdited;
  }

  get editedAt() {
    return this.props.editedAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  get replyToId() {
    return this.props.replyToId;
  }

  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(input: CreateMessageInput): MessageAggregate {
    const now = new Date();
    const text = MessageAggregate.normalizeText(input.text);

    return new MessageAggregate({
      id: v7(),
      requestId: input.requestId,
      chatId: input.chatId,
      authorId: input.authorId,
      kind: input.kind ?? 'TEXT',
      text,
      editedAt: null,
      isEdited: false,
      deletedAt: null,
      replyToId: input.replyToId ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: IMessage): MessageAggregate {
    return new MessageAggregate({ ...props });
  }

  editMessage(input: EditMessageInput): MessageAggregate {
    if (input.id !== this.id) {
      throw new DomainValidationError('Cannot edit another message', {
        field: 'id',
      });
    }

    if (this.deletedAt) {
      throw new DomainValidationError('Cannot edit deleted message');
    }

    if (this.kind !== 'TEXT') {
      throw new DomainValidationError('Only text messages can be edited', {
        field: 'kind',
      });
    }

    if (this.authorId !== input.authorId) {
      throw new DomainValidationError(
        'Only main author can change the message',
        {
          field: 'authorId',
        },
      );
    }

    const normalizedText = MessageAggregate.normalizeText(input.text);

    if (normalizedText === this.text) {
      return this;
    }

    const now = new Date();

    this.props.text = normalizedText;
    this.props.isEdited = true;
    this.props.editedAt = now;
    this.props.updatedAt = now;

    return this;
  }

  deleteMessage(input: DeleteMessageInput): MessageAggregate {
    if (input.id !== this.id) {
      throw new DomainValidationError('Cannot delete another message', {
        field: 'id',
      });
    }

    if (this.deletedAt) {
      throw new DomainValidationError('Message has already deleted');
    }

    if (this.authorId !== input.authorId) {
      throw new DomainValidationError(
        'Only main author can delete the message',
        {
          field: 'authorId',
        },
      );
    }

    const now = new Date();
    this.props.deletedAt = now;
    this.props.updatedAt = now;
    return this;
  }

  toPersistence(): IMessage {
    return { ...this.props };
  }

  private static normalizeText(value: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new DomainValidationError('Message text is required', {
        field: 'text',
      });
    }

    return normalized;
  }
}
