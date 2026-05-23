import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MemberAggregate } from 'src/modules/chat/domain';
import { ChatDBPort, ListResult } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { GetChatMembersQuery } from './get-chat-members.query';

@QueryHandler(GetChatMembersQuery)
export class GetChatMembersHandler implements IQueryHandler<
  GetChatMembersQuery,
  ListResult<MemberAggregate>
> {
  constructor(
    private readonly db: ChatDBPort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({
    dto,
  }: GetChatMembersQuery): Promise<ListResult<MemberAggregate>> {
    await this.support.requireActiveMember(dto.chatId, dto.actorUserId);
    return this.db.listMembersPaginated(dto);
  }
}
