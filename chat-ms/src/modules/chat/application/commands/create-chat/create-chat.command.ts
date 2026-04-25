import { CreateChatDto } from './create-chat.dto';

export class CreateChatCommand {
  constructor(public readonly dto: CreateChatDto) {}
}
