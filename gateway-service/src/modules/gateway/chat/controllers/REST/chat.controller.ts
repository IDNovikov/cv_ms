import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@/common/decorators/userRefreshToken.decorator';
import { UseSwagger } from '@/common/decorators/swagger.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { FacadePort } from '../../providers/facade/facade.port';
import {
  AddMembersDto,
  CreateChatDto,
  GetChatMembersDto,
  ListChatsDto,
  ListMessagesDto,
  MarkAsReadDto,
  MuteChatDto,
  SendMessageDto,
  UpdateChatDto,
  UpdateMessageDto,
} from './DTO';
import { ChatSwagger } from './docs/chatSwagger.docs';

type AuthUser = { sub: string };

@ApiTags('Chat')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly facade: FacadePort) {}

  @Post()
  @UseSwagger(...ChatSwagger.CreateChat)
  async createChat(@User() user: AuthUser, @Body() dto: CreateChatDto) {
    console.log(user);
    return this.facade.createChat({
      requestId: dto.requestId,
      actorUserId: user.sub,
      type: dto.type,
      participantUserIds: dto.participantUserIds,
      title: dto.title,
      avatarUrl: dto.avatarUrl,
    });
  }

  @Get()
  @UseSwagger(...ChatSwagger.ListChats)
  async getChats(@User() user: AuthUser, @Query() query: ListChatsDto) {
    console.log(user);

    return this.facade.getListChats({
      actorUserId: user.sub,
      limit: query.limit ?? 10,
      cursor: query.cursor,
      includeArchived: query.includeArchived ?? false,
    });
  }

  @Get(':chatId')
  @UseSwagger(...ChatSwagger.GetChat)
  async getChat(@User() user: AuthUser, @Param('chatId') chatId: string) {
    return this.facade.getChat({
      chatId,
      actorUserId: user.sub,
    });
  }

  @Patch(':chatId')
  @UseSwagger(...ChatSwagger.UpdateChat)
  async updateChat(
    @User() user: AuthUser,
    @Param('chatId') chatId: string,
    @Body() dto: UpdateChatDto,
  ) {
    return this.facade.updateChat({
      chatId,
      actorUserId: user.sub,
      title: dto.title,
      avatarUrl: dto.avatarUrl,
    });
  }

  @Delete(':chatId')
  @UseSwagger(...ChatSwagger.DeleteChat)
  async deleteChat(@User() user: AuthUser, @Param('chatId') chatId: string) {
    return this.facade.deleteChat({
      chatId,
      actorUserId: user.sub,
    });
  }

  @Get(':chatId/members')
  @UseSwagger(...ChatSwagger.GetChatMembers)
  async getChatMembers(
    @User() user: AuthUser,
    @Param('chatId') chatId: string,
    @Query() query: GetChatMembersDto,
  ) {
    return this.facade.getChatMembers({
      chatId,
      actorUserId: user.sub,
      limit: query.limit ?? 20,
      cursor: query.cursor,
    });
  }

  @Post(':chatId/members')
  @UseSwagger(...ChatSwagger.AddMembers)
  async addMembers(
    @User() user: AuthUser,
    @Param('chatId') chatId: string,
    @Body() dto: AddMembersDto,
  ) {
    return this.facade.addMembers({
      chatId,
      actorUserId: user.sub,
      userIds: dto.userIds,
    });
  }

  @Delete(':chatId/members/:userId')
  @UseSwagger(...ChatSwagger.RemoveMember)
  async removeMember(
    @User() user: AuthUser,
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ) {
    return this.facade.removeMember({
      chatId,
      actorUserId: user.sub,
      userId,
    });
  }

  @Post(':chatId/leave')
  @UseSwagger(...ChatSwagger.LeaveChat)
  async leaveChat(@User() user: AuthUser, @Param('chatId') chatId: string) {
    return this.facade.leaveChat({
      chatId,
      actorUserId: user.sub,
    });
  }

  @Post(':chatId/archive')
  @UseSwagger(...ChatSwagger.ArchiveChat)
  async archiveChat(@User() user: AuthUser, @Param('chatId') chatId: string) {
    return this.facade.archiveChat({
      chatId,
      actorUserId: user.sub,
    });
  }

  @Delete(':chatId/archive')
  @UseSwagger(...ChatSwagger.UnarchiveChat)
  async unarchiveChat(@User() user: AuthUser, @Param('chatId') chatId: string) {
    return this.facade.unarchiveChat({
      chatId,
      actorUserId: user.sub,
    });
  }

  @Post(':chatId/mute')
  @UseSwagger(...ChatSwagger.MuteChat)
  async muteChat(
    @User() user: AuthUser,
    @Param('chatId') chatId: string,
    @Body() dto: MuteChatDto,
  ) {
    return this.facade.muteChat({
      chatId,
      actorUserId: user.sub,
      mutedUntil: dto.mutedUntil,
    });
  }

  @Delete(':chatId/mute')
  @UseSwagger(...ChatSwagger.UnmuteChat)
  async unmuteChat(@User() user: AuthUser, @Param('chatId') chatId: string) {
    return this.facade.unmuteChat({
      chatId,
      actorUserId: user.sub,
    });
  }

  @Post(':chatId/messages')
  @UseSwagger(...ChatSwagger.SendMessage)
  async sendMessage(
    @User() user: AuthUser,
    @Param('chatId') chatId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.facade.sendMessage({
      requestId: dto.requestId,
      chatId,
      authorId: user.sub,
      kind: dto.kind,
      text: dto.text,
      replyToId: dto.replyToId,
    });
  }

  @Get(':chatId/messages')
  @UseSwagger(...ChatSwagger.ListMessages)
  async getMessages(
    @User() user: AuthUser,
    @Param('chatId') chatId: string,
    @Query() query: ListMessagesDto,
  ) {
    return this.facade.getListMessages({
      chatId,
      actorUserId: user.sub,
      limit: query.limit ?? 20,
      cursor: query.cursor,
    });
  }

  @Patch('messages/:messageId')
  @UseSwagger(...ChatSwagger.UpdateMessage)
  async updateMessage(
    @User() user: AuthUser,
    @Param('messageId') messageId: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.facade.updateMessage({
      messageId,
      authorId: user.sub,
      text: dto.text,
    });
  }

  @Delete('messages/:messageId')
  @UseSwagger(...ChatSwagger.DeleteMessage)
  async deleteMessage(@User() user: AuthUser, @Param('messageId') messageId: string) {
    return this.facade.deleteMessage({
      messageId,
      authorId: user.sub,
    });
  }

  @Post(':chatId/read')
  @UseSwagger(...ChatSwagger.MarkAsRead)
  async markAsRead(
    @User() user: AuthUser,
    @Param('chatId') chatId: string,
    @Body() dto: MarkAsReadDto,
  ) {
    return this.facade.markAsRead({
      chatId,
      actorUserId: user.sub,
      lastReadMessageId: dto.lastReadMessageId,
    });
  }
}
