import { RemoveMemberDto } from '../dto/remove-member.dto';

export class RemoveMemberCommand {
  constructor(public readonly dto: RemoveMemberDto) {}
}
