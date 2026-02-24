import type { Subscription } from '../models/subscription.model.js';
import { stripSensitiveKeys } from '@/shared/sanitizers/stripe-sanitizer.js';

/**
 * Sanitiza una suscripción para enviarla en respuestas de API.
 * - Elimina metadata (puede contener datos internos de Stripe).
 * - Sanitiza recursivamente datos de Stripe (Organization, SubscriptionPlan).
 * - Nunca expone información de tarjetas ni secretos.
 *
 * @param subscription - Suscripción (objeto plano o instancia Sequelize)
 */
export const sanitizeSubscriptionForResponse = <T extends Record<string, unknown>>(
  subscription: T | Subscription | null
): Record<string, unknown> | null => {
  if (subscription == null) return null;

  const raw =
    subscription && typeof (subscription as Subscription).toJSON === 'function'
      ? ((subscription as Subscription).toJSON() as unknown as Record<string, unknown>)
      : { ...(subscription as Record<string, unknown>) };

  const sanitized = stripSensitiveKeys(raw);

  // metadata puede contener datos internos; no exponer por defecto
  if ('metadata' in sanitized) {
    sanitized['metadata'] = null;
  }

  // Sanitizar objetos anidados (Dependencia, SubscriptionPlan)
  if (sanitized['Dependencia'] != null && typeof sanitized['Dependencia'] === 'object') {
    sanitized['Dependencia'] = stripSensitiveKeys(
      sanitized['Dependencia'] as Record<string, unknown>
    );
  }
  if (sanitized['SubscriptionPlan'] != null && typeof sanitized['SubscriptionPlan'] === 'object') {
    sanitized['SubscriptionPlan'] = stripSensitiveKeys(
      sanitized['SubscriptionPlan'] as Record<string, unknown>
    );
  }

  return sanitized;
};
