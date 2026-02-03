import type { CacheClient } from './types.js';
import { RedisClient } from './redisClient.js';
import { MemoryClient } from './memoryClient.js';
import { cacheConfig } from './config.js';
import { logger } from '@/shared/logger/index.js';

/**
 * Cliente de caché singleton - usa Redis en producción, memoria en dev/tests
 */
class CacheService {
  private client: CacheClient | null = null;
  private isInitialized = false;

  /**
   * Inicializa el cliente de caché según la configuración
   */
  initialize(): void {
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
      } else {
        this.client = new MemoryClient();
        logger.info('Cache initialized with Memory (node-cache)');
      }
      this.isInitialized = true;
    } catch (error) {
      logger.error({ error }, 'Failed to initialize cache');
      this.client = null;
    }
  }

  /**
   * Obtiene un valor del caché
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    return this.client.get<T>(key);
  }

  /**
   * Almacena un valor en caché con TTL opcional
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.client) return;
    await this.client.set(key, value, ttl);
  }

  /**
   * Elimina una o varias keys del caché
   */
  async del(key: string | string[]): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  /**
   * Limpia todo el caché (útil para tests)
   */
  async flush(): Promise<void> {
    if (!this.client) return;
    await this.client.flush();
  }

  /**
   * Cierra la conexión del cliente (cleanup en shutdown)
   */
  async disconnect(): Promise<void> {
    if (!this.client) return;
    await this.client.disconnect();
    this.client = null;
    this.isInitialized = false;
  }

  /**
   * Verifica si el caché está habilitado y funcionando
   */
  isEnabled(): boolean {
    return cacheConfig.enabled && this.client !== null;
  }
}

// Exportar instancia singleton
export const cache = new CacheService();
