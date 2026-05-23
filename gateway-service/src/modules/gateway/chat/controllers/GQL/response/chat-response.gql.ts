import { Field, ObjectType } from '@nestjs/graphql';
import { ChatListItemGqlEntity } from '../models/chat-gql.entity';
import { MemberGqlEntity } from '../models/member-gql.entity';
import { MessageGqlEntity } from '../models/message-gql.entity';

@ObjectType()
export class ChatListResponseGql {
  @Field(() => [ChatListItemGqlEntity])
  chats!: ChatListItemGqlEntity[];

  @Field({ nullable: true })
  nextCursor?: string | null;
}

@ObjectType()
export class ChatMembersResponseGql {
  @Field(() => [MemberGqlEntity])
  participants!: MemberGqlEntity[];

  @Field({ nullable: true })
  nextCursor?: string | null;
}

@ObjectType()
export class MessageListResponseGql {
  @Field(() => [MessageGqlEntity])
  messages!: MessageGqlEntity[];

  @Field({ nullable: true })
  nextCursor?: string | null;
}
