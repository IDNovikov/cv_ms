import { AggregateRoot } from '@nestjs/cqrs';
import { ISession } from './session.interface';

export class SessionAggregate extends AggregateRoot implements ISession {
  private constructor(private _session: ISession) {
    super();
  }

  get userAgent() {
    return this._session.userAgent;
  }
  get device() {
    return this._session.device;
  }

  get location() {
    return this._session.location;
  }

  static create(session: ISession): SessionAggregate {
    return new SessionAggregate(session);
  }
  static restore(session: ISession): SessionAggregate {
    return new SessionAggregate(session);
  }
}
