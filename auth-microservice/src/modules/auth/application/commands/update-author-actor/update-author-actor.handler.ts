import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActorAggregate } from 'src/modules/actor/domain';

import { UpdateActorAuthCommand } from './update-author-actor.command';
import { ActorDBPort } from 'src/modules/actor/providers';

@CommandHandler(UpdateActorAuthCommand)
export class CreateActorHandler implements ICommandHandler<
  UpdateActorAuthCommand,
  ActorAggregate
> {
  constructor(private readonly actorRepository: ActorDBPort) {}

  async execute({ dto }: UpdateActorAuthCommand): Promise<ActorAggregate> {
    const actor = ActorAggregate.create(dto);
    actor.updateAuthor(dto.author);
    return await this.actorRepository.save(actor);
  }
}
