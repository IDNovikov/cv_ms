import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserAggregate } from 'src/modules/user/domain';
import { UserDBPort } from 'src/modules/user/providers';
import { UpdateUserCommand } from './update-user.command';
import { NotFoundAppError } from 'src/common/errors';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<
  UpdateUserCommand,
  UserAggregate
> {
  constructor(private readonly userRepository: UserDBPort) {}

  async execute({ dto }: UpdateUserCommand): Promise<UserAggregate> {
    const existed = await this.userRepository.findById(dto.id);
    if (!existed) {
      throw new NotFoundAppError('User', { id: dto.id });
    }

    existed.update({
      email: dto.email,
      userName: dto.userName,
      telegramId: dto.telegramId,
      userImage: dto.userImage,
    });
    return this.userRepository.save(existed);
  }
}
