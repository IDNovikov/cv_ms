import { GetPaginatedUser } from '../dto/get-actors-query.dto';

export class GetUsersQuery {
  constructor(public readonly dto: GetPaginatedUser) {}
}

