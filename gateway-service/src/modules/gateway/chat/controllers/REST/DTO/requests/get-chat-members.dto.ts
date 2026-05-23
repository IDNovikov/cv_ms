import { InputType } from '@nestjs/graphql';
import { ListMessagesDto } from './list-messages.dto';

@InputType()
export class GetChatMembersDto extends ListMessagesDto {}
