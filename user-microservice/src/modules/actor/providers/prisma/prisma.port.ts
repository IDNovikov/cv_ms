import { ActorAggregate } from '../../domain';

export interface Paginated<T extends string> {
  page: number;
  limit: number;
  sortBy?: T;
  order?: 'asc' | 'desc';
  search?: string;
}

export type TxFn<R, T> = (repo: R) => Promise<T>;
export abstract class ActorDBPort {
  abstract save(actor: ActorAggregate): Promise<ActorAggregate>;
  abstract findById(id: string): Promise<ActorAggregate | null>;
  abstract findAll<T extends string>(
    dto: Paginated<T>,
  ): Promise<{ data: ActorAggregate[]; total: number }>;
  // abstract transaction<T>(fn: TxFn<ActorRepository, T>): Promise<T>;
}
