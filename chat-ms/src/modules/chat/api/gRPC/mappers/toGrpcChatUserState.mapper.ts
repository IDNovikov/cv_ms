import { ChatUserState } from '@noildm/contracts/dist/gen/chat';
import { MemberAggregate } from 'src/modules/chat/domain';
import { toGrpcMemberRole } from './memberRole.mapper';
import { toTimestamp } from './timeStamp.mapper';
import { toTimestampOrUndefined } from './toTimeStampOrUndefined.mapper';

export function toGrpcChatUserState(member: MemberAggregate): ChatUserState {
  return {
    role: toGrpcMemberRole(member.role),
    joinedAt: toTimestamp(member.joinedAt),
    mutedUntil: toTimestampOrUndefined(member.mutedUntil),
    archivedAt: toTimestampOrUndefined(member.archivedAt),
    lastReadMessageId: member.lastReadMessageId ?? undefined,
    lastReadAt: toTimestampOrUndefined(member.lastReadAt),
  };
}
