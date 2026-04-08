import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { User } from '@/common/decorators/userRefreshToken.decorator';
import { ChangePassDto } from '../DTO/requests/changePass.dto';
import { GetTempPassDto } from '../DTO/requests/getTempPass.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthSwagger } from '../docs/authSwagger.docs';
import { UseSwagger } from '../../../../../common/decorators/swagger.decorator';
import { FacadePort } from '../../providers/facade/facade.port';

@ApiTags('Password')
@Controller('password')
export class PasswordController {
  constructor(private facade: FacadePort) {}
  @Put('change')
  @UseGuards(JwtAuthGuard)
  @UseSwagger(...AuthSwagger.ChangePass)
  async changePass(
    @Body() dto: ChangePassDto,
    @User() user: { authId?: number | string } | undefined,
  ) {
    const authId = user?.authId ?? '';
    return this.facade.changePassword(authId, dto);
  }

  @Post('forgot')
  @UseSwagger(...AuthSwagger.ForgotPass)
  async getTempPass(@Body() dto: GetTempPassDto) {
    return this.facade.getTempPass(dto.email);
  }
}
