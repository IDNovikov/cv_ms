import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ChatAggregate } from 'src/modules/chat/domain';
import { ChatDBPort, RedisServicePort } from 'src/modules/chat/providers';
import { ChatApplicationSupport } from '../../chat.application-support';
import { ChatListItemView } from '../../chat.new.facade';
import { ListChatsQuery } from './list-chats.query';

@QueryHandler(ListChatsQuery)
export class ListChatsHandler implements IQueryHandler<
  ListChatsQuery,
  { items: ChatListItemView[]; nextCursor?: string }
> {
  private readonly listCacheTtlSec = 20;

  constructor(
    private readonly db: ChatDBPort,
    private readonly redis: RedisServicePort,
    private readonly support: ChatApplicationSupport,
  ) {}

  async execute({
    dto,
  }: ListChatsQuery): Promise<{
    items: ChatListItemView[];
    nextCursor?: string;
  }> {
    const cacheKey = this.support.chatsListKey(
      dto.actorUserId,
      dto.limit,
      dto.cursor,
      dto.includeArchived,
    );
    const cached = await this.redis.get<{
      items: ReturnType<ChatAggregate['toPersistence']>[];
      nextCursor?: string;
    }>(cacheKey);

    const result = cached
      ? {
          items: cached.items.map((item) =>
            ChatAggregate.restore(this.support.hydrateChat(item)),
          ),
          nextCursor: cached.nextCursor,
        }
      : await this.db.listChats(dto);

    if (!cached) {
      await this.redis.set(
        cacheKey,
        {
          items: result.items.map((chat) => chat.toPersistence()),
          nextCursor: result.nextCursor,
        },
        this.listCacheTtlSec,
      );
    }

    return {
      items: await Promise.all(
        result.items.map((chat) =>
          this.support.buildChatListItem(chat, dto.actorUserId),
        ),
      ),
      nextCursor: result.nextCursor,
    };
  }
}
