import { ArchiveChatDto } from '../dto/archive-chat.dto';

export class ArchiveChatCommand {
  constructor(public readonly dto: ArchiveChatDto) {}
}
