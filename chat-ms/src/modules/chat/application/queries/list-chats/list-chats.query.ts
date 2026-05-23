import { ListChatsDto } from '../dto/list-chats.dto';

export class ListChatsQuery {
  constructor(public readonly dto: ListChatsDto) {}
}
