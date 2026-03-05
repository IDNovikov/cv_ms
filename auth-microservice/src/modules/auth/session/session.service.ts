import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  ISessionData,
  RawRedisToken,
  StrictRedisToken,
} from '../shared/types/session.types';
import { ConfigService } from '@nestjs/config';
import { parseTTL } from '../shared/utils/parseTTL';
import { RedisServicePort } from '../providers/redis/redis.port';
import { redisRefreshString } from '../shared/utils/redisRefreshString.utol';
import { RedisRefreshValue } from '../shared/types/auth.types';

export type parsedData = {
  userId?: string;
  deviceId: string;
  session: ISessionData;
};

@Injectable()
export class SessionsService {
  private _access_token_expires;
  constructor(
    private redis: RedisServicePort,
    private cfg: ConfigService,
  ) {
    this._access_token_expires = this.cfg.get('JWT_EXPIRES');
  }

  private toStrict(tokens: RawRedisToken[]): StrictRedisToken[] {
    return tokens.filter((t): t is StrictRedisToken => t.value !== null);
  }

  async closeSession(
    jti: string,
    userId: string,
    deviceId: string,
  ): Promise<void> {
    const deleted = await this.redis.del(redisRefreshString(userId, deviceId));
    if (!deleted) throw new ForbiddenException('Token is not deleted');
    await this.redis.set(
      `blacklist:${jti}`,
      1,
      parseTTL(this._access_token_expires),
    );
  }

  parseSessionsData(
    data: StrictRedisToken[],
    withUserId: boolean = false,
  ): parsedData[] {
    return data.map((el) => {
      const result = {} as parsedData;

      if (el.key) {
        const parts = el.key.split(':');
        if (withUserId) {
          result.userId = parts[1];
        }
        result.deviceId = parts[2];
      }
      if (el.value?.sessionData) {
        result.session = el.value?.sessionData;
      }

      return result;
    });
  }

  async getSessions(): Promise<StrictRedisToken[]>;
  async getSessions(userId: string): Promise<StrictRedisToken[]>;
  async getSessions(
    userId: string,
    deviceId: string,
  ): Promise<StrictRedisToken>;
  async getSessions(
    userId?: string,
    deviceId?: string,
  ): Promise<StrictRedisToken[] | StrictRedisToken> {
    if (userId === undefined && deviceId === undefined) {
      const raw = await this.redis.getMany<RedisRefreshValue>('refreshToken');

      const strict = this.toStrict(raw);
      if (!strict.length) throw new ForbiddenException('Sessions not found');

      return strict;
    }
    if (userId !== undefined && deviceId === undefined) {
      const raw = await this.redis.getMany<RedisRefreshValue>(
        redisRefreshString(userId),
      );

      const strict = this.toStrict(raw);
      if (!strict.length) throw new ForbiddenException('Sessions not found');

      return strict;
    }

    if (userId !== undefined && deviceId !== undefined) {
      const key = redisRefreshString(userId, deviceId);
      const value = await this.redis.get<RedisRefreshValue>(key);

      if (value === null) throw new ForbiddenException('Sessions not found');

      return { key, value };
    }

    throw new ForbiddenException('Sessions not found');
  }

  keyParser(redisTokenKey: string): { userId: string; deviceId: string } {
    const parts = redisTokenKey.split(':');
    return { userId: parts[1], deviceId: parts[2] };
  }
}
