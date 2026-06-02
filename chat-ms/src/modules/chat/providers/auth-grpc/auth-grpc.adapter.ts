import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AuthGrpcPort } from './auth-grpc.port';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AUTH_SERVICE_NAME,
  AuthDataResponse,
  AuthServiceClient,
  GetAuthDataByUserIdRequest,
} from '@noildm/contracts/dist/gen/auth';

@Injectable()
export class FacadeAdapter implements OnModuleInit, AuthGrpcPort {
  private authService: AuthServiceClient;
  public constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}
  public getAuthById(
    request: GetAuthDataByUserIdRequest,
  ): Promise<AuthDataResponse> {
    return firstValueFrom(this.authService.getAuthDataByUserId(request));
  }
  public onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }
}
