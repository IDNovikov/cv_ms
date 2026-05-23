import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ChatMemberRole, ChatType } from '@noildm/contracts/dist/gen/chat';
import { MessageGqlEntity } from './message-gql.entity';
import { MemberGqlEntity } from './member-gql.entity';

registerEnumType(ChatType, { name: 'ChatType' });
registerEnumType(ChatMemberRole, { name: 'ChatMemberRole' });

@ObjectType()
export class ChatGqlEntity {
  @Field()
  id!: string;

  @Field(() => ChatType)
  type!: ChatType;

  @Field({ nullable: true })
  title?: string | null;

  @Field({ nullable: true })
  avatarUrl?: string | null;

  @Field()
  createdById!: string;

  @Field({ nullable: true })
  lastMessageId?: string | null;

  @Field(() => Date, { nullable: true })
  lastMessageAt?: Date | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class ChatUserStateGqlEntity {
  @Field(() => ChatMemberRole)
  role!: ChatMemberRole;

  @Field(() => Date)
  joinedAt!: Date;

  @Field(() => Date, { nullable: true })
  mutedUntil?: Date | null;

  @Field(() => Date, { nullable: true })
  archivedAt?: Date | null;

  @Field({ nullable: true })
  lastReadMessageId?: string | null;

  @Field(() => Date, { nullable: true })
  lastReadAt?: Date | null;
}

@ObjectType()
export class ChatDetailsGqlEntity {
  @Field(() => ChatGqlEntity, { nullable: true })
  chat?: ChatGqlEntity | null;

  @Field(() => ChatUserStateGqlEntity, { nullable: true })
  myState?: ChatUserStateGqlEntity | null;

  @Field(() => [MemberGqlEntity])
  participants!: MemberGqlEntity[];

  @Field(() => MessageGqlEntity, { nullable: true })
  lastMessage?: MessageGqlEntity | null;

  @Field(() => Int)
  unreadCount!: number;
}

@ObjectType()
export class ChatListItemGqlEntity {
  @Field(() => ChatGqlEntity, { nullable: true })
  chat?: ChatGqlEntity | null;

  @Field(() => ChatUserStateGqlEntity, { nullable: true })
  myState?: ChatUserStateGqlEntity | null;

  @Field(() => MessageGqlEntity, { nullable: true })
  lastMessage?: MessageGqlEntity | null;

  @Field(() => Int)
  unreadCount!: number;
}
