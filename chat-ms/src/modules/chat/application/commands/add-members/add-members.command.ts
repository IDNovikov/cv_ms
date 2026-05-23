import { AddMembersDto } from '../dto/add-members.dto';

export class AddMembersCommand {
  constructor(public readonly dto: AddMembersDto) {}
}
