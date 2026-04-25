import { Message } from '@noildm/contracts/dist/gen/chat';
import { MessageAggregate } from 'src/modules/chat/domain';
import { toGrpcMessageKind } from './messageKind.mapper';
import { toTimestamp } from './timeStamp.mapper';

export function toGrpcMessage(message: MessageAggregate): Message {
  return {
    id: message.id,
    chatId: message.chatId,
    authorId: message.authorId,
    kind: toGrpcMessageKind(message.kind),
    text: message.text,
    isEdited: message.isEdited,
    editedAt: message.editedAt ? toTimestamp(message.editedAt) : undefined,
    replyToId: message.replyToId ?? undefined,
    createdAt: message.createdAt ? toTimestamp(message.createdAt) : undefined,
    updatedAt: message.updatedAt ? toTimestamp(message.updatedAt) : undefined,
  };
}
