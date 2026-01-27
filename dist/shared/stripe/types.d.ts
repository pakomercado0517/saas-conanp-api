/**
 * Tipos TypeScript para el módulo de Stripe
 */
/**
 * Configuración de Stripe
 */
export interface StripeConfig {
    /** Clave secreta de Stripe (obligatoria) */
    secretKey: string;
    /** Secreto del webhook de Stripe (obligatorio) */
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