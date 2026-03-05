import { UserAggregate } from '../../domain';

export interface Paginated<T extends string> {
  page: number;
  limit: number;
  sortBy?: T;
  order?: 'asc' | 'desc';
  search?: string;
}

export type TxFn<R, T> = (repo: R) => Promise<T>;
export abstract class UserDBPort {
  abstract save(actor: UserAggregate): Promise<UserAggregate>;
  abstract findById(id: string): Promise<UserAggregate | null>;
  abstract findAll<T extends string>(
    dto: Paginated<T>,
  ): Promise<{ data: UserAggregate[]; total: number }>;
  // abstract transaction<T>(fn: TxFn<userRepository, T>): Promise<T>;
}

