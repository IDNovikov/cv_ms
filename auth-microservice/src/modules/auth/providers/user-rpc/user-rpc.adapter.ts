import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { UserRpcPort } from './user-rpc.port';
import {
  CreateUserRequest,
  GetUserByIdRequest,
  GetUserByUserNameRequest,
  UpdateUserRequest,
  USER_SERVICE_NAME,
  UserResponse,
  UserServiceClient,
} from '@noildm/contracts/dist/gen/user';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserRpcAdapter extends UserRpcPort implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@Inject(USER_SERVICE_NAME) private readonly client: ClientGrpc) {
    super();
  }

  onModuleInit() {
    this.userService =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  async getUserByUserName(
    req: GetUserByUserNameRequest,
  ): Promise<UserResponse> {
    return firstValueFrom(this.userService.getUserByUserName(req));
  }

  async getUserById(req: GetUserByIdRequest): Promise<UserResponse> {
    return firstValueFrom(this.userService.getUserById(req));
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return firstValueFrom(this.userService.createUser(data));
  }

  async updateUser(data: UpdateUserRequest): Promise<UserResponse> {
    return firstValueFrom(this.userService.updateUser(data));
  }
}
