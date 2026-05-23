import { UpdateMessageDto } from '../dto/update-message.dto';

export class UpdateMessageCommand {
  constructor(public readonly dto: UpdateMessageDto) {}
}
