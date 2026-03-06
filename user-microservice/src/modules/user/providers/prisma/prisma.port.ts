import { UserAggregate } from '../../domain';

export type UserSortField = 'createdAt' | 'updatedAt' | 'userName';
export type SortOrder = 'asc' | 'desc';

export interface Paginated {
  page: number;
  limit: number;
  sortBy?: UserSortField;
  order?: SortOrder;
  search?: string;
}

export type CreateUserData = {
  userName: string;
  telegramId?: string | null;
  userImage?: string | null;
};

export type UpdateUserData = {
  id: string;
  userName?: string;
  telegramId?: string | null;
  userImage?: string | null;
};

export abstract class UserDBPort {
  abstract save(user: UserAggregate): Promise<UserAggregate>;
  abstract findById(id: string): Promise<UserAggregate | null>;
  abstract findByUserName(userName: string): Promise<UserAggregate | null>;
  abstract findAll(
    dto: Paginated,
  ): Promise<{ data: UserAggregate[]; total: number }>;
  abstract delete(id: string): Promise<boolean>;
}
