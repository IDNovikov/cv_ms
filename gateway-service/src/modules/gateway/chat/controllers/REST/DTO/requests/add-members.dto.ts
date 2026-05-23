import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

@InputType()
export class AddMembersDto {
  @Field(() => [String])
  @ApiProperty({ type: [String], example: ['018f2b9d-1a2b-7000-8000-000000000003'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userIds!: string[];
}
