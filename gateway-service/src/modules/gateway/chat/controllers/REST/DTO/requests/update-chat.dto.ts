import { Field, InputType } from '@nestjs/graphql';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateChatDto {
  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'Updated chat title' })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'https://cdn.example.com/chat-updated.png' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
