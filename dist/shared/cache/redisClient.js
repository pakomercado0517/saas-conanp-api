import Redis from 'ioredis';
import { logger } from '../../shared/logger/index.js';
export class RedisClient {
    client;
    constructor(redisUrl) {
        this.client = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
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
    async get(key) {
        try {
            const data = await this.client.get(key);
            if (!data)
                return null;
            return JSON.parse(data);
        }
        catch (error) {
            logger.error({ key, error }, 'Redis GET Error');
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const serialized = JSON.stringify(value);
            if (ttl) {
                await this.client.setex(key, ttl, serialized);
            }
            else {
                await this.client.set(key, serialized);
            }
        }
        catch (error) {
            logger.error({ key, error }, 'Redis SET Error');
        }
    }
    async del(key) {
        try {
            if (Array.isArray(key)) {
                if (key.length > 0) {
                    await this.client.del(...key);
                }
            }
            else {
                await this.client.del(key);
            }
        }
        catch (error) {
            logger.error({ key, error }, 'Redis DEL Error');
        }
    }
    async flush() {
        try {
            await this.client.flushdb();
        }
        catch (error) {
            logger.error({ error }, 'Redis FLUSH Error');
        }
    }
    async disconnect() {
        try {
            await this.client.quit();
        }
        catch (error) {
            logger.error({ error }, 'Redis DISCONNECT Error');
        }
    }
}
//# sourceMappingURL=redisClient.js.map