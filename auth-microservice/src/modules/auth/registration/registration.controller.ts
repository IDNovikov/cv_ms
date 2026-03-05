import { Controller, Post } from '@nestjs/common';
import { RegistrateDto } from './dto/registrate.dto';
import { VerifyDto } from './dto/verify.dto';
import { EmailDto } from './dto/email.dto';
import { RegistrationFacade } from './registration.facade';
import { ISessionData } from '../shared/types/session.types';

@Controller('registration')
export class RegistrationController {
  constructor(private facade: RegistrationFacade) {}

  @Post()
  async registrate(dto: RegistrateDto) {
    return this.facade.registrate(dto);
  }

  @Post('email/verify')
  async verify(dto: VerifyDto, sessionData: ISessionData) {
    return this.facade.verifyEmail(dto, sessionData);
  }

  @Post('email/new-code')
  async getNewVerificationCode(dto: EmailDto) {
    return this.facade.getNewVerificationCode(dto.email);
  }
}
