import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { ActorFacade } from '../application';

export const authFacadeFactory = (
  commandBus: CommandBus,
  queryBus: QueryBus,
  eventBus: EventBus,
) => new ActorFacade(commandBus, queryBus, eventBus);
