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
/**
 * Rate limiter estricto para creación de Payment Intent
 *
 * Menos solicitudes permitidas que el límite general para reducir abuso
 * y carga en Stripe. Solo se aplica en producción.
 */
export const paymentCreateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // 10 creaciones de pago por minuto por IP
    message: 'Demasiadas solicitudes de creación de pago. Intenta nuevamente en un minuto.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env['NODE_ENV'] !== 'production',
});
/**
 * Rate limiter para creación de suscripciones
 *
 * Limita solicitudes para reducir abuso y carga en Stripe.
 * Solo se aplica en producción.
 */
export const subscriptionCreateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // 10 creaciones de suscripción por minuto por IP
    message: 'Demasiadas solicitudes de creación de suscripción. Intenta nuevamente en un minuto.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env['NODE_ENV'] !== 'production',
});
/**
 * Rate limiter para cambio de plan de suscripción
 *
 * Limita solicitudes para reducir abuso y carga en Stripe.
 * Solo se aplica en producción.
 */
export const subscriptionChangePlanLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // 10 cambios de plan por minuto por IP
    message: 'Demasiadas solicitudes de cambio de plan. Intenta nuevamente en un minuto.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env['NODE_ENV'] !== 'production',
});
/**
 * Rate limiter para recuperación de contraseña (forgot-password)
 *
 * Limita solicitudes para evitar abuso y envío masivo de emails.
 */
export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3, // 3 intentos por 15 minutos por IP
    message: 'Demasiados intentos de recuperación de contraseña. Intenta nuevamente en 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env['NODE_ENV'] !== 'production',
});
/**
 * Rate limiter para reenviar email de verificación
 *
 * Limita solicitudes para evitar abuso y envío masivo de emails.
 */
export const resendVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3, // 3 intentos por 15 minutos por IP
    message: 'Demasiados intentos de reenvío. Intenta nuevamente en 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env['NODE_ENV'] !== 'production',
});
/**
 * Rate limiter para el webhook de Stripe
 *
 * Stripe ya controla la frecuencia de envío; este límite protege contra
 * tráfico malicioso o repeticiones excesivas hacia nuestro endpoint.
 * Solo se aplica en producción.
 */
export const webhookLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 200, // 200 eventos por minuto por IP (Stripe puede enviar varios por transacción)
    message: 'Demasiadas solicitudes al webhook. Intenta nuevamente más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env['NODE_ENV'] !== 'production',
});
//# sourceMappingURL=rate-limiter.js.map