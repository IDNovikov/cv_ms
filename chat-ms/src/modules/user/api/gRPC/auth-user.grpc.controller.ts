import { Controller } from '@nestjs/common';
import {
  CreateUserRequest,
  DeleteUserRequest,
  DeleteUserResponse,
  GetUserByIdRequest,
  GetUserByUserNameRequest,
  ListUsersRequest,
  ListUsersResponse,
  UpdateUserRequest,
  User,
  UserResponse,
  UserServiceController,
  UserServiceControllerMethods,
} from '@noildm/contracts/dist/gen/user';
import { UserFacade } from '../../application';
import { GetUsersQueryDto } from '../../application/queries/dto/get-users-query.dto';
import { UserAggregate } from '../../domain';

@Controller()
@UserServiceControllerMethods()
export class UserGrpcController implements UserServiceController {
  constructor(private readonly facade: UserFacade) {}

  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    const user = await this.facade.commands.createUser({
      email: request.email,
      userName: request.userName,
      telegramId: request.telegramId || null,
      userImage: request.userImage || null,
    });

    return { user: this.toGrpcUser(user) };
  }

  async getUserById(request: GetUserByIdRequest): Promise<UserResponse> {
    const user = await this.facade.queries.getUserById(request.id);
    return { user: this.toGrpcUser(user) };
  }

  async getUserByUserName(
    request: GetUserByUserNameRequest,
  ): Promise<UserResponse> {
    const user = await this.facade.queries.getUserByUserName(request.userName);
    return { user: this.toGrpcUser(user) };
  }

  async listUsers(request: ListUsersRequest): Promise<ListUsersResponse> {
    const dto: GetUsersQueryDto = {
      page: request.page || 1,
      limit: request.limit || 10,
      sortBy: this.parseSortBy(request.sortBy),
      order: request.order === 'asc' ? 'asc' : 'desc',
      search: request.search || undefined,
    };

    const { data, total } = await this.facade.queries.getPaginatedUsers(dto);

    return {
      items: data.map((user) => this.toGrpcUser(user)),
      total,
      page: dto.page,
      limit: dto.limit,
    };
  }

  async updateUser(request: UpdateUserRequest): Promise<UserResponse> {
    const user = await this.facade.commands.updateUser({
      id: request.id,
      userName: request.userName || undefined,
      telegramId: this.emptyToNull(request.telegramId),
      userImage: this.emptyToNull(request.userImage),
    });

    return { user: this.toGrpcUser(user) };
  }

  async deleteUser(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    const deleted = await this.facade.commands.deleteUser(request.id);
    return { deleted };
  }

  private toGrpcUser(user: UserAggregate): User {
    return {
      id: user.id,
      userName: user.userName,
      telegramId: user.telegramId ?? '',
      userImage: user.userImage ?? '',
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };
  }

  private parseSortBy(value: string): GetUsersQueryDto['sortBy'] {
    if (value === 'userName') return 'userName';
    if (value === 'updatedAt') return 'updatedAt';
    return 'createdAt';
  }

  private emptyToNull(value: string | undefined): string | null {
    return value?.trim() ? value : null;
  }
}
