import { RedisClient } from './redisClient.js';
import { MemoryClient } from './memoryClient.js';
import { cacheConfig } from './config.js';
import { logger } from '../../shared/logger/index.js';
/**
 * Cliente de caché singleton - usa Redis en producción, memoria en dev/tests
 */
class CacheService {
    client = null;
    isInitialized = false;
    /**
     * Inicializa el cliente de caché según la configuración
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }
        if (!cacheConfig.enabled) {
            logger.info('Cache is disabled via CACHE_ENABLED=false');
            this.isInitialized = true;
            return;
        }
        try {
            if (cacheConfig.redisUrl) {
                this.client = new RedisClient(cacheConfig.redisUrl);
                logger.info('Cache initialized with Redis');
            }
            else {
                this.client = new MemoryClient();
                logger.info('Cache initialized with Memory (node-cache)');
            }
            this.isInitialized = true;
        }
        catch (error) {
            logger.error({ error }, 'Failed to initialize cache');
            this.client = null;
        }
    }
    /**
     * Obtiene un valor del caché
     */
    async get(key) {
        if (!this.client)
            return null;
        return this.client.get(key);
    }
    /**
     * Almacena un valor en caché con TTL opcional
     */
    async set(key, value, ttl) {
        if (!this.client)
            return;
        await this.client.set(key, value, ttl);
    }
    /**
     * Elimina una o varias keys del caché
     */
    async del(key) {
        if (!this.client)
            return;
        await this.client.del(key);
    }
    /**
     * Limpia todo el caché (útil para tests)
     */
    async flush() {
        if (!this.client)
            return;
        await this.client.flush();
    }
    /**
     * Cierra la conexión del cliente (cleanup en shutdown)
     */
    async disconnect() {
        if (!this.client)
            return;
        await this.client.disconnect();
        this.client = null;
        this.isInitialized = false;
    }
    /**
     * Verifica si el caché está habilitado y funcionando
     */
    isEnabled() {
        return cacheConfig.enabled && this.client !== null;
    }
}
// Exportar instancia singleton
export const cache = new CacheService();
//# sourceMappingURL=index.js.map