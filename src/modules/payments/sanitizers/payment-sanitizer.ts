import type { Payment } from '../models/payment.model.js';

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
const isSensitiveKey = (key: string): boolean => {
  const lower = key.toLowerCase();
  return (
    SENSITIVE_KEYS.has(key) ||
    SENSITIVE_KEYS.has(lower) ||
    lower.includes('secret') ||
    lower.includes('_secret') ||
    lower.includes('card_number') ||
    lower.includes('cvc') ||
    lower.includes('cvv')
  );
};

/**
 * Sanitiza un objeto recursivamente eliminando claves sensibles.
 * No modifica el objeto original.
 */
const stripSensitiveKeys = (obj: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) continue;
    if (
      value != null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      result[key] = stripSensitiveKeys(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
};

export interface SanitizePaymentOptions {
  /** Incluir clientSecret solo en la respuesta de creación de Payment Intent (uso único en frontend). */
  includeClientSecret?: boolean;
  /** Incluir metadata en la respuesta (puede contener datos enviados por el cliente; false por defecto en list/get). */
  includeMetadata?: boolean;
}

/**
 * Sanitiza un pago para enviarlo en respuestas de API.
 * - Nunca expone clientSecret salvo cuando includeClientSecret es true (solo en POST /intent).
 * - Elimina cualquier otra clave sensible que pudiera añadirse en el futuro.
 * - Opcionalmente omite metadata para no exponer datos que el cliente envió en la creación.
 *
 * @param payment - Pago (objeto plano o instancia Sequelize)
 * @param options - includeClientSecret: solo true para creación; includeMetadata: false por defecto
 */
export const sanitizePaymentForResponse = <T extends Record<string, unknown>>(
  payment: T | Payment,
  options: SanitizePaymentOptions = {}
): Record<string, unknown> => {
  const { includeClientSecret = false, includeMetadata = false } = options;

  const raw =
    payment && typeof (payment as Payment).toJSON === 'function'
      ? ((payment as Payment).toJSON() as unknown as Record<string, unknown>)
      : { ...(payment as Record<string, unknown>) };

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
