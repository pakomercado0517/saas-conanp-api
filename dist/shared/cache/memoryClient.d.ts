import type { CacheClient } from './types.js';
export declare class MemoryClient implements CacheClient {
    private client;
    constructor();
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string | string[]): Promise<void>;
    flush(): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=memoryClient.d.ts.map