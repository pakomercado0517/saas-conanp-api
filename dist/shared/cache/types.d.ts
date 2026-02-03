export interface CacheConfig {
    enabled: boolean;
    redisUrl: string | undefined;
    ttl: {
        subscription: number;
        subscriptionPlan: number;
        actividad: number;
        organization: number;
    };
}
export interface CacheClient {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string | string[]): Promise<void>;
    flush(): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map