export interface IMessage {
  requestId: string;
  id: string;
  chatId: string;
  authorId: string;
  kind: 'TEXT' | 'SYSTEM';
  text: string;
  isEdited: boolean;
  editedAt: Date | null;
  deletedAt: Date | null;
  replyToId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageInput {
  requestId: IMessage['requestId'];
  chatId: IMessage['chatId'];
  authorId: IMessage['authorId'];
  kind?: IMessage['kind'];
  text: IMessage['text'];
  replyToId?: IMessage['replyToId'];
}

export interface EditMessageInput {
  id: IMessage['id'];
  authorId: IMessage['authorId'];
  text: IMessage['text'];
}

export interface DeleteMessageInput {
  id: IMessage['id'];
  authorId: IMessage['authorId'];
}
