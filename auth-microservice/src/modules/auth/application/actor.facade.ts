import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateActorDTO } from './commands/dto/create-actor.dto';
import { CreateActorCommand } from './commands/create-actor/create-actor.command';
import { ActorAggregate } from '../domain';
import { UpdateAuthorActorDTO } from './commands/dto/update-author-actor.dto';
import { UpdateActorAuthCommand } from './commands/update-author-actor/update-author-actor.command';
import { GetActorQuery } from './queries/get-actor/get-actor-query.command';
import { GetPaginatedActor } from './queries/dto/get-actors-query.dto';
import { GetActorsQuery } from './queries/get-all-actors/get-actors-query.command';

@Injectable()
export class ActorFacade {
  constructor(
    private readonly CommandBus: CommandBus,
    private readonly QueryBus: QueryBus,
    private readonly EventBus: EventBus,
  ) {}

  commands = {
    createActor: (actor: CreateActorDTO) => this.createActor(actor),
    updateAuthorActor: (dto: UpdateAuthorActorDTO) =>
      this.updateAuthorActor(dto),
  };

  queries = {
    getActorById: (id: string) => this.getActorById(id),
    getPaginatedActors: (dto: GetPaginatedActor) =>
      this.getPaginatedActors(dto),
  };

  private createActor(actor: CreateActorDTO) {
    return this.CommandBus.execute<CreateActorCommand, ActorAggregate>(
      new CreateActorCommand(actor),
    );
  }

  private updateAuthorActor(dto: UpdateAuthorActorDTO) {
    return this.CommandBus.execute<UpdateActorAuthCommand, ActorAggregate>(
      new UpdateActorAuthCommand(dto),
    );
  }

  private getActorById(id: string) {
    return this.QueryBus.execute<GetActorQuery, ActorAggregate>(
      new GetActorQuery(id),
    );
  }

  private getPaginatedActors(dto: GetPaginatedActor) {
    return this.QueryBus.execute<
      GetActorsQuery,
      { data: ActorAggregate[]; total: number }
    >(new GetActorsQuery(dto));
  }
}
