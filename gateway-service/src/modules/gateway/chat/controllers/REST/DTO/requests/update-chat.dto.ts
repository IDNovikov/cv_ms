import { Field, InputType } from '@nestjs/graphql';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UpdateChatRequest } from '@noildm/contracts/dist/gen/chat';

@InputType()
export class UpdateChatDto
  implements Partial<Pick<UpdateChatRequest, 'title' | 'avatarUrl'>>
{
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
