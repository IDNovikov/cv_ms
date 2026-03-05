import IORedis, { RedisOptions } from 'ioredis';

export class RedisService {
  private client: IORedis;
  constructor(opts: RedisOptions) {
    this.client = new IORedis(opts);
  }
  get raw() {
    return this.client;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }
}
