/**
 * Rate limiter general para toda la API
 *
 * Solo se aplica en producción (NODE_ENV === "production")
 */
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter para endpoints de autenticación
 *
 * Más restrictivo para prevenir ataques de fuerza bruta.
 * Solo se aplica en producción (NODE_ENV === "production")
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rate-limiter.d.ts.map