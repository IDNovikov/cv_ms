import { IAuth } from './auth.interface';
import { DomainError } from 'src/common/errors';
import { AggregateRoot } from '@nestjs/cqrs';
import { ActorCreatedEvent } from './events/actor-created.event';

export class AuthAggregate extends AggregateRoot implements IAuth {
  private constructor(private props: IAuth) {
    super();
  }

  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get role() {
    return this.props.role;
  }
  get status() {
    return this.props.status;
  }
  get email() {
    return this.props.email;
  }
  get isEmailVerified() {
    return this.props.isEmailVerified;
  }
  get password() {
    return this.props.password;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(input: Omit<IAuth, 'id'|"updatedAt"|"createdAt">): AuthAggregate {
    const now = new Date().toISOString();
    const auth = new AuthAggregate({
      id: crypto.randomUUID(),
      userId: null,
      role:"USER",
      status:"ACTIVE",
      email:input.email,
      isEmailVerified:false,
      password:




      updatedAt: now,
      createdAt: now,
      
    });
   // actor.apply(new ActorCreatedEvent(actor.author, now));
    return auth;
  }

  static restore(row: IAuth): AuthAggregate {
    return new AuthAggregate({ ...row });
  }

  checkPassword(password){
     const isOnlyLatinNumbersAndSymbols =
    /^[A-Za-z0-9!@#$%^&*()_\-+=\[{\]};:'",<.>/?~|\\]*$/;
  const isUpperAndLower = /^(?=.*[a-z])(?=.*[A-Z]).+$/;
  const isOneNumber = /^(?=.*\d).+$/;
  const isSymbol = /^(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?~|\\]).+$/;
  const isThreeSymbols = /^(?!.*(.)\1{2,}).+$/;

  if (!isOnlyLatinNumbersAndSymbols.test(password)) {
    throw new DomainError()
    return {
      isVaild: false,
      message: 'Only Latin letters, numbers and special symbols',
    };
  } else if (password.length < 8) {
    return { isValid: false, message: '8 or more characters' };
  } else if (!isUpperAndLower.test(password)) {
    return { isValid: false, message: 'Upper & lowercase letters' };
  } else if (!isOneNumber.test(password)) {
    return { isValid: false, message: 'At least one number' };
  } else if (!isSymbol.test(password)) {
    return { isValid: false, message: 'At least one special symbol' };
  } else if (!isThreeSymbols.test(password)) {
    return {
      isValid: false,
      message: 'No sequences of three or more identical characters',
    };
  }

  return { isValid: true };
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
