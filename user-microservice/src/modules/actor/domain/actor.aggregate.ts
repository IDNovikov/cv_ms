import { IActor } from './actor.interface';
import { DomainError } from 'src/common/errors';
import { AggregateRoot } from '@nestjs/cqrs';
import { ActorCreatedEvent } from './events/actor-created.event';

export class ActorAggregate extends AggregateRoot implements IActor {
  private constructor(private props: IActor) {
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

  static create(input: Pick<IActor, 'author'>): ActorAggregate {
    const now = new Date().toISOString();
    const actor = new ActorAggregate({
      id: crypto.randomUUID(),
      updatedAt: now,
      createdAt: now,
      author: input.author,
    });
    actor.apply(new ActorCreatedEvent(actor.id, now));
    return actor;
  }

  static restore(row: IActor): ActorAggregate {
    return new ActorAggregate({ ...row });
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
