import {
  CreateUserRequest,
  GetUserByIdRequest,
  GetUserByUserNameRequest,
  UpdateUserRequest,
  UserResponse,
  UserServiceClient,
} from '@noildm/contracts/dist/gen/user';

export abstract class UserRpcPort {
  abstract getUserByUserName(
    userName: GetUserByUserNameRequest,
  ): Promise<UserResponse>;
  abstract getUserById(id: GetUserByIdRequest): Promise<UserResponse>;
  abstract updateUser(data: UpdateUserRequest): Promise<UserResponse>;
  abstract createUser(data: CreateUserRequest): Promise<UserResponse>;
}
