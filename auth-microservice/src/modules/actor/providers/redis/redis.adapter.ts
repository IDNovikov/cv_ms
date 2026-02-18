import { RedisService } from 'src/modules/core/redis/redis.service';
import { RedisServicePort } from './redis.port';

export class RedisServiceAdapter {
  private constructor(private readonly client: RedisService) {}

  async get<T = unknown>(key: string): Promise<T | null> {
    const v = await this.client.raw.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }

  async set(key: string, value: unknown, ttlSec = 60) {
    await this.client.raw.set(key, JSON.stringify(value), 'EX', ttlSec);
  }
  async del(key: string): Promise<any> {
    const deleted = await this.client.raw.del(key);
    return deleted;
  }

  async getMany<T = unknown>(
    key: string,
  ): Promise<{ key: string; value: T | null }[]> {
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

    return keys.map((key, i) => {
      const raw = values[i];
      let parsed: T;

      parsed = raw ? JSON.parse(raw) : null;

      return { key, value: parsed as T | null };
    });
  }

  async delMany(key: string): Promise<void> {
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
  }
}
