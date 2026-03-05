import { BadRequestException } from '@nestjs/common';
import { SessionData } from '@noildm/contracts/dist/gen/auth';
import { RedisRefreshValue } from './auth.types';

export type ISessionData = SessionData & {
  location: NonNullable<SessionData['location']>;
};

export function assertSessionData(
  sessionData: SessionData | undefined,
): asserts sessionData is ISessionData {
  if (!sessionData) {
    throw new BadRequestException('sessionData is required');
  }

  if (!sessionData.location) {
    throw new BadRequestException('sessionData.location is required');
  }
}

export type RawRedisToken = {
  key: string;
  value: RedisRefreshValue | null;
};

export type StrictRedisToken = {
  key: string;
  value: RedisRefreshValue;
};
