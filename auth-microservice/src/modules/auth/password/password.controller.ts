import { Controller } from '@nestjs/common';
import { ChangePassDto } from './dto/changePass.dto';
import { GetTempPassDto } from './dto/getTempPass.dto';
import { PasswordFacade } from './password.facade';

@Controller()
export class PasswordController {
  constructor(private facade: PasswordFacade) {}
  async changePass(dto: ChangePassDto, user: { sub: string }) {
    return this.facade.changePassword(user.sub, dto);
  }

  async getTempPass(dto: GetTempPassDto) {
    return this.facade.getTempPass(dto.email);
  }
}
