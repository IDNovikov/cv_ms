import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UserAggregate } from 'src/modules/user/domain';
import { UserDBPort } from 'src/modules/user/providers';
import { UpdateUserCommand } from './update-author-actor.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, UserAggregate> {
  constructor(private readonly userRepository: UserDBPort) {}

  async execute({ dto }: UpdateUserCommand): Promise<UserAggregate> {
    const existed = await this.userRepository.findById(dto.id);
    if (!existed) {
      throw new NotFoundException(`User by id "${dto.id}" not found`);
    }

    existed.update({
      userName: dto.userName,
      telegramId: dto.telegramId,
      userImage: dto.userImage,
    });
    return this.userRepository.save(existed);
  }
}
