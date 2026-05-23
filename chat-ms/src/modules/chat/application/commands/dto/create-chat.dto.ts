import { ChatType } from '@noildm/contracts/dist/gen/chat';

export class CreateChatDto {
  requestId: string;
  actorUserId: string;
  type: ChatType | 'DIRECT' | 'GROUP';
  participantUserIds: string[];
  title?: string | undefined;
  avatarUrl?: string | undefined;
}
