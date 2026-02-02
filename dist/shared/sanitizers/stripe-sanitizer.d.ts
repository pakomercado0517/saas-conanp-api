/**
 * Utilidades para sanitizar datos de Stripe antes de enviarlos en respuestas de API.
 * Evita exponer información sensible: tarjetas, secretos, PII.
 */
/** Claves que no deben exponerse (secretos, datos de tarjeta, PII) */
export declare const SENSITIVE_KEYS: Set<string>;
/**
 * Comprueba si una clave es sensible (no debe exponerse en respuestas ni logs).
 */
export declare const isSensitiveKey: (key: string) => boolean;
/**
 * Sanitiza un objeto recursivamente eliminando claves sensibles.
 * No modifica el objeto original.
 */
export declare const stripSensitiveKeys: (obj: Record<string, unknown>) => Record<string, unknown>;
//# sourceMappingURL=stripe-sanitizer.d.ts.map