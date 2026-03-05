import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserAggregate } from 'src/modules/user/domain';

import { UpdateUserAuthorCommand } from './update-author-actor.command';
import { UserDBPort } from 'src/modules/user/providers';

@CommandHandler(UpdateUserAuthorCommand)
export class CreateUserHandler implements ICommandHandler<
  UpdateUserAuthorCommand,
  UserAggregate
> {
  constructor(private readonly userRepository: UserDBPort) {}

  async execute({ dto }: UpdateUserAuthorCommand): Promise<UserAggregate> {
    const actor = UserAggregate.create(dto);
    actor.updateAuthor(dto.author);
    return await this.userRepository.save(actor);
  }
}

