import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserFacade } from '../application';

export const UserFacadeFactory = (commandBus: CommandBus, queryBus: QueryBus) =>
  new UserFacade(commandBus, queryBus);
