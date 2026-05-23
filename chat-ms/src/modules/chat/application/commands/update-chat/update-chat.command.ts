import { UpdateChatDTO } from '../dto/update-chat.dto';

export class UpdateChatCommand {
  constructor(public readonly dto: UpdateChatDTO) {}
}
