import { Timestamp } from '@noildm/contracts/dist/gen/google/protobuf/timestamp';

export class MuteChatDto {
  chatId: string;
  actorUserId: string;
  mutedUntil?: Date | Timestamp;
}
