import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ListChatsRequest } from '@noildm/contracts/dist/gen/chat';

@InputType()
export class ListChatsDto
  implements Partial<Pick<ListChatsRequest, 'limit' | 'cursor' | 'includeArchived'>>
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

  @Field({ nullable: true })
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeArchived?: boolean = false;
}
