import {
  CreateUserRequest,
  DeleteUserRequest,
  DeleteUserResponse,
  GetUserByIdRequest,
  GetUserByUserNameRequest,
  ListUsersRequest,
  ListUsersResponse,
  UpdateUserRequest,
  UserResponse,
} from '@noildm/contracts/dist/gen/user';

export abstract class FacadePort {
  abstract createUser(request: CreateUserRequest): Promise<UserResponse>;
  abstract getUserById(request: GetUserByIdRequest): Promise<UserResponse>;
  abstract getUserByUserName(request: GetUserByUserNameRequest): Promise<UserResponse>;
  abstract listUsers(request: ListUsersRequest): Promise<ListUsersResponse>;
  abstract updateUser(request: UpdateUserRequest): Promise<UserResponse>;
  abstract deleteUser(request: DeleteUserRequest): Promise<DeleteUserResponse>;
}
