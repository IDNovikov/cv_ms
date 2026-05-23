export * from './chat/chat.aggregate';
export * from './chat/chat.interface';
export * from './member/member.aggregate';
export * from './member/member.interface';
export * from './message/message.aggregate';
export * from './message/message.interface';

import { IMember } from './member/member.interface';
import { IMessage } from './message/message.interface';

export type ChatMemberRole = IMember['role'];
export type MessageKind = IMessage['kind'];
