import { AggregateRoot } from '@nestjs/cqrs';
import { IAccessTokenPayload } from './accessToken.interface';

export class AccessTokenAggregate
  extends AggregateRoot
  implements IAccessTokenPayload
{
  private constructor(private _payload: IAccessTokenPayload) {
    super();
  }

  get sub() {
    return this._payload.sub;
  }
  get email() {
    return this._payload.email;
  }

  get role() {
    return this._payload.role;
  }
  get jti() {
    return this._payload.jti;
  }

  static create(payload: IAccessTokenPayload): AccessTokenAggregate {
    return new AccessTokenAggregate(payload);
  }
  static restore(payload: IAccessTokenPayload): AccessTokenAggregate {
    return new AccessTokenAggregate(payload);
  }
}
