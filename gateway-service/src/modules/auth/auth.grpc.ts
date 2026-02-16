import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  AuthServiceClient,
  AUTH_SERVICE_NAME,
  type RegistrationRequest,
  type RegistrationResponse,
} from '@noildm/contracts/dist/gen/auth';
@Injectable()
export class AuthClientGRPC implements OnModuleInit {
  private authService: AuthServiceClient;

  public constructor(@Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc) {}

  public onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  public registration(request: RegistrationRequest) {
    return this.authService.registration(request);
  }
}
