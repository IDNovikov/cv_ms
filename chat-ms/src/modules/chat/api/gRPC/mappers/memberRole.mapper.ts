import { ChatMemberRole } from '@noildm/contracts/dist/gen/chat';
import { ChatMemberRole as DomainChatMemberRole } from 'src/modules/chat/domain';

export function toGrpcMemberRole(role: DomainChatMemberRole): ChatMemberRole {
  if (role === 'OWNER') return ChatMemberRole.OWNER;
  if (role === 'ADMIN') return ChatMemberRole.ADMIN;
  return ChatMemberRole.MEMBER;
}
