import rateLimit from 'express-rate-limit';
/**
 * Rate limiter general para toda la API
 *
 * Solo se aplica en producción (NODE_ENV === "production")
 */
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // 100 requests por minuto
    message: 'Demasiadas solicitudes. Intenta nuevamente en un minuto.',
    standardHeaders: true, // Retorna rate limit info en headers `RateLimit-*`
    legacyHeaders: false, // No retorna `X-RateLimit-*` headers
    skip: () => process.env['NODE_ENV'] !== 'production', // Solo en producción
});
/**
 * Rate limiter para endpoints de autenticación
 *
 * Más restrictivo para prevenir ataques de fuerza bruta.
 * Solo se aplica en producción (NODE_ENV === "production")
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por 15 minutos
    message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env['NODE_ENV'] !== 'production', // Solo en producción
});
//# sourceMappingURL=rate-limiter.js.map