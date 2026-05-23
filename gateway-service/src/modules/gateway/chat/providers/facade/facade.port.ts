import {
  AddMembersRequest,
  ArchiveChatRequest,
  ChatDetails,
  DeleteChatRequest,
  DeleteMessageRequest,
  GetChatMembersRequest,
  GetChatMembersResponse,
  GetChatRequest,
  LeaveChatRequest,
  ListChatsRequest,
  ListChatsResponse,
  ListMessagesRequest,
  ListMessagesResponse,
  MarkAsReadRequest,
  Message,
  MuteChatRequest,
  RemoveMemberRequest,
  SendMessageRequest,
  UnarchiveChatRequest,
  UnmuteChatRequest,
  UpdateChatRequest,
  UpdateMessageRequest,
  CreateChatRequest,
} from '@noildm/contracts/dist/gen/chat';
import { Empty } from '@noildm/contracts/dist/gen/google/protobuf/empty';

export abstract class FacadePort {
  abstract createChat(request: CreateChatRequest): Promise<ChatDetails>;
  abstract getChat(request: GetChatRequest): Promise<ChatDetails>;
  abstract updateChat(request: UpdateChatRequest): Promise<ChatDetails>;
  abstract deleteChat(request: DeleteChatRequest): Promise<Empty>;
  abstract getListChats(request: ListChatsRequest): Promise<ListChatsResponse>;
  abstract getChatMembers(request: GetChatMembersRequest): Promise<GetChatMembersResponse>;
  abstract addMembers(request: AddMembersRequest): Promise<Empty>;
  abstract removeMember(request: RemoveMemberRequest): Promise<Empty>;
  abstract leaveChat(request: LeaveChatRequest): Promise<Empty>;
  abstract archiveChat(request: ArchiveChatRequest): Promise<Empty>;
  abstract unarchiveChat(request: UnarchiveChatRequest): Promise<Empty>;
  abstract muteChat(request: MuteChatRequest): Promise<Empty>;
  abstract unmuteChat(request: UnmuteChatRequest): Promise<Empty>;
  abstract sendMessage(request: SendMessageRequest): Promise<Message>;
  abstract updateMessage(request: UpdateMessageRequest): Promise<Message>;
  abstract deleteMessage(request: DeleteMessageRequest): Promise<Empty>;
  abstract getListMessages(request: ListMessagesRequest): Promise<ListMessagesResponse>;
  abstract markAsRead(request: MarkAsReadRequest): Promise<Empty>;
}
