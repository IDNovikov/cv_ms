import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserAggregate } from 'src/modules/user/domain';
import { UserDBPort } from 'src/modules/user/providers';
import { GetUserQuery } from './get-actor-query.command';
import { NotFoundAppError } from 'src/common/errors';

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<
  GetUserQuery,
  UserAggregate
> {
  constructor(private readonly userRepository: UserDBPort) {}

  async execute({ id }: GetUserQuery): Promise<UserAggregate> {
    const existUser = await this.userRepository.findById(id);
    if (!existUser) {
      throw new NotFoundAppError('User', { id });
    }

    return existUser;
  }
}
