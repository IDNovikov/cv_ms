import { UpdateUserDTO } from '../dto/update-user.dto';

export class UpdateUserCommand {
  constructor(public readonly dto: UpdateUserDTO) {}
}

