import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UpdateMessageRequest } from '@noildm/contracts/dist/gen/chat';

@InputType()
export class UpdateMessageDto implements Pick<UpdateMessageRequest, 'text'> {
  @Field()
  @ApiProperty({ example: 'Edited message' })
  @IsString()
  text!: string;
}
