import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { UserAggregate } from 'src/modules/user/domain';
import { UserDBPort } from 'src/modules/user/providers';
import { ConflictAppError } from 'src/common/errors';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  UserAggregate
> {
  constructor(
    private readonly userRepository: UserDBPort,
    private readonly publisher: EventPublisher,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<UserAggregate> {
    const existingUser = await this.userRepository.findByUserName(dto.userName);
    if (existingUser) {
      throw new ConflictAppError('User', { userName: dto.userName });
    }

    const user = this.publisher.mergeObjectContext(UserAggregate.create(dto));
    const created = await this.userRepository.save(user);

    user.commit();
    return created;
  }
}

