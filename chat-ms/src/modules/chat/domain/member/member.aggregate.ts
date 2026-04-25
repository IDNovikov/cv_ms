import { AggregateRoot } from '@nestjs/cqrs';
import { DomainValidationError } from 'src/common/errors';
import { v7 } from 'uuid';
import {
  ArchiveMemberInput,
  ChangeMemberRoleInput,
  CreateMemberInput,
  IMember,
  LeaveMemberInput,
  MarkMemberReadInput,
  MuteMemberInput,
} from './member.interface';

export class MemberAggregate extends AggregateRoot implements IMember {
  private constructor(private props: IMember) {
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

  get userId() {
    return this.props.userId;
  }

  get role() {
    return this.props.role;
  }

  get joinedAt() {
    return this.props.joinedAt;
  }

  get leftAt() {
    return this.props.leftAt;
  }

  get archivedAt() {
    return this.props.archivedAt;
  }

  get mutedUntil() {
    return this.props.mutedUntil;
  }

  get lastReadMessageId() {
    return this.props.lastReadMessageId;
  }

  get lastReadAt() {
    return this.props.lastReadAt;
  }

  static create(input: CreateMemberInput): MemberAggregate {
    const now = new Date();

    return new MemberAggregate({
      id: v7(),
      requestId: MemberAggregate.normalizeRequired(
        input.requestId,
        'requestId',
      ),
      chatId: MemberAggregate.normalizeRequired(input.chatId, 'chatId'),
      userId: MemberAggregate.normalizeRequired(input.userId, 'userId'),
      role: input.role ?? 'MEMBER',
      joinedAt: now,
      leftAt: null,
      archivedAt: null,
      mutedUntil: null,
      lastReadMessageId: null,
      lastReadAt: null,
    });
  }

  static restore(props: IMember): MemberAggregate {
    return new MemberAggregate({ ...props });
  }

  changeRole(input: ChangeMemberRoleInput): MemberAggregate {
    this.assertSameMember(input.id);
    this.assertActive();

    this.props.role = input.role;
    return this;
  }

  leave(input: LeaveMemberInput): MemberAggregate {
    this.assertSameMember(input.id);
    this.assertSameUser(input.userId);
    this.assertActive();

    this.props.leftAt = new Date();
    return this;
  }

  archive(input: ArchiveMemberInput): MemberAggregate {
    this.assertSameMember(input.id);
    this.assertSameUser(input.userId);

    if (!this.archivedAt) {
      this.props.archivedAt = new Date();
    }

    return this;
  }

  unarchive(input: ArchiveMemberInput): MemberAggregate {
    this.assertSameMember(input.id);
    this.assertSameUser(input.userId);

    this.props.archivedAt = null;
    return this;
  }

  mute(input: MuteMemberInput): MemberAggregate {
    this.assertSameMember(input.id);
    this.assertSameUser(input.userId);

    this.props.mutedUntil = input.mutedUntil;
    return this;
  }

  markRead(input: MarkMemberReadInput): MemberAggregate {
    this.assertSameMember(input.id);
    this.assertSameUser(input.userId);
    this.assertActive();

    this.props.lastReadMessageId = input.lastReadMessageId;
    this.props.lastReadAt = input.lastReadAt ?? new Date();

    return this;
  }

  toPersistence(): IMember {
    return { ...this.props };
  }

  private assertSameMember(id: string): void {
    if (id !== this.id) {
      throw new DomainValidationError('Cannot change another chat member', {
        field: 'id',
      });
    }
  }

  private assertSameUser(userId: string): void {
    if (userId !== this.userId) {
      throw new DomainValidationError('Cannot change another user membership', {
        field: 'userId',
      });
    }
  }

  private assertActive(): void {
    if (this.leftAt) {
      throw new DomainValidationError('Chat member has already left');
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
}
