import { IUser } from 'src/modules/user/domain/user.interface';
import { Paginated } from 'src/modules/user/providers';

export class GetPaginatedUser implements Paginated<keyof IUser> {
  page: number = 1;
  limit: number = 10;
  sortBy?: keyof IUser | undefined;
  order?: 'asc' | 'desc' = 'asc';
  search?: string | undefined;
  constructor() {}
}
