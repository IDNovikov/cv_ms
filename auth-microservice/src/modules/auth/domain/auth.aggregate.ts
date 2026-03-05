import { Auth } from 'prisma/generated/prisma/browser';
import { IAuth } from './auth.interface';

export class AuthAggregate implements IAuth {
  private constructor(private _auth: IAuth) {}

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
    input: Pick<IAuth, 'userId' | 'email' | 'password'>,
  ): AuthAggregate {
    const now = new Date();
    const auth = new AuthAggregate({
      id: crypto.randomUUID(),
      userId: input.userId,
      role: 'USER',
      status: 'ACTIVE',
      email: input.email,
      isEmailVerified: false,
      password: this.isHash(input.password),
      updatedAt: now,
      createdAt: now,
    });

    return auth;
  }

  static restore(row: Auth): AuthAggregate {
    return new AuthAggregate({
      id: row.id,
      userId: row.userId,
      role: row.role,
      status: row.status,
      email: row.email,
      isEmailVerified: row.isEmailVerified,
      password: this.isHash(row.password),
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
    });
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
