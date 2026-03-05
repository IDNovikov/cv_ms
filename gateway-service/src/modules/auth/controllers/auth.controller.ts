import { Body, Controller, Delete, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { CookieInterceptor } from '@/common/interceptors/cookie.interceptor';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { User } from '@/common/decorators/userRefreshToken.decorator';
import { RefreshJwtAuthGuard } from '@/shared/guards/refresh-jwt-auth.guard';
import { LoginDto } from './DTO/requests/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { UseSwagger } from '../../../common/decorators/swagger.decorator';
import { AuthSwagger } from './docs/authSwagger.docs';
import { FacadePort } from '../providers/facade/facade.port';
import { SessionDataDto } from './DTO';
import { Throttle } from '@nestjs/throttler';
import { SessionData } from '@/shared/decorators/sessionData.decorator';
import { RefreshToken } from '@/shared/decorators/refreshToken.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private facade: FacadePort) {}

  @UseInterceptors(CookieInterceptor)
  @Throttle({
    default: {
      limit: 5,
      ttl: 180,
    },
  })
  @Post('login')
  @UseSwagger(...AuthSwagger.Login)
  async login(
    @Body() dto: LoginDto,
    @SessionData() sessionData: SessionDataDto,
    @RefreshToken() token: string,
  ) {
    return this.facade.login(dto, token, sessionData);
  }

  @UseInterceptors(CookieInterceptor)
  @Get('refresh-tokens')
  @UseGuards(RefreshJwtAuthGuard)
  @UseSwagger(...AuthSwagger.RefreshTokens)
  async refresh(@RefreshToken() token: string, @SessionData() sessionData: SessionDataDto) {
    return this.facade.refreshTokens(token, sessionData);
  }

  @UseInterceptors(CookieInterceptor)
  @Delete('logout')
  @UseSwagger(...AuthSwagger.Logout)
  @UseGuards(JwtAuthGuard)
  async logout(@RefreshToken() token: string, @User() user: { jti?: string } | undefined) {
    const jti = user?.jti ?? '';
    return this.facade.logout(token, jti);
  }
}
