import { CreateActorDTO } from '../dto/create-actor.dto';

export class CreateActorCommand {
  constructor(public readonly dto: CreateActorDTO) {}
}
