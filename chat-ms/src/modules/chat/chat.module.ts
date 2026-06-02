import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AmqpModule } from '../core/amqp/amqp.module';
import { PrismaModule } from '../core/prisma/prisma.module';
import { RedisModule } from '../core/redis/redis.module';
import { ChatGrpcController } from './api/gRPC/chat.grpc.controller';
import { ChatApplicationSupport, ChatFacade } from './application';
import { AddMembersHandler } from './application/commands/add-members/add-members.handler';
import { ArchiveChatHandler } from './application/commands/archive-chat/archive-chat.handler';
import { CreateChatHandler } from './application/commands/create-chat/create-chat.handler';
import { DeleteChatHandler } from './application/commands/delete-chat/delete-chat.handler';
import { DeleteMessageHandler } from './application/commands/delete-message/delete-message.handler';
import { LeaveChatHandler } from './application/commands/leave-chat/leave-chat.handler';
import { MarkAsReadHandler } from './application/commands/mark-as-read/mark-as-read.handler';
import { MuteChatHandler } from './application/commands/mute-chat/mute-chat.handler';
import { RemoveMemberHandler } from './application/commands/remove-member/remove-member.handler';
import { SendMessageHandler } from './application/commands/send-message/send-message.handler';
import { UnarchiveChatHandler } from './application/commands/unarchive-chat/unarchive-chat.handler';
import { UnmuteChatHandler } from './application/commands/unmute-chat/unmute-chat.handler';
import { UpdateChatHandler } from './application/commands/update-chat/update-chat.handler';
import { UpdateMessageHandler } from './application/commands/update-message/update-message.handler';
import { GetChatHandler } from './application/queries/get-chat/get-chat.handler';
import { GetChatMembersHandler } from './application/queries/get-chat-members/get-chat-members.handler';
import { ListChatsHandler } from './application/queries/list-chats/list-chats.handler';
import { ListMessagesHandler } from './application/queries/list-messages/list-messages.handler';
import { RabbitServiceAdapter } from './providers/amqp/amqp.adapter';
import { ChatDBAdapter } from './providers/prisma/prisma.adapter';
import {
  AuthGrpcPort,
  ChatDBPort,
  RabbitServicePort,
  RedisServicePort,
} from './providers';
import { RedisServiceAdapter } from './providers/redis/redis.adapter';
import { ClientsModule } from '@nestjs/microservices';
import { AuthGrpcClient } from 'src/common/config/auth-grpc.client';
import { FacadeAdapter as AuthGrpcAdapter } from './providers/auth-grpc/auth-grpc.adapter';
import { UserCreatedSendMailHandler } from './application/events/create-chat/create-chat.handler';

const commandHandlers = [
  AddMembersHandler,
  ArchiveChatHandler,
  CreateChatHandler,
  DeleteChatHandler,
  DeleteMessageHandler,
  LeaveChatHandler,
  MarkAsReadHandler,
  MuteChatHandler,
  RemoveMemberHandler,
  SendMessageHandler,
  UnarchiveChatHandler,
  UnmuteChatHandler,
  UpdateChatHandler,
  UpdateMessageHandler,
];

const queryHandlers = [
  GetChatHandler,
  GetChatMembersHandler,
  ListChatsHandler,
  ListMessagesHandler,
];

const eventHandlers = [UserCreatedSendMailHandler];

@Module({
  imports: [
    CqrsModule,
    PrismaModule,
    RedisModule,
    AmqpModule,
    ClientsModule.registerAsync([AuthGrpcClient]),
  ],
  controllers: [ChatGrpcController],
  providers: [
    ChatFacade,
    ChatApplicationSupport,
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    { provide: ChatDBPort, useClass: ChatDBAdapter },
    { provide: RabbitServicePort, useClass: RabbitServiceAdapter },
    { provide: RedisServicePort, useClass: RedisServiceAdapter },
    { provide: AuthGrpcPort, useClass: AuthGrpcAdapter },
  ],
})
export class ChatModule {}
