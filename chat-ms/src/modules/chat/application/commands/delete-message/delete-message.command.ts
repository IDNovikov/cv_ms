import { DeleteMessageDto } from '../dto/delete-message.dto';

export class DeleteMessageCommand {
  constructor(public readonly dto: DeleteMessageDto) {}
}
