import { UpdateUserAuthorDTO } from '../dto/update-author-actor.dto';

export class UpdateUserAuthorCommand {
  constructor(public readonly dto: UpdateUserAuthorDTO) {}
}

