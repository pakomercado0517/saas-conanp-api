/** Claves que no deben exponerse en respuestas de API (secretos, datos sensibles) */
const SENSITIVE_KEYS = new Set([
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
]);
/**
 * Comprueba si una clave es sensible (no debe exponerse en respuestas ni logs).
 */
const isSensitiveKey = (key) => {
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
const stripSensitiveKeys = (obj) => {
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
/**
 * Sanitiza un pago para enviarlo en respuestas de API.
 * - Nunca expone clientSecret salvo cuando includeClientSecret es true (solo en POST /intent).
 * - Elimina cualquier otra clave sensible que pudiera añadirse en el futuro.
 * - Opcionalmente omite metadata para no exponer datos que el cliente envió en la creación.
 *
 * @param payment - Pago (objeto plano o instancia Sequelize)
 * @param options - includeClientSecret: solo true para creación; includeMetadata: false por defecto
 */
export const sanitizePaymentForResponse = (payment, options = {}) => {
    const { includeClientSecret = false, includeMetadata = false } = options;
    const raw = payment && typeof payment.toJSON === 'function'
        ? payment.toJSON()
        : { ...payment };
    const sanitized = stripSensitiveKeys(raw);
    if (!includeClientSecret && 'clientSecret' in sanitized) {
        delete sanitized['clientSecret'];
    }
    if (!includeClientSecret && 'client_secret' in sanitized) {
        delete sanitized['client_secret'];
    }
    if (!includeMetadata && 'metadata' in sanitized) {
        sanitized['metadata'] = null;
    }
    return sanitized;
};
//# sourceMappingURL=payment-sanitizer.js.map