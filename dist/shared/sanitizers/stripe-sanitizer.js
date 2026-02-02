/**
 * Utilidades para sanitizar datos de Stripe antes de enviarlos en respuestas de API.
 * Evita exponer información sensible: tarjetas, secretos, PII.
 */
/** Claves que no deben exponerse (secretos, datos de tarjeta, PII) */
export const SENSITIVE_KEYS = new Set([
    'clientSecret',
    'client_secret',
    'secretKey',
    'secret_key',
    'apiKey',
    'api_key',
    'password',
    'cvc',
    'cvv',
    'card_number',
    'number', // en contexto de tarjeta
    'receipt_email',
    'fingerprint',
]);
/**
 * Comprueba si una clave es sensible (no debe exponerse en respuestas ni logs).
 */
export const isSensitiveKey = (key) => {
    const lower = key.toLowerCase();
    return (SENSITIVE_KEYS.has(key) ||
        SENSITIVE_KEYS.has(lower) ||
        lower.includes('secret') ||
        lower.includes('_secret') ||
        lower.includes('card_number') ||
        lower.includes('cvc') ||
        lower.includes('cvv'));
};
/**
 * Sanitiza un objeto recursivamente eliminando claves sensibles.
 * No modifica el objeto original.
 */
export const stripSensitiveKeys = (obj) => {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (isSensitiveKey(key))
            continue;
        if (value != null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            !(value instanceof Date)) {
            result[key] = stripSensitiveKeys(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
};
//# sourceMappingURL=stripe-sanitizer.js.map