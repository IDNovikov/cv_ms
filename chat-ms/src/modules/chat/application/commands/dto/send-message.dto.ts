import { MessageKind } from '@noildm/contracts/dist/gen/chat';
import { IMessage } from 'src/modules/chat/domain';

export class SendMessageDto {
  requestId: string;
  chatId: string;
  authorId: string;
  kind: MessageKind | IMessage['kind'];
  text: string;
  replyToId?: string;
}
