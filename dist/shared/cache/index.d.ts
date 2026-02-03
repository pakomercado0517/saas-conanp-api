/**
 * Cliente de caché singleton - usa Redis en producción, memoria en dev/tests
 */
declare class CacheService {
    private client;
    private isInitialized;
    /**
     * Inicializa el cliente de caché según la configuración
     */
    initialize(): void;
    /**
     * Obtiene un valor del caché
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Almacena un valor en caché con TTL opcional
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Elimina una o varias keys del caché
     */
    del(key: string | string[]): Promise<void>;
    /**
     * Limpia todo el caché (útil para tests)
     */
    flush(): Promise<void>;
    /**
     * Cierra la conexión del cliente (cleanup en shutdown)
     */
    disconnect(): Promise<void>;
    /**
     * Verifica si el caché está habilitado y funcionando
     */
    isEnabled(): boolean;
}
export declare const cache: CacheService;
export {};
//# sourceMappingURL=index.d.ts.map