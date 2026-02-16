import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { ActorFacade } from '../application';

export const actorFacadeFactory = (
  commandBus: CommandBus,
  queryBus: QueryBus,
  eventBus: EventBus,
) => new ActorFacade(commandBus, queryBus, eventBus);
