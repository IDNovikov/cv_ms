import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UserAggregate } from 'src/modules/user/domain';
import { UserDBPort } from 'src/modules/user/providers';
import { GetUserQuery } from './get-actor-query.command';

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery, UserAggregate> {
  constructor(private readonly userRepository: UserDBPort) {}

  async execute({ id }: GetUserQuery): Promise<UserAggregate> {
    const existUser = await this.userRepository.findById(id);
    if (!existUser) {
      throw new NotFoundException(`User by id "${id}" not found`);
    }

    return existUser;
  }
}
