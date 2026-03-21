import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { CookieInterceptor } from '@/common/interceptors/cookie.interceptor';
import { RegistrateDto } from './DTO/requests/registrate.dto';
import { VerifyDto } from './DTO/requests/verify.dto';
import { EmailDto } from './DTO/requests/email.dto';
import { ApiTags } from '@nestjs/swagger';
import { UseSwagger } from '../../../../common/decorators/swagger.decorator';
import { AuthSwagger } from './docs/authSwagger.docs';
import { FacadePort } from '../providers/facade/facade.port';
import { SessionDataDto } from './DTO';
import { SessionData } from '@/shared/decorators/sessionData.decorator';

@ApiTags('Registration')
@Controller('registration')
export class RegistrationController {
  constructor(private facade: FacadePort) {}

  @Post()
  @UseSwagger(...AuthSwagger.Registrate)
  async registrate(@Body() dto: RegistrateDto) {
    return this.facade.registrate(dto);
  }

  @UseInterceptors(CookieInterceptor)
  @Post('email/verify')
  @UseSwagger(...AuthSwagger.VerifyEmail)
  async verify(@Body() dto: VerifyDto, @SessionData() sessionData: SessionDataDto) {
    return this.facade.verifyEmail(dto, sessionData);
  }

  @Post('email/new-code')
  @UseSwagger(...AuthSwagger.GetNewCode)
  async getNewVerificationCode(@Body() dto: EmailDto) {
    return this.facade.getNewVerificationCode(dto.email);
  }
}
