import { Controller } from '@nestjs/common';
import {
  ArchiveChatRequest,
  ChatDetails,
  ChatServiceController,
  ChatServiceControllerMethods,
  CreateChatRequest,
  DeleteChatRequest,
  DeleteMessageRequest,
  GetChatMembersRequest,
  GetChatMembersResponse,
  GetChatRequest,
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
  AddMembersRequest,
  LeaveChatRequest,
} from '@noildm/contracts/dist/gen/chat';
import { ChatFacade } from '../../application';
import { toGrpcMessage } from './mappers/toGrpcMessage.mapper';
import {
  toGrpcChatDetails,
  toGrpcChatListItem,
} from './mappers/toGrpcChatViews.mapper';
import { toGrpcChatParticipant } from './mappers/toGrpcChatParticipant.mapper';

@Controller()
@ChatServiceControllerMethods()
export class ChatGrpcController implements ChatServiceController {
  constructor(private readonly facade: ChatFacade) {}

  async createChat(request: CreateChatRequest): Promise<ChatDetails> {
    const chat = await this.facade.createChat(request);
    return toGrpcChatDetails(chat);
  }

  async getChat(request: GetChatRequest): Promise<ChatDetails> {
    const chat = await this.facade.getChat(request);
    return toGrpcChatDetails(chat);
  }

  async updateChat(request: UpdateChatRequest): Promise<ChatDetails> {
    const chat = await this.facade.updateChat(request);
    return toGrpcChatDetails(chat);
  }

  async deleteChat(request: DeleteChatRequest): Promise<void> {
    await this.facade.deleteChat(request);
  }

  async getListChats(request: ListChatsRequest): Promise<ListChatsResponse> {
    const result = await this.facade.listChats(request);

    return {
      chats: result.items.map((chat) => toGrpcChatListItem(chat)),
      nextCursor: result.nextCursor,
    };
  }

  async getChatMembers(
    request: GetChatMembersRequest,
  ): Promise<GetChatMembersResponse> {
    const result = await this.facade.getChatMembers(request);
    return {
      participants: result.items.map((member) => toGrpcChatParticipant(member)),
      nextCursor: result.nextCursor,
    };
  }

  async addMembers(request: AddMembersRequest): Promise<void> {
    await this.facade.addMembers(request);
  }

  async removeMember(request: RemoveMemberRequest): Promise<void> {
    await this.facade.removeMember(request);
  }

  async leaveChat(request: LeaveChatRequest): Promise<void> {
    await this.facade.leaveChat(request);
  }

  async archiveChat(request: ArchiveChatRequest): Promise<void> {
    await this.facade.archiveChat(request);
  }

  async unarchiveChat(request: UnarchiveChatRequest): Promise<void> {
    await this.facade.unarchiveChat(request);
  }

  async muteChat(request: MuteChatRequest): Promise<void> {
    await this.facade.muteChat(request);
  }

  async unmuteChat(request: UnmuteChatRequest): Promise<void> {
    await this.facade.unmuteChat(request);
  }

  async sendMessage(request: SendMessageRequest): Promise<Message> {
    const message = await this.facade.sendMessage({
      requestId: request.requestId,
      chatId: request.chatId,
      authorId: request.authorId,
      text: request.text,
      kind: request.kind,
    });
    return toGrpcMessage(message);
  }

  async updateMessage(request: UpdateMessageRequest): Promise<Message> {
    const message = await this.facade.updateMessage(request);
    return toGrpcMessage(message);
  }

  async deleteMessage(request: DeleteMessageRequest): Promise<void> {
    await this.facade.deleteMessage(request);
  }

  async getListMessages(
    request: ListMessagesRequest,
  ): Promise<ListMessagesResponse> {
    const result = await this.facade.listMessages(request);
    return {
      messages: result.items.map((message) => toGrpcMessage(message)),
      nextCursor: result.nextCursor,
    };
  }

  async markAsRead(request: MarkAsReadRequest): Promise<void> {
    await this.facade.markAsRead(request);
  }
}
