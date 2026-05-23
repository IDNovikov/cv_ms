import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MessageAggregate } from 'src/modules/chat/domain';
import {
  ChatDBPort,
  ListResult,
  RedisServicePort,
} from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { ListMessagesQuery } from './list-messages.query';

@QueryHandler(ListMessagesQuery)
export class ListMessagesHandler implements IQueryHandler<
  ListMessagesQuery,
  ListResult<MessageAggregate>
> {
  private readonly listCacheTtlSec = 20;

  constructor(
    private readonly db: ChatDBPort,
    private readonly redis: RedisServicePort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({
    dto,
  }: ListMessagesQuery): Promise<ListResult<MessageAggregate>> {
    await this.support.requireActiveMember(dto.chatId, dto.actorUserId);

    const cacheKey = this.support.messagesListKey(
      dto.chatId,
      dto.limit,
      dto.cursor,
    );
    const cached = await this.redis.get<{
      items: ReturnType<MessageAggregate['toPersistence']>[];
      nextCursor?: string;
    }>(cacheKey);
    if (cached) {
      return {
        items: cached.items.map((item) =>
          MessageAggregate.restore(this.support.hydrateMessage(item)),
        ),
        nextCursor: cached.nextCursor,
      };
    }

    const result = await this.db.listMessages(dto);
    await this.redis.set(
      cacheKey,
      {
        items: result.items.map((message) => message.toPersistence()),
        nextCursor: result.nextCursor,
      },
      this.listCacheTtlSec,
    );

    return result;
  }
}
