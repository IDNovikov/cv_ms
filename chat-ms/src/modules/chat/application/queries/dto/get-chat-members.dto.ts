export class GetChatMembersDto {
  chatId: string;
  actorUserId: string;
  limit: number;
  cursor?: string;
}
