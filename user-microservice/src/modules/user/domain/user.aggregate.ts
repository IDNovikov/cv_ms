import { IUser } from './user.interface';
import { DomainError } from 'src/common/errors';
import { AggregateRoot } from '@nestjs/cqrs';
import { UserCreatedEvent } from './events/user-created.event';

export class UserAggregate extends AggregateRoot implements IUser {
  private constructor(private props: IUser) {
    super();
  }
  get id() {
    return this.props.id;
  }
  get author() {
    return this.props.author;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(input: Pick<IUser, 'author'>): UserAggregate {
    const now = new Date().toISOString();
    const actor = new UserAggregate({
      id: crypto.randomUUID(),
      updatedAt: now,
      createdAt: now,
      author: input.author,
    });
    actor.apply(new UserCreatedEvent(actor.author, now));
    return actor;
  }

  static restore(row: IUser): UserAggregate {
    return new UserAggregate({ ...row });
  }

  updateAuthor(author: string): void {
    const trimmed = author.trim();
    if (!trimmed) throw new Error('author is empty');
    if (trimmed === this.props.author) return;

    const now = new Date().toISOString();

    this.props = {
      ...this.props,
      author: trimmed,
      updatedAt: now,
    };
  }
}
