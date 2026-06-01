import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { UserGrpcPort } from './user-grpc.port';
import {
  GetUserByIdRequest,
  USER_SERVICE_NAME,
  UserServiceClient,
} from '@noildm/contracts/dist/gen/user';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FacadeAdapter implements OnModuleInit, UserGrpcPort {
  private userService: UserServiceClient;
  public constructor(
    @Inject(USER_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}
  public onModuleInit() {
    this.userService =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }
  public getUserById(request: GetUserByIdRequest) {
    return firstValueFrom(this.userService.getUserById(request));
  }
}
