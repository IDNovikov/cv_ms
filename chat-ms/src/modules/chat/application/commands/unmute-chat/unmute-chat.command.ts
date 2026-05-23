import { UnmuteChatDto } from '../dto/unmute-chat.dto';

export class UnmuteChatCommand {
  constructor(public readonly dto: UnmuteChatDto) {}
}
