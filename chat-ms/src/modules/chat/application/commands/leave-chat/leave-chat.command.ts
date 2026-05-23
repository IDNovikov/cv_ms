import { LeaveChatDto } from '../dto/leave-chat.dto';

export class LeaveChatCommand {
  constructor(public readonly dto: LeaveChatDto) {}
}
