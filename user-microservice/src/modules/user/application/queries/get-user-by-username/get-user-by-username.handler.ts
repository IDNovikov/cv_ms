import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserAggregate } from 'src/modules/user/domain';
import { UserDBPort } from 'src/modules/user/providers';
import { GetUserByUserNameQuery } from './get-user-by-username.query';
import { NotFoundAppError } from 'src/common/errors';

@QueryHandler(GetUserByUserNameQuery)
export class GetUserByUserNameHandler
  implements IQueryHandler<GetUserByUserNameQuery, UserAggregate>
{
  constructor(private readonly userRepository: UserDBPort) {}

  async execute({ userName }: GetUserByUserNameQuery): Promise<UserAggregate> {
    const existUser = await this.userRepository.findByUserName(userName);
    if (!existUser) {
      throw new NotFoundAppError('User', { userName });
    }

    return existUser;
  }
}
