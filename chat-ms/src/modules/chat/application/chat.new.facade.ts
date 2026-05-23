import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ChatAggregate, MemberAggregate, MessageAggregate } from '../domain';
import { AddMembersCommand } from './commands/add-members/add-members.command';
import { ArchiveChatCommand } from './commands/archive-chat/archive-chat.command';
import { CreateChatCommand } from './commands/create-chat/create-chat.command';
import { DeleteChatCommand } from './commands/delete-chat/delete-chat.command';
import { DeleteMessageCommand } from './commands/delete-message/delete-message.command';
import { LeaveChatCommand } from './commands/leave-chat/leave-chat.command';
import { MarkAsReadCommand } from './commands/mark-as-read/mark-as-read.command';
import { MuteChatCommand } from './commands/mute-chat/mute-chat.command';
import { RemoveMemberCommand } from './commands/remove-member/remove-member.command';
import { SendMessageCommand } from './commands/send-message/send-message.command';
import { UnarchiveChatCommand } from './commands/unarchive-chat/unarchive-chat.command';
import { UnmuteChatCommand } from './commands/unmute-chat/unmute-chat.command';
import { UpdateChatCommand } from './commands/update-chat/update-chat.command';
import { UpdateMessageCommand } from './commands/update-message/update-message.command';
import { AddMembersDto } from './commands/dto/add-members.dto';
import { ArchiveChatDto } from './commands/dto/archive-chat.dto';
import { CreateChatDto } from './commands/dto/create-chat.dto';
import { DeleteChatDto } from './commands/dto/delete-chat.dto';
import { DeleteMessageDto } from './commands/dto/delete-message.dto';
import { LeaveChatDto } from './commands/dto/leave-chat.dto';
import { MarkAsReadDto } from './commands/dto/mark-as-read.dto';
import { MuteChatDto } from './commands/dto/mute-chat.dto';
import { RemoveMemberDto } from './commands/dto/remove-member.dto';
import { SendMessageDto } from './commands/dto/send-message.dto';
import { UnarchiveChatDto } from './commands/dto/unarchive-chat.dto';
import { UnmuteChatDto } from './commands/dto/unmute-chat.dto';
import { UpdateChatDTO } from './commands/dto/update-chat.dto';
import { UpdateMessageDto } from './commands/dto/update-message.dto';
import { GetChatDTO } from './queries/dto/get-chat.dto';
import { GetChatMembersDto } from './queries/dto/get-chat-members.dto';
import { ListChatsDto } from './queries/dto/list-chats.dto';
import { ListMessagesDto } from './queries/dto/list-messages.dto';
import { GetChatQuery } from './queries/get-chat/get-chat.command';
import { GetChatMembersQuery } from './queries/get-chat-members/get-chat-members.query';
import { ListChatsQuery } from './queries/list-chats/list-chats.query';
import { ListMessagesQuery } from './queries/list-messages/list-messages.query';
import { ListResult } from '../providers';

export type ChatDetailsView = {
  chat: ChatAggregate;
  myState: MemberAggregate;
  participants: MemberAggregate[];
  lastMessage: MessageAggregate | null;
  unreadCount: number;
};

export type ChatListItemView = {
  chat: ChatAggregate;
  myState: MemberAggregate;
  lastMessage: MessageAggregate | null;
  unreadCount: number;
};

@Injectable()
export class ChatFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  commands = {
    createChat: (dto: CreateChatDto): Promise<ChatDetailsView> =>
      this.createChat(dto),
    updateChat: (dto: UpdateChatDTO): Promise<ChatDetailsView> =>
      this.updateChat(dto),
    deleteChat: (dto: DeleteChatDto): Promise<void> => this.deleteChat(dto),
    addMembers: (dto: AddMembersDto): Promise<void> => this.addMembers(dto),
    removeMember: (dto: RemoveMemberDto): Promise<void> =>
      this.removeMember(dto),
    leaveChat: (dto: LeaveChatDto): Promise<void> => this.leaveChat(dto),
    archiveChat: (dto: ArchiveChatDto): Promise<void> => this.archiveChat(dto),
    unarchiveChat: (dto: UnarchiveChatDto): Promise<void> =>
      this.unarchiveChat(dto),
    muteChat: (dto: MuteChatDto): Promise<void> => this.muteChat(dto),
    unmuteChat: (dto: UnmuteChatDto): Promise<void> => this.unmuteChat(dto),
    sendMessage: (dto: SendMessageDto): Promise<MessageAggregate> =>
      this.sendMessage(dto),
    updateMessage: (dto: UpdateMessageDto): Promise<MessageAggregate> =>
      this.updateMessage(dto),
    deleteMessage: (dto: DeleteMessageDto): Promise<void> =>
      this.deleteMessage(dto),
    markAsRead: (dto: MarkAsReadDto): Promise<void> => this.markAsRead(dto),
  };

  queries = {
    getChat: (dto: GetChatDTO): Promise<ChatDetailsView> => this.getChat(dto),
    listChats: (dto: ListChatsDto): Promise<ListResult<ChatListItemView>> =>
      this.listChats(dto),
    getChatMembers: (
      dto: GetChatMembersDto,
    ): Promise<ListResult<MemberAggregate>> => this.getChatMembers(dto),
    listMessages: (
      dto: ListMessagesDto,
    ): Promise<ListResult<MessageAggregate>> => this.listMessages(dto),
  };

  createChat(dto: CreateChatDto): Promise<ChatDetailsView> {
    return this.commandBus.execute<CreateChatCommand, ChatDetailsView>(
      new CreateChatCommand(dto),
    );
  }

  getChat(dto: GetChatDTO): Promise<ChatDetailsView> {
    return this.queryBus.execute<GetChatQuery, ChatDetailsView>(
      new GetChatQuery(dto),
    );
  }

  updateChat(dto: UpdateChatDTO): Promise<ChatDetailsView> {
    return this.commandBus.execute<UpdateChatCommand, ChatDetailsView>(
      new UpdateChatCommand(dto),
    );
  }

  deleteChat(dto: DeleteChatDto): Promise<void> {
    return this.commandBus.execute<DeleteChatCommand, void>(
      new DeleteChatCommand(dto),
    );
  }

  listChats(dto: ListChatsDto): Promise<ListResult<ChatListItemView>> {
    return this.queryBus.execute<ListChatsQuery, ListResult<ChatListItemView>>(
      new ListChatsQuery(dto),
    );
  }

  getChatMembers(dto: GetChatMembersDto): Promise<ListResult<MemberAggregate>> {
    return this.queryBus.execute<
      GetChatMembersQuery,
      ListResult<MemberAggregate>
    >(new GetChatMembersQuery(dto));
  }

  addMembers(dto: AddMembersDto): Promise<void> {
    return this.commandBus.execute<AddMembersCommand, void>(
      new AddMembersCommand(dto),
    );
  }

  removeMember(dto: RemoveMemberDto): Promise<void> {
    return this.commandBus.execute<RemoveMemberCommand, void>(
      new RemoveMemberCommand(dto),
    );
  }

  leaveChat(dto: LeaveChatDto): Promise<void> {
    return this.commandBus.execute<LeaveChatCommand, void>(
      new LeaveChatCommand(dto),
    );
  }

  archiveChat(dto: ArchiveChatDto): Promise<void> {
    return this.commandBus.execute<ArchiveChatCommand, void>(
      new ArchiveChatCommand(dto),
    );
  }

  unarchiveChat(dto: UnarchiveChatDto): Promise<void> {
    return this.commandBus.execute<UnarchiveChatCommand, void>(
      new UnarchiveChatCommand(dto),
    );
  }

  muteChat(dto: MuteChatDto): Promise<void> {
    return this.commandBus.execute<MuteChatCommand, void>(
      new MuteChatCommand(dto),
    );
  }

  unmuteChat(dto: UnmuteChatDto): Promise<void> {
    return this.commandBus.execute<UnmuteChatCommand, void>(
      new UnmuteChatCommand(dto),
    );
  }

  sendMessage(dto: SendMessageDto): Promise<MessageAggregate> {
    return this.commandBus.execute<SendMessageCommand, MessageAggregate>(
      new SendMessageCommand(dto),
    );
  }

  updateMessage(dto: UpdateMessageDto): Promise<MessageAggregate> {
    return this.commandBus.execute<UpdateMessageCommand, MessageAggregate>(
      new UpdateMessageCommand(dto),
    );
  }

  deleteMessage(dto: DeleteMessageDto): Promise<void> {
    return this.commandBus.execute<DeleteMessageCommand, void>(
      new DeleteMessageCommand(dto),
    );
  }

  listMessages(dto: ListMessagesDto): Promise<ListResult<MessageAggregate>> {
    return this.queryBus.execute<
      ListMessagesQuery,
      ListResult<MessageAggregate>
    >(new ListMessagesQuery(dto));
  }

  markAsRead(dto: MarkAsReadDto): Promise<void> {
    return this.commandBus.execute<MarkAsReadCommand, void>(
      new MarkAsReadCommand(dto),
    );
  }
}
