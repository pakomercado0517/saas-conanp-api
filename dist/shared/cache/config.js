export const cacheConfig = {
    enabled: process.env['CACHE_ENABLED'] === 'true',
    redisUrl: process.env['REDIS_URL'] ?? undefined,
    ttl: {
        subscription: parseInt(process.env['CACHE_TTL_SUBSCRIPTION'] || '600', 10), // 10 minutos por defecto
        subscriptionPlan: parseInt(process.env['CACHE_TTL_SUBSCRIPTION_PLAN'] || '3600', 10), // 1 hora por defecto
        actividad: parseInt(process.env['CACHE_TTL_ACTIVIDAD'] || '1800', 10), // 30 minutos por defecto
        organization: parseInt(process.env['CACHE_TTL_ORGANIZATION'] || '1800', 10), // 30 minutos por defecto
    },
};
//# sourceMappingURL=config.js.map