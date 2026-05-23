import { Chat, ChatType } from '@noildm/contracts/dist/gen/chat';
import { ChatAggregate } from 'src/modules/chat/domain';
import { toTimestampOrUndefined } from './toTimeStampOrUndefined.mapper';
import { toTimestamp } from './timeStamp.mapper';

export function toGrpcChat(chat: ChatAggregate): Chat {
  return {
    id: chat.id,
    type: chat.type === 'DIRECT' ? ChatType.DIRECT : ChatType.GROUP,
    title: chat.title ?? undefined,
    avatarUrl: chat.avatarUrl ?? undefined,
    createdById: chat.createdById,
    lastMessageId: chat.lastMessageId ?? undefined,
    lastMessageAt: toTimestampOrUndefined(chat.lastMessageAt),
    createdAt: toTimestamp(chat.createdAt),
    updatedAt: toTimestamp(chat.updatedAt),
  };
}
