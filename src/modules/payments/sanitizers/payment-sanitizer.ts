import type { Payment } from '../models/payment.model.js';
import { stripSensitiveKeys } from '@/shared/sanitizers/stripe-sanitizer.js';

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
