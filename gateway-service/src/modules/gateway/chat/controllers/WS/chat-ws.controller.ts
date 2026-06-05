import { AccessJwtPayload, AuthTokenService } from '@/modules/gateway/shared/auth-token.service';
import { WSService } from '@/modules/core/ws/ws.service';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SendMessageDto } from '../REST/DTO/requests/send-message.dto';
import { UpdateMessageDto } from '../REST/DTO/requests/update-message.dto';
import { FacadePort } from '../../providers/facade/facade.port';
import { CreateChatDto } from '../REST/DTO';

type SendMessageWsPayload = SendMessageDto & {
  chatId: string;
  requestId: string;
};

type UpdateMessageWsPayload = UpdateMessageDto & {
  messageId?: string;
};

type CreateChatWSPayload = CreateChatDto;
@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatWSController implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatWSController.name);

  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly facade: FacadePort,
    private readonly socket: WSService,
    private readonly authToken: AuthTokenService,
  ) {}

  afterInit(server: Server): void {
    this.socket.bindServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        this.authToken.extractBearer(client.handshake.headers?.authorization as string | undefined);

      if (!token) return this.reject(client, 'Unauthorized');

      let payload: AccessJwtPayload;
      try {
        payload = await this.authToken.verifyAccessToken(token);
      } catch (error) {
        return this.reject(client, 'Invalid token');
      }

      client.data.userId = payload.sub;
      client.join(this.socket.userRoom(payload.sub));
      this.logger.log(`Client connected: ${client.id}, userId: ${payload.sub}`);

      let cursor: string | undefined;

      do {
        const userChats = await this.facade.getListChats({
          actorUserId: payload.sub,
          limit: 10,
          cursor,
          includeArchived: false,
        });

        for (const item of userChats.chats) {
          if (item.chat?.id) client.join(this.socket.chatRoom(item.chat.id));
        }
        cursor = userChats.nextCursor;
      } while (cursor);

      return;
    } catch (err) {
      this.logger.error(`Connection error: ${this.getErrorMessage(err)}`);
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}, userId: ${client.data.userId}`);
  }

  @SubscribeMessage('message.send')
  async handleSend(@ConnectedSocket() client: Socket, @MessageBody() body: SendMessageWsPayload) {
    const userId = client.data.userId;
    if (!userId) throw new WsException('Unauthorized');
    if (!body.chatId) throw new WsException('ChatId required');
    if (!body.text?.trim()) throw new WsException('Text required');

    try {
      const view = await this.facade.sendMessage({
        requestId: body.requestId,
        chatId: body.chatId,
        authorId: userId,
        kind: body.kind,
        text: body.text,
        replyToId: body.replyToId,
      });

      this.server.to(this.socket.chatRoom(body.chatId)).emit('message.new', view);
      return view;
    } catch (err) {
      this.logger.error(`Failed to send message: ${this.getErrorMessage(err)}`);
      throw new WsException(`Send failed: ${this.getErrorMessage(err)}`);
    }
  }

  @SubscribeMessage('message.edit')
  async handleEdit(@ConnectedSocket() client: Socket, @MessageBody() body: UpdateMessageWsPayload) {
    const userId = client.data.userId;

    if (!userId) throw new WsException('Unauthorized');
    if (!body.messageId) throw new WsException('Message id required');
    if (!body.text?.trim()) throw new WsException('Text required');

    try {
      const view = await this.facade.updateMessage({
        messageId: body.messageId,
        authorId: userId,
        text: body.text,
      });

      this.server.to(this.socket.chatRoom(view.chatId)).emit('message.edited', view);
      return view;
    } catch (err) {
      this.logger.error(`Failed to edit message: ${this.getErrorMessage(err)}`);
      throw new WsException(`Edit failed: ${this.getErrorMessage(err)}`);
    }
  }

  @SubscribeMessage('chat.create')
  async handleCreate(@ConnectedSocket() client: Socket, @MessageBody() body: CreateChatWSPayload) {
    const userId = client.data.userId;

    if (!userId) throw new WsException('Unauthorized');

    const chat = await this.facade.createChat({
      actorUserId: userId,
      participantUserIds: body.participantUserIds,
      type: body.type,
      title: body.title,
      avatarUrl: body.avatarUrl,
      requestId: body.requestId,
    });

    const chatId = chat.chat?.id;

    if (chatId) {
      const participantIds = chat.participants.map((p) => p.userId);
      for (const userId of participantIds) {
        this.socket.joinUserSocketsTochat(userId, chatId);
        this.socket.emitToUser(userId, 'chat.created', chat);
      }
    }
    return chat;
  }

  emitToChat(chatId: string, event: string, payload: unknown) {
    this.socket.emitToChat(chatId, event, payload);
  }

  private reject(client: Socket, reason: string) {
    client.emit('exception', { message: reason });
    client.disconnect();
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
