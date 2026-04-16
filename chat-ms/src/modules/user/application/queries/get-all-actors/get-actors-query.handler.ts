import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserAggregate } from 'src/modules/user/domain';
import { UserDBPort } from 'src/modules/user/providers';
import { GetUsersQuery } from './get-actors-query.command';

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler implements IQueryHandler<
  GetUsersQuery,
  {
    data: UserAggregate[];
    total: number;
  }
> {
  constructor(private readonly userRepository: UserDBPort) {}

  async execute({ dto }: GetUsersQuery): Promise<{
    data: UserAggregate[];
    total: number;
  }> {
    return this.userRepository.findAll(dto);
  }
}
