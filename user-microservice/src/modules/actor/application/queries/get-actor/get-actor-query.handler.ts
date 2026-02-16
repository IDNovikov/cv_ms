import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GetActorQuery } from './get-actor-query.command';
import { ActorAggregate } from 'src/modules/actor/domain';
import { ActorDBPort } from 'src/modules/actor/providers';

@QueryHandler(GetActorQuery)
export class GetActorQueryHandler implements IQueryHandler<
  GetActorQuery,
  ActorAggregate
> {
  private readonly logger = new Logger(GetActorQueryHandler.name);
  constructor(private readonly actorRepository: ActorDBPort) {}

  async execute({ id }: GetActorQuery): Promise<ActorAggregate> {
    const existUser = await this.actorRepository.findById(id).catch((err) => {
      this.logger.error(err);
      throw new HttpException(
        'Error with repostitory',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
    if (!existUser) {
      throw new BadRequestException(`Actor by id ${id} is not found`);
    }
    return existUser;
  }
}
