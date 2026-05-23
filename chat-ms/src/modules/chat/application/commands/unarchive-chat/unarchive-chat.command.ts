import { UnarchiveChatDto } from '../dto/unarchive-chat.dto';

export class UnarchiveChatCommand {
  constructor(public readonly dto: UnarchiveChatDto) {}
}
