import { Controller, Delete, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { DeleteSessionDTO } from './DTO/requests/deleteSession.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthSwagger } from './docs/authSwagger.docs';
import { UseSwagger } from '../../../common/decorators/swagger.decorator';
import { FacadePort } from '../providers/facade/facade.port';
import { RefreshToken } from '@/shared/decorators/refreshToken.decorator';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private facade: FacadePort) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  @UseSwagger(...AuthSwagger.GetUserSessions)
  async getUserSessions(@RefreshToken() token: string) {
    return this.facade.getUserSessions(token);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @UseSwagger(...AuthSwagger.DeleteSession)
  async logoutSession(@RefreshToken() token: string, @Query() params: DeleteSessionDTO) {
    return this.facade.logoutSession(token, params.deviceId);
  }
}
