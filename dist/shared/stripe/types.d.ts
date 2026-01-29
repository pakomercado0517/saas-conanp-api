/**
 * Tipos TypeScript para el módulo de Stripe
 */
/**
 * Configuración de Stripe
 *
 * IMPORTANTE: secretKey y webhookSecret son datos sensibles.
 * Nunca loguear ni exponer stripeConfig en respuestas de API.
 */
export interface StripeConfig {
    /** Clave secreta de Stripe (obligatoria). No exponer en logs ni respuestas. */
    secretKey: string;
    /** Secreto del webhook de Stripe (obligatorio). No exponer en logs ni respuestas. */
    webhookSecret: string;
    /** Clave pública de Stripe (opcional, útil para frontend) */
    publishableKey?: string;
    /** Moneda por defecto (opcional, default: 'mxn') */
    currency: string;
    /** Versión de la API de Stripe (opcional) */
    apiVersion?: string;
    /** Región por defecto (opcional, default: 'mx') */
    region: string;
}
//# sourceMappingURL=types.d.ts.map