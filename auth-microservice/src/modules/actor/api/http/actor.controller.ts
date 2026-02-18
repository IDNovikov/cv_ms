import { Controller, Post } from '@nestjs/common';
import { ActorFacade } from '../../application';

@Controller()
export class MSController {
  constructor(private readonly actorFacade: ActorFacade) {}

  @Post('create')
  async CreateActorCommand() {
    const created = await this.actorFacade.commands.createActor({
      author: 'Ilya',
    });
    return created;
  }
}
