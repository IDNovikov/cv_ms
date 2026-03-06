import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { UserAggregate } from 'src/modules/user/domain';
import { ConflictException } from '@nestjs/common';
import { UserDBPort } from 'src/modules/user/providers';

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
      throw new ConflictException(
        `User with userName "${dto.userName}" already exists`,
      );
    }

    const user = this.publisher.mergeObjectContext(UserAggregate.create(dto));
    const created = await this.userRepository.save(user);

    user.commit();
    return created;
  }
}

