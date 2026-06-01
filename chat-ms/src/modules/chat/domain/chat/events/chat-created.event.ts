import { IChat } from '../chat.interface';

export class ChatCreatedDomainEvent {
  constructor(
    public readonly chatId: IChat['id'],
    public readonly type: IChat['type'],
    public readonly createdById: string,
    public readonly invitedById: string[],
    public readonly createdAt: IChat['createdAt'],
  ) {}
}
