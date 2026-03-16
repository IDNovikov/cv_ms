import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserAggregate } from '../domain';
import { CreateUserCommand } from './commands/create-user/create-user.command';
import { CreateUserDTO } from './commands/dto/create-user.dto';
import { UpdateUserDTO } from './commands/dto/update-user.dto';
import { UpdateUserCommand } from './commands/update-user/update-user.command';
import { DeleteUserCommand } from './commands/delete-user/delete-user.command';
import { GetUserQuery } from './queries/get-actor/get-actor-query.command';
import { GetUsersQuery } from './queries/get-all-actors/get-actors-query.command';
import { GetUsersQueryDto } from './queries/dto/get-users-query.dto';
import { GetUserByUserNameQuery } from './queries/get-user-by-username/get-user-by-username.query';

@Injectable()
export class UserFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  commands = {
    createUser: (dto: CreateUserDTO) => this.createUser(dto),
    updateUser: (dto: UpdateUserDTO) => this.updateUser(dto),
    deleteUser: (id: string) => this.deleteUser(id),
  };

  queries = {
    getUserById: (id: string) => this.getUserById(id),
    getUserByUserName: (userName: string) => this.getUserByUserName(userName),
    getPaginatedUsers: (dto: GetUsersQueryDto) => this.getPaginatedUsers(dto),
  };

  private createUser(dto: CreateUserDTO) {
    return this.commandBus.execute<CreateUserCommand, UserAggregate>(
      new CreateUserCommand(dto),
    );
  }

  private updateUser(dto: UpdateUserDTO) {
    return this.commandBus.execute<UpdateUserCommand, UserAggregate>(
      new UpdateUserCommand(dto),
    );
  }

  private deleteUser(id: string) {
    return this.commandBus.execute<DeleteUserCommand, boolean>(
      new DeleteUserCommand(id),
    );
  }

  private getUserById(id: string) {
    return this.queryBus.execute<GetUserQuery, UserAggregate>(
      new GetUserQuery(id),
    );
  }

  private getUserByUserName(userName: string) {
    return this.queryBus.execute<GetUserByUserNameQuery, UserAggregate>(
      new GetUserByUserNameQuery(userName),
    );
  }

  private getPaginatedUsers(dto: GetUsersQueryDto) {
    return this.queryBus.execute<
      GetUsersQuery,
      { data: UserAggregate[]; total: number }
    >(new GetUsersQuery(dto));
  }
}
