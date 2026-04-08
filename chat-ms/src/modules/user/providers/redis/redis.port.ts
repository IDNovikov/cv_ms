export abstract class RedisServicePort {
  abstract get<T = unknown>(key: string): Promise<T | null>;
  abstract set(key: string, value: unknown, ttlSec: number): Promise<void>;
  abstract del(key: string): Promise<any>;
  abstract getMany<T = unknown>(
    key: string,
  ): Promise<{ key: string; value: T | null }[]>;
  abstract delMany(key: string): Promise<void>;
}

