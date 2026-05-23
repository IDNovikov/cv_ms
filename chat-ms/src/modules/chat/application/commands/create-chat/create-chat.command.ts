import { CreateChatDto } from '../dto/create-chat.dto';

export class CreateChatCommand {
  constructor(public readonly dto: CreateChatDto) {}
}
