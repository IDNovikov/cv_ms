import { SendMessageDto } from '../dto/send-message.dto';

export class SendMessageCommand {
  constructor(public readonly dto: SendMessageDto) {}
}
