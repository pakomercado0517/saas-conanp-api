import type { Subscription } from '../models/subscription.model.js';
/**
 * Sanitiza una suscripción para enviarla en respuestas de API.
 * - Elimina metadata (puede contener datos internos de Stripe).
 * - Sanitiza recursivamente datos de Stripe (Organization, SubscriptionPlan).
 * - Nunca expone información de tarjetas ni secretos.
 *
 * @param subscription - Suscripción (objeto plano o instancia Sequelize)
 */
export declare const sanitizeSubscriptionForResponse: <T extends Record<string, unknown>>(subscription: T | Subscription | null) => Record<string, unknown> | null;
//# sourceMappingURL=subscription-sanitizer.d.ts.map