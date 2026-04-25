import { MemberAggregate } from 'src/modules/chat/domain';
import { toGrpcMemberRole } from './memberRole.mapper';
import { toTimestamp } from './timeStamp.mapper';
import { ChatParticipant } from '@noildm/contracts/dist/gen/chat';

export function toGrpcChatParticipant(
  member: MemberAggregate,
): ChatParticipant {
  return {
    userId: member.userId,
    role: toGrpcMemberRole(member.role),
    joinedAt: toTimestamp(member.joinedAt),
  };
}
