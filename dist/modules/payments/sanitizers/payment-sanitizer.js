import { stripSensitiveKeys } from '@/shared/sanitizers/stripe-sanitizer.js';
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