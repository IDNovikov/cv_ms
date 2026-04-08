import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { User } from '@noildm/contracts/dist/gen/user';
import { UserGqlEntity } from './models/user-gql.entity';
import { UserQueryDto } from '../dto/user-query.dto';
import { PaginatedUsers } from './response/response-with-pagination.gql';
import { CreateUserDto } from '../dto/create-user.dto';
import { FacadePort } from '../../providers/facade/facade.port';

function mapUserToGql(user: User | undefined): UserGqlEntity {
  const unsafeUser = (user ?? {}) as User & Record<string, unknown>;

  return {
    id: Number(unsafeUser.id ?? 0),
    email: String(unsafeUser.email ?? ''),
    userName: String(unsafeUser.userName ?? ''),
    telegramId: unsafeUser.telegramId ? String(unsafeUser.telegramId) : null,
    userImage: unsafeUser.userImage ? String(unsafeUser.userImage) : null,
    role: String(unsafeUser.role ?? 'USER') as UserGqlEntity['role'],
    status: String(unsafeUser.status ?? 'ACTIVE') as UserGqlEntity['status'],
    createdAt: new Date(Number(unsafeUser.createdAt ?? Date.now())),
    updatedAt: new Date(Number(unsafeUser.updatedAt ?? Date.now())),
  };
}

@Resolver(() => UserGqlEntity)
export class UserResolver {
  constructor(private readonly userFacade: FacadePort) {}

  @Query(() => UserGqlEntity, { nullable: true })
  async user(@Args('id', { type: () => Int }) id: number) {
    const { user } = await this.userFacade.getUserById({ id: String(id) });
    return user ? mapUserToGql(user) : null;
  }

  @Query(() => PaginatedUsers)
  async users(@Args('query') query: UserQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const result = await this.userFacade.listUsers({
      page,
      limit,
      sortBy: query.sortBy ?? 'createdAt',
      order: query.order ?? 'desc',
      search: query.search ?? '',
    });

    return {
      data: result.items.map((user) => mapUserToGql(user)),
      total: result.total,
      limit: result.limit,
      offset: (result.page - 1) * result.limit,
    };
  }

  @Mutation(() => UserGqlEntity)
  async createUser(@Args('input') input: CreateUserDto) {
    const { user } = await this.userFacade.createUser({
      email: input.email,
      userName: input.userName,
      telegramId: '',
      userImage: '',
    });

    return mapUserToGql(user);
  }

  @Mutation(() => UserGqlEntity, { nullable: true })
  async removeUser(@Args('id', { type: () => Int }) id: number) {
    const current = await this.userFacade.getUserById({ id: String(id) });
    await this.userFacade.deleteUser({ id: String(id) });
    return current.user ? mapUserToGql(current.user) : null;
  }
}
