import { UpdateAuthorActorDTO } from '../dto/update-author-actor.dto';

export class UpdateActorAuthCommand {
  constructor(public readonly dto: UpdateAuthorActorDTO) {}
}
