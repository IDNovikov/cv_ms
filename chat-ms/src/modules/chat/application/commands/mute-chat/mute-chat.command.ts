import { MuteChatDto } from '../dto/mute-chat.dto';

export class MuteChatCommand {
  constructor(public readonly dto: MuteChatDto) {}
}
