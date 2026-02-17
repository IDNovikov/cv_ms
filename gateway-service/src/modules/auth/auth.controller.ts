import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthClientGRPC } from './auth.grpc';
import { RegistrationUserDTO } from './DTO/requests/registrate-user.dto';

@Controller('auth')
export class AuthController {
  public constructor(private readonly client: AuthClientGRPC) {}
  // @Post('registration')
  // @HttpCode(HttpStatus.OK)
  // public async registration(@Body() dto: RegistrationUserDTO) {
  //   return this.client.registration(dto);
  // }

  @Post('test')
  public async test(@Body() dto: { testRequest: string }) {
    console.log(dto);
    return this.client.test(dto);
  }
}
//
