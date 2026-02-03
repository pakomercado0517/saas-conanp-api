export interface CacheConfig {
  enabled: boolean;
  redisUrl: string | undefined;
  ttl: {
    subscription: number; // TTL para suscripciones activas (segundos)
    subscriptionPlan: number; // TTL para planes de suscripción (segundos)
    actividad: number; // TTL para actividades activas (segundos)
    organization: number; // TTL para configuraciones de organización (segundos)
  };
}

export interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string | string[]): Promise<void>;
  flush(): Promise<void>;
  disconnect(): Promise<void>;
}
