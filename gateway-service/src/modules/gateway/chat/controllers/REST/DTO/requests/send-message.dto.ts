import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MessageKind } from '@noildm/contracts/dist/gen/chat';

@InputType()
export class SendMessageDto {
  @Field(() => String)
  @ApiProperty({ type: String, example: '018f2b9d-1a2b-7000-8000-000000000002' })
  @IsString()
  requestId!: string;

  @Field()
  @ApiProperty({ example: 'Hello' })
  @IsString()
  text!: string;

  @Field(() => MessageKind, { nullable: true })
  @ApiPropertyOptional({ enum: MessageKind, default: MessageKind.TEXT })
  @IsOptional()
  @IsEnum(MessageKind)
  kind?: MessageKind = MessageKind.TEXT;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '018f2b9d-1a2b-7000-8000-000000000010' })
  @IsOptional()
  @IsUUID()
  replyToId?: string;
}
