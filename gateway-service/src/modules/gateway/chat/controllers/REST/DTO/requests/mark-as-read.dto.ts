import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { MarkAsReadRequest } from '@noildm/contracts/dist/gen/chat';

@InputType()
export class MarkAsReadDto implements Pick<MarkAsReadRequest, 'lastReadMessageId'> {
  @Field()
  @ApiProperty({ example: '018f2b9d-1a2b-7000-8000-000000000010' })
  @IsString()
  lastReadMessageId!: string;
}
