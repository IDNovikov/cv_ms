import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { UserFacade } from '../application';

export const UserFacadeFactory = (
  commandBus: CommandBus,
  queryBus: QueryBus,
  eventBus: EventBus,
) => new UserFacade(commandBus, queryBus, eventBus);
