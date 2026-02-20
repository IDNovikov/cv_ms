import { AuthAggregate } from '../../domain';

export interface Paginated<T extends string> {
  page: number;
  limit: number;
  sortBy?: T;
  order?: 'asc' | 'desc';
  search?: string;
}

export type TxFn<R, T> = (repo: R) => Promise<T>;
export abstract class AuthDBPort {
  abstract save(actor: AuthAggregate): Promise<AuthAggregate>;
  abstract findByIdOrEmail(
    selector: { id: string } | { email: string },
  ): Promise<AuthAggregate | null>;
  abstract findAll<T extends string>(
    dto: Paginated<T>,
  ): Promise<{ data: AuthAggregate[]; total: number }>;
  // abstract transaction<T>(fn: TxFn<ActorRepository, T>): Promise<T>;
}
