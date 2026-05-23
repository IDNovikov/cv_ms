import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AddMembersDto,
  CreateChatDto,
  ListChatsDto,
  ListMessagesDto,
  MarkAsReadDto,
  MuteChatDto,
  SendMessageDto,
  UpdateChatDto,
  UpdateMessageDto,
} from '../DTO';
import { ChatType, MessageKind } from '@noildm/contracts/dist/gen/chat';

const success = (data: unknown) => ({
  success: true,
  data,
  timestamp: '2026-05-06T10:00:00.000Z',
  path: '/api/chat',
  method: 'GET',
});

const error = (statusCode: number, code: string, message: string, details?: unknown) => ({
  success: false,
  error: {
    statusCode,
    error:
      {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        409: 'Conflict',
      }[statusCode] ?? 'Error',
    code,
    message,
    ...(details !== undefined ? { details } : {}),
  },
  timestamp: '2026-05-06T10:00:00.000Z',
  path: '/api/chat',
  method: 'GET',
});

const chatExample = {
  chat: {
    id: '018f2b9d-1a2b-7000-8000-000000000001',
    type: ChatType.DIRECT,
    title: 'Project chat',
    avatarUrl: 'https://cdn.example.com/chat.png',
    createdById: '018f2b9d-1a2b-7000-8000-000000000100',
    lastMessageId: '018f2b9d-1a2b-7000-8000-000000000010',
    lastMessageAt: { seconds: '1778061600', nanos: 0 },
    createdAt: { seconds: '1778061000', nanos: 0 },
    updatedAt: { seconds: '1778061600', nanos: 0 },
  },
  myState: {
    role: 'OWNER',
    joinedAt: { seconds: '1778061000', nanos: 0 },
    lastReadMessageId: '018f2b9d-1a2b-7000-8000-000000000010',
    lastReadAt: { seconds: '1778061600', nanos: 0 },
  },
  participants: [
    {
      userId: '018f2b9d-1a2b-7000-8000-000000000100',
      role: 'OWNER',
      joinedAt: { seconds: '1778061000', nanos: 0 },
    },
  ],
  lastMessage: {
    id: '018f2b9d-1a2b-7000-8000-000000000010',
    chatId: '018f2b9d-1a2b-7000-8000-000000000001',
    authorId: '018f2b9d-1a2b-7000-8000-000000000100',
    kind: MessageKind.TEXT,
    text: 'Hello',
    isEdited: false,
    createdAt: { seconds: '1778061600', nanos: 0 },
    updatedAt: { seconds: '1778061600', nanos: 0 },
  },
  unreadCount: 0,
};

const commonErrors = [
  ApiBadRequestResponse({
    schema: {
      example: error(400, 'BAD_REQUEST', 'Validation failed', [
        {
          field: 'limit',
          constraints: {
            max: 'limit must not be greater than 100',
          },
        },
      ]),
    },
  }),
  ApiUnauthorizedResponse({
    schema: {
      example: error(401, 'UNAUTHORIZED', 'Unauthorized'),
    },
  }),
  ApiForbiddenResponse({
    schema: {
      example: error(403, 'FORBIDDEN', 'Forbidden'),
    },
  }),
  ApiNotFoundResponse({
    schema: {
      example: error(404, 'NOT_FOUND', 'Chat not found'),
    },
  }),
  ApiConflictResponse({
    schema: {
      example: error(409, 'CONFLICT', 'Chat operation conflict'),
    },
  }),
];

export class ChatSwagger {
  static CreateChat = [
    ApiOperation({ summary: 'Create chat' }),
    ApiBearerAuth('access_token'),
    ApiBody({ type: CreateChatDto }),
    ApiOkResponse({ schema: { example: success(chatExample) } }),
    ...commonErrors,
  ];

  static GetChat = [
    ApiOperation({ summary: 'Get chat details' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiOkResponse({ schema: { example: success(chatExample) } }),
    ...commonErrors,
  ];

  static UpdateChat = [
    ApiOperation({ summary: 'Update chat profile' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiBody({ type: UpdateChatDto }),
    ApiOkResponse({ schema: { example: success(chatExample) } }),
    ...commonErrors,
  ];

  static DeleteChat = [
    ApiOperation({ summary: 'Delete chat' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiOkResponse({ schema: { example: success({}) } }),
    ...commonErrors,
  ];

  static ListChats = [
    ApiOperation({ summary: 'List my chats' }),
    ApiBearerAuth('access_token'),
    ApiQuery({ type: ListChatsDto, required: false }),
    ApiOkResponse({
      schema: {
        example: success({
          chats: [{ ...chatExample, participants: undefined }],
          nextCursor: '2026-05-06T10:00:00.000Z',
        }),
      },
    }),
    ...commonErrors,
  ];

  static GetChatMembers = [
    ApiOperation({ summary: 'Get chat members' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiQuery({ type: ListMessagesDto, required: false }),
    ApiOkResponse({
      schema: {
        example: success({
          participants: chatExample.participants,
          nextCursor: '2026-05-06T10:00:00.000Z',
        }),
      },
    }),
    ...commonErrors,
  ];

  static AddMembers = [
    ApiOperation({ summary: 'Add members to chat' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiBody({ type: AddMembersDto }),
    ApiOkResponse({ schema: { example: success({}) } }),
    ...commonErrors,
  ];

  static RemoveMember = [
    ApiOperation({ summary: 'Remove member from chat' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiParam({ name: 'userId', example: '018f2b9d-1a2b-7000-8000-000000000101' }),
    ApiOkResponse({ schema: { example: success({}) } }),
    ...commonErrors,
  ];

  static LeaveChat = [
    ApiOperation({ summary: 'Leave chat' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiOkResponse({ schema: { example: success({}) } }),
    ...commonErrors,
  ];

  static ArchiveChat = [
    ApiOperation({ summary: 'Archive chat for current user' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiOkResponse({ schema: { example: success({}) } }),
    ...commonErrors,
  ];

  static UnarchiveChat = [
    ApiOperation({ summary: 'Unarchive chat for current user' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiOkResponse({ schema: { example: success({}) } }),
    ...commonErrors,
  ];

  static MuteChat = [
    ApiOperation({ summary: 'Mute chat for current user' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiBody({ type: MuteChatDto }),
    ApiOkResponse({ schema: { example: success({}) } }),
    ...commonErrors,
  ];

  static UnmuteChat = [
    ApiOperation({ summary: 'Unmute chat for current user' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiOkResponse({ schema: { example: success({}) } }),
    ...commonErrors,
  ];

  static SendMessage = [
    ApiOperation({ summary: 'Send message' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiBody({ type: SendMessageDto }),
    ApiOkResponse({ schema: { example: success(chatExample.lastMessage) } }),
    ...commonErrors,
  ];

  static UpdateMessage = [
    ApiOperation({ summary: 'Update message' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'messageId', example: '018f2b9d-1a2b-7000-8000-000000000010' }),
    ApiBody({ type: UpdateMessageDto }),
    ApiOkResponse({
      schema: {
        example: success({ ...chatExample.lastMessage, text: 'Edited message', isEdited: true }),
      },
    }),
    ...commonErrors,
  ];

  static DeleteMessage = [
    ApiOperation({ summary: 'Delete message' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'messageId', example: '018f2b9d-1a2b-7000-8000-000000000010' }),
    ApiOkResponse({ schema: { example: success({}) } }),
    ...commonErrors,
  ];

  static ListMessages = [
    ApiOperation({ summary: 'List chat messages' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiQuery({ type: ListMessagesDto, required: false }),
    ApiOkResponse({
      schema: {
        example: success({
          messages: [chatExample.lastMessage],
          nextCursor: '2026-05-06T10:00:00.000Z',
        }),
      },
    }),
    ...commonErrors,
  ];

  static MarkAsRead = [
    ApiOperation({ summary: 'Mark chat as read' }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'chatId', example: '018f2b9d-1a2b-7000-8000-000000000001' }),
    ApiBody({ type: MarkAsReadDto }),
    ApiOkResponse({ schema: { example: success({}) } }),
    ...commonErrors,
  ];
}
