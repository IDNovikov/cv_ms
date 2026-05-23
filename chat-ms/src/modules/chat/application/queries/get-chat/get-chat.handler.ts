import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ChatApplicationSupport } from '../../chat.application-support';
import { ChatDetailsView } from '../../chat.new.facade';
import { GetChatQuery } from './get-chat.command';

@QueryHandler(GetChatQuery)
export class GetChatHandler implements IQueryHandler<
  GetChatQuery,
  ChatDetailsView
> {
  constructor(private readonly support: ChatApplicationSupport) {}

  async execute({ dto }: GetChatQuery): Promise<ChatDetailsView> {
    const chat = await this.support.getChatById(dto.chatId);
    await this.support.requireActiveMember(dto.chatId, dto.actorUserId);

    return this.support.buildChatDetails(chat, dto.actorUserId);
  }
}
