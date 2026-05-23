import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

@InputType()
export class UpdateMessageDto {
  @Field()
  @ApiProperty({ example: 'Edited message' })
  @IsString()
  text!: string;
}
