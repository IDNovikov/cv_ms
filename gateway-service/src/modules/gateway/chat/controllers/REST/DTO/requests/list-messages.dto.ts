import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ListMessagesRequest } from '@noildm/contracts/dist/gen/chat';

@InputType()
export class ListMessagesDto
  implements Partial<Pick<ListMessagesRequest, 'limit' | 'cursor'>>
{
  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '2026-05-06T10:00:00.000Z' })
  @IsOptional()
  @IsString()
  cursor?: string;
}
