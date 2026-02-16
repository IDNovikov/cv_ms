import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GetActorsQuery } from './get-actors-query.command';
import { ActorAggregate } from 'src/modules/actor/domain';
import { ActorDBPort } from 'src/modules/actor/providers';

@QueryHandler(GetActorsQuery)
export class GetActorsQueryHandler implements IQueryHandler<
  GetActorsQuery,
  {
    data: ActorAggregate[];
    total: number;
  }
> {
  private readonly logger = new Logger(GetActorsQueryHandler.name);
  constructor(private readonly actorRepository: ActorDBPort) {}

  async execute({ dto }: GetActorsQuery): Promise<{
    data: ActorAggregate[];
    total: number;
  }> {
    const { data, total } = await this.actorRepository
      .findAll(dto)
      .catch((err) => {
        this.logger.error(err);
        throw new HttpException(
          'Error with repostitory',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    if (!data.length) {
      throw new BadRequestException(`No one is not found`);
    }
    return { data, total };
  }
}
