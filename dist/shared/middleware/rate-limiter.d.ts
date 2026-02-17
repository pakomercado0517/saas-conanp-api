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
/**
 * Rate limiter estricto para creación de Payment Intent
 *
 * Menos solicitudes permitidas que el límite general para reducir abuso
 * y carga en Stripe. Solo se aplica en producción.
 */
export declare const paymentCreateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter para creación de suscripciones
 *
 * Limita solicitudes para reducir abuso y carga en Stripe.
 * Solo se aplica en producción.
 */
export declare const subscriptionCreateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter para cambio de plan de suscripción
 *
 * Limita solicitudes para reducir abuso y carga en Stripe.
 * Solo se aplica en producción.
 */
export declare const subscriptionChangePlanLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter para recuperación de contraseña (forgot-password)
 *
 * Limita solicitudes para evitar abuso y envío masivo de emails.
 */
export declare const forgotPasswordLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter para reenviar email de verificación
 *
 * Limita solicitudes para evitar abuso y envío masivo de emails.
 */
export declare const resendVerificationLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter para el webhook de Stripe
 *
 * Stripe ya controla la frecuencia de envío; este límite protege contra
 * tráfico malicioso o repeticiones excesivas hacia nuestro endpoint.
 * Solo se aplica en producción.
 */
export declare const webhookLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rate-limiter.d.ts.map