import { Inject, Injectable } from '@nestjs/common';
import { PasswordService } from './password.service';

import { ChangePassDto } from './dto/changePass.dto';
import { RabbitServicePort } from '../providers/amqp/amqp.port';

@Injectable()
export class PasswordFacade {
  constructor(
    private readonly passwordService: PasswordService,
    private mail: RabbitServicePort,
  ) {}

  async changePassword(userId: string, dto: ChangePassDto) {
    const { oldPassword, newPassword } = dto;
    await this.passwordService.checkPasswords(userId, oldPassword, newPassword);
    await this.passwordService.updateAuthPassword(userId, newPassword);
    //TO DO: ADD REVOKE
    return { message: 'Password successfully changed.' };
  }

  async getTempPass(email: string) {
    await this.passwordService.isPasswordSend(email);
    const auth = await this.passwordService.getAuthByEmail(email);

    const tempPass = this.passwordService.generateNewPassword();
    await this.passwordService.updateAuthPassword(auth?.id, tempPass);
    await this.mail.AmqpSendMail({
      toEmail: email,
      subject: 'This is your еemporary password',
      text: `This is temporary password: ${tempPass}. Please, change it soon for ur securyti`,
    });
    return { message: 'Password successfully changed. Check your email' };
  }
}
