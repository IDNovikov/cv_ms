export interface IChat {
  id: string;
  requestId: string;
  type: 'DIRECT' | 'GROUP';
  title: string | null;
  avatarUrl: string | null;
  directKey: string | null;
  createdById: string;
  lastMessageId: string | null;
  lastMessageAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChatInput {
  requestId: IChat['requestId'];
  type: IChat['type'];
  createdById: IChat['createdById'];
  title?: IChat['title'];
  avatarUrl?: IChat['avatarUrl'];
  directKey?: IChat['directKey'];
}

export interface UpdateChatProfileInput {
  id: IChat['id'];
  title?: IChat['title'];
  avatarUrl?: IChat['avatarUrl'];
}

export interface TouchLastMessageInput {
  messageId: NonNullable<IChat['lastMessageId']>;
  messageCreatedAt: Date;
}

export interface DeleteChatInput {
  id: IChat['id'];
  actorId: IChat['createdById'];
}
