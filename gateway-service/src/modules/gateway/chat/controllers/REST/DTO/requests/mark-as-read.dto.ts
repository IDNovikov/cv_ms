import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

@InputType()
export class MarkAsReadDto {
  @Field()
  @ApiProperty({ example: '018f2b9d-1a2b-7000-8000-000000000010' })
  @IsUUID()
  lastReadMessageId!: string;
}
