import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UserAggregate } from 'src/modules/user/domain';
import { UserDBPort } from 'src/modules/user/providers';
import { GetUserByUserNameQuery } from './get-user-by-username.query';

@QueryHandler(GetUserByUserNameQuery)
export class GetUserByUserNameHandler
  implements IQueryHandler<GetUserByUserNameQuery, UserAggregate>
{
  constructor(private readonly userRepository: UserDBPort) {}

  async execute({ userName }: GetUserByUserNameQuery): Promise<UserAggregate> {
    const existUser = await this.userRepository.findByUserName(userName);
    if (!existUser) {
      throw new NotFoundException(`User by userName "${userName}" not found`);
    }

    return existUser;
  }
}
