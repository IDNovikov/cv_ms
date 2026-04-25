import { Timestamp } from '@noildm/contracts/dist/gen/google/protobuf/timestamp';

export function toTimestamp(date: Date): Timestamp {
  const milliseconds = date.getTime();
  return {
    seconds: Math.trunc(milliseconds / 1000),
    nanos: (milliseconds % 1000) * 1_000_000,
  };
}
