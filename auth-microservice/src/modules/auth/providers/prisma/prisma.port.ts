import { AuthAggregate } from '../../domain/auth.aggregate';

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
  abstract update(
    id: string,
    {
      isEmailVerified,
      password,
    }: { isEmailVerified?: boolean; password?: string },
  ): Promise<AuthAggregate | null>;
  abstract findById(id: string): Promise<AuthAggregate | null>;
  abstract findAll<T extends string>(
    dto: Paginated<T>,
  ): Promise<{ data: AuthAggregate[]; total: number }>;
  abstract findByEmail(email: string): Promise<AuthAggregate | null>;
}
