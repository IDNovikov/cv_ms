import { Field, ObjectType } from '@nestjs/graphql';
import { ChatMemberRole } from '@noildm/contracts/dist/gen/chat';

@ObjectType()
export class MemberGqlEntity {
  @Field()
  userId!: string;

  @Field(() => ChatMemberRole)
  role!: ChatMemberRole;

  @Field(() => Date)
  joinedAt!: Date;
}
