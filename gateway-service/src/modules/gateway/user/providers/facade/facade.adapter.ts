import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { FacadePort } from './facade.port';
import {
  CreateUserRequest,
  DeleteUserRequest,
  GetUserByIdRequest,
  GetUserByUserNameRequest,
  ListUsersRequest,
  UpdateUserRequest,
  USER_SERVICE_NAME,
  UserServiceClient,
} from '@noildm/contracts/dist/gen/user';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FacadeAdapter implements OnModuleInit, FacadePort {
  private userService: UserServiceClient;

  public constructor(@Inject(USER_SERVICE_NAME) private readonly client: ClientGrpc) {}

  public onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  public createUser(request: CreateUserRequest) {
    return firstValueFrom(this.userService.createUser(request));
  }

  public getUserById(request: GetUserByIdRequest) {
    return firstValueFrom(this.userService.getUserById(request));
  }

  public getUserByUserName(request: GetUserByUserNameRequest) {
    return firstValueFrom(this.userService.getUserByUserName(request));
  }

  public listUsers(request: ListUsersRequest) {
    return firstValueFrom(this.userService.listUsers(request));
  }

  public updateUser(request: UpdateUserRequest) {
    return firstValueFrom(this.userService.updateUser(request));
  }

  public deleteUser(request: DeleteUserRequest) {
    return firstValueFrom(this.userService.deleteUser(request));
  }
}
