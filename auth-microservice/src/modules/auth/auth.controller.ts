import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AUTH_SERVICE_NAME,
  type RegistrationRequest,
  type RegistrationResponse,
} from '@noildm/contracts/dist/gen/auth';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'registration')
  public async registration(
    data: RegistrationRequest,
  ): Promise<RegistrationResponse> {
    console.log('Incoming grpc request', data);
    return {
      email: 'tits',
      expiresTime: 111,
      message: 'tits',
    };
  }
}
