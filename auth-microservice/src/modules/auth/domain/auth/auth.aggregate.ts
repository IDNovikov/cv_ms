import { IAuth } from './auth.interface';
import { AggregateRoot } from '@nestjs/cqrs';
import { ActorCreatedEvent } from './events/actor-created.event';

export class AuthAggregate extends AggregateRoot implements IAuth {
  private constructor(private _auth: IAuth) {
    super();
  }

  get id() {
    return this._auth.id;
  }
  get userId() {
    return this._auth.userId;
  }
  get role() {
    return this._auth.role;
  }
  get status() {
    return this._auth.status;
  }
  get email() {
    return this._auth.email;
  }
  get isEmailVerified() {
    return this._auth.isEmailVerified;
  }
  get password() {
    return this._auth.password;
  }
  get createdAt() {
    return this._auth.createdAt;
  }
  get updatedAt() {
    return this._auth.updatedAt;
  }

  static create(
    input: Omit<IAuth, 'id' | 'updatedAt' | 'createdAt'>,
  ): AuthAggregate {
    const now = new Date().toISOString();
    const auth = new AuthAggregate({
      id: crypto.randomUUID(),
      userId: null,
      role: 'USER',
      status: 'ACTIVE',
      email: input.email,
      isEmailVerified: false,
      password: this.isHash(input.password),
      updatedAt: now,
      createdAt: now,
    });

    // actor.apply(new ActorCreatedEvent(actor.author, now));
    return auth;
  }

  static restore(row: IAuth): AuthAggregate {
    return new AuthAggregate({ ...row });
  }

  changeRole(role: IAuth['role']): IAuth['role'] {
    return (this._auth.role = role);
  }

  changeStatus(status: IAuth['status']): IAuth['status'] {
    return (this._auth.status = status);
  }

  confirmEmail(): true {
    return (this._auth.isEmailVerified = true);
  }

  setPassword(password: string): string {
    return (this._auth.password = AuthAggregate.isHash(password));
  }

  private static isHash(password: string): string {
    const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
    if (!BCRYPT_RE.test(password)) throw new Error('NOT_HASHED_PASSWORD');
    return password;
  }
}
