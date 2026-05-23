import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FacadePort } from './facade.port';
import {
  AddMembersRequest,
  ArchiveChatRequest,
  CHAT_SERVICE_NAME,
  ChatDetails,
  ChatServiceClient,
  CreateChatRequest,
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
} from '@noildm/contracts/dist/gen/chat';
import { Empty } from '@noildm/contracts/dist/gen/google/protobuf/empty';

@Injectable()
export class FacadeAdapter implements OnModuleInit, FacadePort {
  private chatService: ChatServiceClient;

  public constructor(@Inject(CHAT_SERVICE_NAME) private readonly client: ClientGrpc) {}

  public onModuleInit() {
    this.chatService = this.client.getService<ChatServiceClient>(CHAT_SERVICE_NAME);
  }

  public createChat(request: CreateChatRequest): Promise<ChatDetails> {
    return firstValueFrom(this.chatService.createChat(request));
  }
  public getChat(request: GetChatRequest): Promise<ChatDetails> {
    return firstValueFrom(this.chatService.getChat(request));
  }
  public updateChat(request: UpdateChatRequest): Promise<ChatDetails> {
    return firstValueFrom(this.chatService.updateChat(request));
  }
  public deleteChat(request: DeleteChatRequest): Promise<Empty> {
    return firstValueFrom(this.chatService.deleteChat(request));
  }
  public getListChats(request: ListChatsRequest): Promise<ListChatsResponse> {
    return firstValueFrom(this.chatService.getListChats(request));
  }
  public getChatMembers(request: GetChatMembersRequest): Promise<GetChatMembersResponse> {
    return firstValueFrom(this.chatService.getChatMembers(request));
  }
  public addMembers(request: AddMembersRequest): Promise<Empty> {
    return firstValueFrom(this.chatService.addMembers(request));
  }
  public removeMember(request: RemoveMemberRequest): Promise<Empty> {
    return firstValueFrom(this.chatService.removeMember(request));
  }
  public leaveChat(request: LeaveChatRequest): Promise<Empty> {
    return firstValueFrom(this.chatService.leaveChat(request));
  }
  public archiveChat(request: ArchiveChatRequest): Promise<Empty> {
    return firstValueFrom(this.chatService.archiveChat(request));
  }
  public unarchiveChat(request: UnarchiveChatRequest): Promise<Empty> {
    return firstValueFrom(this.chatService.unarchiveChat(request));
  }
  public muteChat(request: MuteChatRequest): Promise<Empty> {
    return firstValueFrom(this.chatService.muteChat(request));
  }
  public unmuteChat(request: UnmuteChatRequest): Promise<Empty> {
    return firstValueFrom(this.chatService.unmuteChat(request));
  }
  public sendMessage(request: SendMessageRequest): Promise<Message> {
    return firstValueFrom(this.chatService.sendMessage(request));
  }
  public updateMessage(request: UpdateMessageRequest): Promise<Message> {
    return firstValueFrom(this.chatService.updateMessage(request));
  }
  public deleteMessage(request: DeleteMessageRequest): Promise<Empty> {
    return firstValueFrom(this.chatService.deleteMessage(request));
  }
  public getListMessages(request: ListMessagesRequest): Promise<ListMessagesResponse> {
    return firstValueFrom(this.chatService.getListMessages(request));
  }
  public markAsRead(request: MarkAsReadRequest): Promise<Empty> {
    return firstValueFrom(this.chatService.markAsRead(request));
  }
}
