import NodeCache from 'node-cache';
import { logger } from '../../shared/logger/index.js';
export class MemoryClient {
    client;
    constructor() {
        this.client = new NodeCache({
            checkperiod: 120, // Verificar expiración cada 2 minutos
            useClones: false, // No clonar objetos para mejor performance
        });
        logger.info('Memory Cache Client Initialized');
    }
    async get(key) {
        try {
            const data = this.client.get(key);
            return data || null;
        }
        catch (error) {
            logger.error({ key, error }, 'Memory Cache GET Error');
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            if (ttl) {
                this.client.set(key, value, ttl);
            }
            else {
                this.client.set(key, value);
            }
        }
        catch (error) {
            logger.error({ key, error }, 'Memory Cache SET Error');
        }
    }
    async del(key) {
        try {
            if (Array.isArray(key)) {
                this.client.del(key);
            }
            else {
                this.client.del(key);
            }
        }
        catch (error) {
            logger.error({ key, error }, 'Memory Cache DEL Error');
        }
    }
    async flush() {
        try {
            this.client.flushAll();
        }
        catch (error) {
            logger.error({ error }, 'Memory Cache FLUSH Error');
        }
    }
    async disconnect() {
        try {
            this.client.close();
            logger.info('Memory Cache Client Disconnected');
        }
        catch (error) {
            logger.error({ error }, 'Memory Cache DISCONNECT Error');
        }
    }
}
//# sourceMappingURL=memoryClient.js.map