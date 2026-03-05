import { Controller, Delete, Get, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthFacade } from './auth.facade';
import type { ISessionData } from '../shared/types/session.types';

@Controller('auth')
export class AuthController {
  constructor(private facade: AuthFacade) {}

  @Post('login')
  async login(dto: LoginDto, sessionData: ISessionData, token: string) {
    return this.facade.login(dto, token, sessionData);
  }

  @Get('refresh-tokens')
  async refresh(token: string, sessionData: ISessionData) {
    return this.facade.refreshTokens(token, sessionData);
  }

  @Delete('logout')
  async logout(token: string, user: { jti: string }) {
    return this.facade.logout(token, user.jti);
  }
}
