import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';

@InputType()
export class MuteChatDto {
  @Field()
  @ApiProperty({ example: '2026-05-07T10:00:00.000Z' })
  @IsISO8601()
  mutedUntil!: string;
}
