import { AggregateRoot } from '@nestjs/cqrs';
import { IRefreshTokenPayload } from './refreshToken.interface';

export class RefreshTokenAggregate
  extends AggregateRoot
  implements IRefreshTokenPayload
{
  private constructor(private _payload: IRefreshTokenPayload) {
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
  get deviceId() {
    return this._payload.deviceId;
  }

  static create(payload: IRefreshTokenPayload): RefreshTokenAggregate {
    return new RefreshTokenAggregate(payload);
  }
  static restore(payload: IRefreshTokenPayload): RefreshTokenAggregate {
    return new RefreshTokenAggregate(payload);
  }
}
