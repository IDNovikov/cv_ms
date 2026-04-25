import { ChatDetails, ChatListItem } from '@noildm/contracts/dist/gen/chat';
import {
  ChatDetailsView,
  ChatListItemView,
} from 'src/modules/chat/application';
import { toGrpcChat } from './toGrpcChat.mapper';
import { toGrpcMessage } from './toGrpcMessage.mapper';
import { toGrpcChatParticipant } from './toGrpcChatParticipant.mapper';
import { toGrpcChatUserState } from './toGrpcChatUserState.mapper';

export function toGrpcChatDetails(view: ChatDetailsView): ChatDetails {
  return {
    chat: toGrpcChat(view.chat),
    myState: toGrpcChatUserState(view.myState),
    participants: view.participants.map((member) =>
      toGrpcChatParticipant(member),
    ),
    lastMessage: view.lastMessage ? toGrpcMessage(view.lastMessage) : undefined,
    unreadCount: view.unreadCount,
  };
}

export function toGrpcChatListItem(view: ChatListItemView): ChatListItem {
  return {
    chat: toGrpcChat(view.chat),
    myState: toGrpcChatUserState(view.myState),
    lastMessage: view.lastMessage ? toGrpcMessage(view.lastMessage) : undefined,
    unreadCount: view.unreadCount,
  };
}
