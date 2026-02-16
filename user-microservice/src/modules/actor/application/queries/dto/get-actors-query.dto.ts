import { IActor } from 'src/modules/actor/domain/actor.interface';
import { Paginated } from 'src/modules/actor/providers';

export class GetPaginatedActor implements Paginated<keyof IActor> {
  page: number = 1;
  limit: number = 10;
  sortBy?: keyof IActor | undefined;
  order?: 'asc' | 'desc' = 'asc';
  search?: string | undefined;
  constructor() {}
}
