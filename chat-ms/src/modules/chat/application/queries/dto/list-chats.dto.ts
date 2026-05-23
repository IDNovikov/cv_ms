export class ListChatsDto {
  actorUserId: string;
  limit: number;
  cursor?: string;
  includeArchived: boolean;
}
