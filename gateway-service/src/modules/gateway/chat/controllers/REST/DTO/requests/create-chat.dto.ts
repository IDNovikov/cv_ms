import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ChatType } from '@noildm/contracts/dist/gen/chat';

@InputType()
export class CreateChatDto {
  @Field(() => String)
  @ApiProperty({ type: String, example: '018f2b9d-1a2b-7000-8000-000000000002' })
  @IsString()
  requestId!: string;

  @Field(() => ChatType)
  @ApiProperty({ enum: ChatType, example: ChatType.DIRECT })
  @IsEnum(ChatType)
  type!: ChatType;

  @Field(() => [String])
  @ApiProperty({ type: [String], example: ['018f2b9d-1a2b-7000-8000-000000000002'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  participantUserIds!: string[];

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'Project chat' })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'https://cdn.example.com/chat.png' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
