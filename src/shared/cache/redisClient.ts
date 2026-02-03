import Redis from 'ioredis';
import type { CacheClient } from './types.js';
import { logger } from '@/shared/logger/index.js';

export class RedisClient implements CacheClient {
  private client: Redis;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times): number => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (err) => {
      logger.error({ err }, 'Redis Client Error');
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error({ key, error }, 'Redis GET Error');
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error({ key, error }, 'Redis SET Error');
    }
  }

  async del(key: string | string[]): Promise<void> {
    try {
      if (Array.isArray(key)) {
        if (key.length > 0) {
          await this.client.del(...key);
        }
      } else {
        await this.client.del(key);
      }
    } catch (error) {
      logger.error({ key, error }, 'Redis DEL Error');
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (error) {
      logger.error({ error }, 'Redis FLUSH Error');
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      logger.error({ error }, 'Redis DISCONNECT Error');
    }
  }
}
