import { Paginated } from 'src/modules/user/providers';

export class GetUsersQueryDto implements Paginated {
  page = 1;
  limit = 10;
  sortBy: Paginated['sortBy'] = 'createdAt';
  order: Paginated['order'] = 'desc';
  search?: string;
}
