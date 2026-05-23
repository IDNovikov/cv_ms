export class ListMessagesDto {
  chatId: string;
  actorUserId: string;
  limit: number;
  cursor?: string;
}
