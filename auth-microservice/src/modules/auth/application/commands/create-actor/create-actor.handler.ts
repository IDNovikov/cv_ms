import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateActorCommand } from './create-actor.command';
import { ActorAggregate } from 'src/modules/actor/domain';
import { ConflictException } from '@nestjs/common';
import { ActorDBPort } from 'src/modules/actor/providers';

@CommandHandler(CreateActorCommand)
export class CreateActorHandler implements ICommandHandler<
  CreateActorCommand,
  ActorAggregate
> {
  constructor(
    private readonly actorRepository: ActorDBPort,
    private readonly publisher: EventPublisher,
  ) {}

  async execute({ dto }: CreateActorCommand): Promise<ActorAggregate> {
    const actor = this.publisher.mergeObjectContext(ActorAggregate.create(dto));

    const existingActor = await this.actorRepository.findById(actor.id);

    if (actor.createdAt === existingActor?.createdAt) {
      throw new ConflictException(`Actor has created`);
    }
    const created = await this.actorRepository.save(actor);

    // const { created } = await this.actorRepository.transaction(async (repo) => {
    //   return { created };
    // });

    actor.commit();
    return created;
  }
}
