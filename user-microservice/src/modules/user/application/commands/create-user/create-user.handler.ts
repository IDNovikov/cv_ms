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
    const user = this.publisher.mergeObjectContext(UserAggregate.create(dto));

    const existingUser = await this.userRepository.findById(user.id);

    if (user.createdAt === existingUser?.createdAt) {
      throw new ConflictException(`User has created`);
    }
    const created = await this.userRepository.save(user);

    // const { created } = await this.userRepository.transaction(async (repo) => {
    //   return { created };
    // });

    user.commit();
    return created;
  }
}

