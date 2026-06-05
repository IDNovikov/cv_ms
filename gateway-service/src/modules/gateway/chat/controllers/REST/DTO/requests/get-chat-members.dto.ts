import { InputType } from '@nestjs/graphql';
import { GetChatMembersRequest } from '@noildm/contracts/dist/gen/chat';
import { ListMessagesDto } from './list-messages.dto';

@InputType()
export class GetChatMembersDto
  extends ListMessagesDto
  implements Partial<Pick<GetChatMembersRequest, 'limit' | 'cursor'>> {}
