import { Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { ApiTags } from '@nestjs/swagger';
import { UseSwagger } from '../../../../common/decorators/swagger.decorator';
import { AuthSwagger } from './docs/authSwagger.docs';
import { FacadePort } from '../providers/facade/facade.port';
import { Roles } from '@/shared/decorators/roles.decorator';

@ApiTags('AdminAuth')
@Controller('admin')
export class AdminController {
  constructor(private facade: FacadePort) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('sessions/all')
  @UseSwagger(...AuthSwagger.AdminAllSessions)
  async getAllSessionsByAdmin() {
    return this.facade.getAllSessionsByAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('sessions/:userId')
  @UseSwagger(...AuthSwagger.AdminLogoutUserSessions)
  async logoutUsersSessionsByAdmin(@Param('userId', ParseIntPipe) userId: number) {
    return this.facade.logoutUserSessionsByAdmin(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('sessions/all')
  @UseSwagger(...AuthSwagger.AdminLogoutAllSessions)
  async logoutAllSessionsByAdmin() {
    return this.facade.logoutAllSessionsByAdmin();
  }
}
