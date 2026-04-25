import { Timestamp } from '@noildm/contracts/dist/gen/google/protobuf/timestamp';
import { toTimestamp } from './timeStamp.mapper';

export function toTimestampOrUndefined(
  date: Date | null,
): Timestamp | undefined {
  return date ? toTimestamp(date) : undefined;
}
