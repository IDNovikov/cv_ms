import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

export type ChatEventPayload = {
  chatId: string;
  messageId?: string;
  [key: string]: unknown;
};

@Injectable()
export class WSService {
  private readonly logger = new Logger(WSService.name);
  private server?: Server;

  bindServer(server: Server): void {
    this.server = server;
    this.logger.log('Socket.IO server bound to RealtimeService');
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server?.to(this.userRoom(userId)).emit(event, payload);
  }

  emitToChat(chatId: string, event: string, payload: unknown): void {
    this.server?.to(this.chatRoom(chatId)).emit(event, payload);
  }

  emitToUsers(userIds: string[], event: string, payload: unknown): void {
    for (const userId of userIds) {
      this.emitToUser(userId, event, payload);
    }
  }

  joinUserSocketsTochat(userId: string, chatId: string) {
    this.server?.in(this.userRoom(userId)).socketsJoin(this.chatRoom(chatId));
  }

  userRoom(userId: string): string {
    return `user:${userId}`;
  }

  chatRoom(chatId: string): string {
    return `chat:${chatId}`;
  }
}
