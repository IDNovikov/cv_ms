import { GetChatMembersDto } from '../dto/get-chat-members.dto';

export class GetChatMembersQuery {
  constructor(public readonly dto: GetChatMembersDto) {}
}
