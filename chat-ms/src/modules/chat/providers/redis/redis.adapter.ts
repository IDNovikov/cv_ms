import { RedisService } from 'src/modules/core/redis/redis.service';
import { RedisServicePort } from './redis.port';
import { Injectable } from '@nestjs/common';
import {
  DependencyUnavailableError,
  PersistenceError,
} from 'src/common/errors';

@Injectable()
export class RedisServiceAdapter extends RedisServicePort {
  constructor(private readonly client: RedisService) {
    super();
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const v = await this.client.raw.get(key);
      return v ? (JSON.parse(v) as T) : null;
    } catch (error) {
      throw new DependencyUnavailableError(
        'redis',
        { operation: 'get', key },
        error,
      );
    }
  }

  async set(key: string, value: unknown, ttlSec = 60) {
    try {
      await this.client.raw.set(key, JSON.stringify(value), 'EX', ttlSec);
    } catch (error) {
      throw new DependencyUnavailableError(
        'redis',
        { operation: 'set', key },
        error,
      );
    }
  }
  async del(key: string): Promise<any> {
    try {
      const deleted = await this.client.raw.del(key);
      return deleted;
    } catch (error) {
      throw new DependencyUnavailableError(
        'redis',
        { operation: 'del', key },
        error,
      );
    }
  }

  async getMany<T = unknown>(
    key: string,
  ): Promise<{ key: string; value: T | null }[]> {
    try {
      const pattern = `${key}:*`;
      let cursor = '0';
      const keys: string[] = [];

      do {
        const [newCursor, foundKeys] = await this.client.raw.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = newCursor;
        keys.push(...foundKeys);
      } while (cursor !== '0');

      if (keys.length === 0) return [];

      const values = await this.client.raw.mget(keys);

      return keys.map((itemKey, i) => {
        const raw = values[i];
        let parsed: T | null = null;

        if (raw) {
          try {
            parsed = JSON.parse(raw) as T;
          } catch (error) {
            throw new PersistenceError(
              'Failed to parse JSON from Redis',
              { operation: 'getMany', key: itemKey },
              error,
            );
          }
        }

        return { key: itemKey, value: parsed };
      });
    } catch (error) {
      if (error instanceof PersistenceError) throw error;
      throw new DependencyUnavailableError(
        'redis',
        { operation: 'getMany', key },
        error,
      );
    }
  }

  async delMany(key: string): Promise<void> {
    try {
      const pattern = `${key}:*`;
      let cursor = '0';
      do {
        const [newCursor, foundKeys] = await this.client.raw.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = newCursor;
        if (foundKeys.length > 0) {
          await this.client.raw.del(...foundKeys);
        }
      } while (cursor !== '0');
    } catch (error) {
      throw new DependencyUnavailableError(
        'redis',
        { operation: 'delMany', key },
        error,
      );
    }
  }
}
