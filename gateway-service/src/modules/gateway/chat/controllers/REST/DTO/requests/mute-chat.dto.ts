import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min, ValidateNested } from 'class-validator';
import { MuteChatRequest } from '@noildm/contracts/dist/gen/chat';
import { Timestamp } from '@noildm/contracts/dist/gen/google/protobuf/timestamp';

@InputType()
export class TimestampDto implements Timestamp {
  @Field(() => Int)
  @ApiProperty({ example: 1778061600 })
  @Type(() => Number)
  @IsInt()
  seconds!: number;

  @Field(() => Int)
  @ApiProperty({ example: 0, minimum: 0, maximum: 999999999 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999999999)
  nanos!: number;
}

@InputType()
export class MuteChatDto implements Pick<MuteChatRequest, 'mutedUntil'> {
  @Field(() => TimestampDto)
  @ApiProperty({ type: TimestampDto })
  @ValidateNested()
  @Type(() => TimestampDto)
  mutedUntil!: TimestampDto;
}
