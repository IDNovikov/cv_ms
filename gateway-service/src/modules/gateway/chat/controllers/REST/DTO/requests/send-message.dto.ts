import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MessageKind, SendMessageRequest } from '@noildm/contracts/dist/gen/chat';

@InputType()
export class SendMessageDto
  implements Pick<SendMessageRequest, 'requestId' | 'kind' | 'text' | 'replyToId'>
{
  @Field(() => String)
  @ApiProperty({ type: String, example: '018f2b9d-1a2b-7000-8000-000000000002' })
  @IsString()
  requestId!: string;

  @Field()
  @ApiProperty({ example: 'Hello' })
  @IsString()
  text!: string;

  @Field(() => MessageKind)
  @ApiProperty({ enum: MessageKind, example: MessageKind.TEXT })
  @IsEnum(MessageKind)
  kind!: MessageKind;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '018f2b9d-1a2b-7000-8000-000000000010' })
  @IsOptional()
  @IsString()
  replyToId?: string;
}
