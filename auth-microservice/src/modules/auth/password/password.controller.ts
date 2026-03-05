import { Controller, Post, Put } from '@nestjs/common';
import { ChangePassDto } from './dto/changePass.dto';
import { GetTempPassDto } from './dto/getTempPass.dto';
import { PasswordFacade } from './password.facade';

@Controller('password')
export class PasswordController {
  constructor(private facade: PasswordFacade) {}
  @Put('change')
  async changePass(dto: ChangePassDto, user: { sub: string }) {
    return this.facade.changePassword(user.sub, dto);
  }

  @Post('forgot')
  async getTempPass(dto: GetTempPassDto) {
    return this.facade.getTempPass(dto.email);
  }
}
