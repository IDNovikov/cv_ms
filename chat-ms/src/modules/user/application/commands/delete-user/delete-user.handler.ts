import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDBPort } from 'src/modules/user/providers';
import { DeleteUserCommand } from './delete-user.command';
import { NotFoundAppError } from 'src/common/errors';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, boolean> {
  constructor(private readonly userRepository: UserDBPort) {}

  async execute({ id }: DeleteUserCommand): Promise<boolean> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundAppError('User', { id });
    }

    return true;
  }
}
