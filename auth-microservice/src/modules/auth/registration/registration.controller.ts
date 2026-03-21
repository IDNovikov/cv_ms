import { Body, Controller, Post } from '@nestjs/common';
import { RegistrateDto } from './dto/registrate.dto';
import { VerifyDto } from './dto/verify.dto';
import { EmailDto } from './dto/email.dto';
import { RegistrationFacade } from './registration.facade';
import type { ISessionData } from '../shared/types/session.types';

@Controller()
export class RegistrationController {
  constructor(private facade: RegistrationFacade) {}

  async registrate(@Body() dto: RegistrateDto) {
    return this.facade.registrate(dto);
  }

  async verify(
    @Body() dto: VerifyDto,
    @Body('sessionData') sessionData: ISessionData,
  ) {
    return this.facade.verifyEmail(dto, sessionData);
  }

  async getNewVerificationCode(@Body() dto: EmailDto) {
    return this.facade.getNewVerificationCode(dto.email);
  }
}
