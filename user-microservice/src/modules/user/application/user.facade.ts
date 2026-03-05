import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDTO } from './commands/dto/create-user.dto';
import { CreateUserCommand } from './commands/create-user/create-user.command';
import { UserAggregate } from '../domain';
import { UpdateDTO } from './commands/dto/update-author-actor.dto';
import { UpdateUserAuthorCommand } from './commands/update-author-actor/update-author-actor.command';
import { GetUserQuery } from './queries/get-actor/get-actor-query.command';
import { GetPaginatedUser } from './queries/dto/get-actors-query.dto';
import { GetUsersQuery } from './queries/get-all-actors/get-actors-query.command';

@Injectable()
export class UserFacade {
  constructor(
    private readonly CommandBus: CommandBus,
    private readonly QueryBus: QueryBus,
    private readonly EventBus: EventBus,
  ) {}

  commands = {
    createUser: (user: CreateUserDTO) => this.createUser(user),
    updateUserAuthor: (dto: UpdateDTO) => this.updateUserAuthor(dto),
  };

  queries = {
    getUserById: (id: string) => this.getUserById(id),
    getPaginatedUsers: (dto: GetPaginatedUser) => this.getPaginatedUsers(dto),
  };

  private createUser(user: CreateUserDTO) {
    return this.CommandBus.execute<CreateUserCommand, UserAggregate>(
      new CreateUserCommand(user),
    );
  }

  private updateUserAuthor(dto: UpdateDTO) {
    return this.CommandBus.execute<UpdateUserAuthorCommand, UserAggregate>(
      new UpdateUserAuthorCommand(dto),
    );
  }

  private getUserById(id: string) {
    return this.QueryBus.execute<GetUserQuery, UserAggregate>(
      new GetUserQuery(id),
    );
  }

  private getPaginatedUsers(dto: GetPaginatedUser) {
    return this.QueryBus.execute<
      GetUsersQuery,
      { data: UserAggregate[]; total: number }
    >(new GetUsersQuery(dto));
  }
}
