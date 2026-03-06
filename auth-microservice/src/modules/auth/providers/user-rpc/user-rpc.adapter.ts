import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserRPCData, UserRpcPort } from './user-rpc.port';
import {
  USER_SERVICE_NAME,
  UserServiceClient,
} from '@noildm/contracts/dist/gen/user';
import type { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class UserRpcAdapter extends UserRpcPort implements OnModuleInit {
  private userService: UserServiceClient;

  public constructor(
    @Inject(USER_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {
    super();
  }
  public onModuleInit() {
    this.userService =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  async getUserByName(userName: string): Promise<UserRPCData | null> {
    return this.userService.getUserByUserName({ userName }) ?? null;
  }

  async getUserById(id: string): Promise<UserRPCData | null> {
    return this.userService.get(id) ?? null;
  }

  async createUser({
    userName,
  }: {
    userName: string;
  }): Promise<UserRPCData | null> {
    const existed = this.userService.get(userName);
    if (existed) return existed;

    this.userService.set(userName, user);

    return user;
  }
}
