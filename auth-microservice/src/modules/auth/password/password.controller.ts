import { Controller } from '@nestjs/common';
import { ChangePassDto } from './dto/changePass.dto';
import { GetTempPassDto } from './dto/getTempPass.dto';
import { PasswordFacade } from './password.facade';

@Controller()
export class PasswordController {
  constructor(private facade: PasswordFacade) {}
  async changePass(dto: ChangePassDto, user: { authId: string }) {
    return this.facade.changePassword(user.authId, dto);
  }

  async getTempPass(dto: GetTempPassDto) {
    return this.facade.getTempPass(dto.email);
  }
}
