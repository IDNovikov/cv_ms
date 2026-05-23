import { ListMessagesDto } from '../dto/list-messages.dto';

export class ListMessagesQuery {
  constructor(public readonly dto: ListMessagesDto) {}
}
