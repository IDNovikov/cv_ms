import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  AuthServiceClient,
  AUTH_SERVICE_NAME,
  type RegistrationRequest,
  type RegistrationResponse,
} from '@noildm/contracts/dist/gen/auth';
import {
  TestServiceClient,
  TEST_SERVICE_NAME,
  type TestRequest,
  type TestResponse,
} from '@noildm/contracts/dist/gen/test';

@Injectable()
export class AuthClientGRPC implements OnModuleInit {
  private authService: TestServiceClient;

  public constructor(@Inject(TEST_SERVICE_NAME) private readonly client: ClientGrpc) {}

  public onModuleInit() {
    this.authService = this.client.getService<TestServiceClient>('TestService');
  }

  // public registration(request: RegistrationRequest) {
  //   return this.authService.registration(request);
  // }

  public test(request: TestRequest) {
    return this.authService.test(request);
  }
}
////
