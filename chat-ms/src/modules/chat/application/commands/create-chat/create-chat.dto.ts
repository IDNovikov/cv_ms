export class CreateChatDto {
  requestId: string;
  actorUserId: string;
  type: 'DIRECT' | 'GROUP';
  participantUserIds: string[];
  title?: string | undefined;
  avatarUrl?: string | undefined;
}
