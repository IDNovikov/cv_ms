import { AggregateRoot } from '@nestjs/cqrs';
import type { User } from 'prisma/generated/client';
import { UserCreatedEvent } from './events/user-created.event';
import { IUser } from './user.interface';
import { DomainValidationError } from 'src/common/errors';

export type CreateUserInput = {
  userName: string;
  telegramId?: string | null;
  userImage?: string | null;
};

export type UpdateUserInput = {
  userName?: string;
  telegramId?: string | null;
  userImage?: string | null;
};

export class UserAggregate extends AggregateRoot implements IUser {
  private constructor(private readonly props: IUser) {
    super();
  }

  get id() {
    return this.props.id;
  }
  get userName() {
    return this.props.userName;
  }
  get telegramId() {
    return this.props.telegramId;
  }
  get userImage() {
    return this.props.userImage;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(input: CreateUserInput): UserAggregate {
    const now = new Date();
    const userName = this.normalizeUserName(input.userName);
    const user = new UserAggregate({
      id: crypto.randomUUID(),
      userName,
      telegramId: this.normalizeNullable(input.telegramId),
      userImage: this.normalizeNullable(input.userImage),
      createdAt: now,
      updatedAt: now,
    });

    user.apply(new UserCreatedEvent(user.id, user.userName, now));
    return user;
  }

  static restore(row: User): UserAggregate {
    return new UserAggregate({
      id: row.id,
      userName: row.userName,
      telegramId: row.telegramId,
      userImage: row.userImage,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  update(input: UpdateUserInput): UserAggregate {
    if (input.userName !== undefined) {
      this.props.userName = UserAggregate.normalizeUserName(input.userName);
    }
    if (input.telegramId !== undefined) {
      this.props.telegramId = UserAggregate.normalizeNullable(input.telegramId);
    }
    if (input.userImage !== undefined) {
      this.props.userImage = UserAggregate.normalizeNullable(input.userImage);
    }

    this.props.updatedAt = new Date();
    return this;
  }

  toPersistence(): IUser {
    return {
      id: this.id,
      userName: this.userName,
      telegramId: this.telegramId,
      userImage: this.userImage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private static normalizeUserName(value: string): string {
    const normalized = value.trim();
    if (!normalized) {
      throw new DomainValidationError('userName is required', {
        field: 'userName',
      });
    }
    return normalized;
  }

  private static normalizeNullable(value?: string | null): string | null {
    if (value === undefined || value === null) return null;
    const normalized = value.trim();
    return normalized.length ? normalized : null;
  }
}
