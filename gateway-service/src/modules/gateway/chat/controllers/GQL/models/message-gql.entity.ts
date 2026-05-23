import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { MessageKind } from '@noildm/contracts/dist/gen/chat';

registerEnumType(MessageKind, { name: 'MessageKind' });

@ObjectType()
export class MessageGqlEntity {
  @Field()
  id!: string;

  @Field()
  chatId!: string;

  @Field()
  authorId!: string;

  @Field(() => MessageKind)
  kind!: MessageKind;

  @Field()
  text!: string;

  @Field()
  isEdited!: boolean;

  @Field(() => Date, { nullable: true })
  editedAt?: Date | null;

  @Field({ nullable: true })
  replyToId?: string | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
