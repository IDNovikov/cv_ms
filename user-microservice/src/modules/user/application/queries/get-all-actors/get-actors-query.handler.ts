import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GetUsersQuery } from './get-actors-query.command';
import { UserAggregate } from 'src/modules/user/domain';
import { UserDBPort, RedisServicePort } from 'src/modules/user/providers';

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler implements IQueryHandler<
  GetUsersQuery,
  {
    data: UserAggregate[];
    total: number;
  }
> {
  private readonly logger = new Logger(GetUsersQueryHandler.name);
  constructor(
    private readonly userRepository: UserDBPort,
    private readonly redis: RedisServicePort,
  ) {}

  async execute({ dto }: GetUsersQuery): Promise<{
    data: UserAggregate[];
    total: number;
  }> {
    const { data, total } = await this.userRepository
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

