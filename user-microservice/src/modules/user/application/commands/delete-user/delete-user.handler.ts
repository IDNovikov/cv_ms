import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UserDBPort } from 'src/modules/user/providers';
import { DeleteUserCommand } from './delete-user.command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, boolean> {
  constructor(private readonly userRepository: UserDBPort) {}

  async execute({ id }: DeleteUserCommand): Promise<boolean> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User by id "${id}" not found`);
    }

    return true;
  }
}
