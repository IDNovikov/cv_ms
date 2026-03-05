import { Controller, Post } from '@nestjs/common';
import { UserFacade } from '../../application';

@Controller()
export class MSController {
  constructor(private readonly facade: UserFacade) {}

  @Post('create')
  async CreateUserCommand() {
    const created = await this.facade.commands.createUser({
      author: 'Ilya',
    });
    return created;
  }
}
