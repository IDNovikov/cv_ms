import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GetUserQuery } from './get-actor-query.command';
import { UserAggregate } from 'src/modules/user/domain';
import { UserDBPort, RedisServicePort } from 'src/modules/user/providers';

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<
  GetUserQuery,
  UserAggregate
> {
  private readonly logger = new Logger(GetUserQueryHandler.name);
  constructor(
    private readonly userRepository: UserDBPort,
    private readonly redis: RedisServicePort,
  ) {}

  async execute({ id }: GetUserQuery): Promise<UserAggregate> {
    const existUser = await this.userRepository.findById(id).catch((err) => {
      this.logger.error(err);
      throw new HttpException(
        'Error with repostitory',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
    if (!existUser) {
      throw new BadRequestException(`User by id ${id} is not found`);
    }
    return existUser;
  }
}

