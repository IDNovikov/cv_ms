import { GetChatDTO } from '../dto/get-chat.dto';

export class GetChatQuery {
  constructor(public readonly dto: GetChatDTO) {}
}
