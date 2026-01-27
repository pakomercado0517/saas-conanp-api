import type Stripe from 'stripe';
import { stripeClient, stripeConfig } from '@/shared/stripe/index.js';
import { logger } from '@/shared/logger/index.js';
import { NotFoundError } from '@/shared/errors/index.js';
import {
  ensureEventIdempotency,
  updatePaymentStatusFromWebhook,
  handleChargeRefundedFromWebhook,
} from './payment.service.js';

export interface ProcessWebhookResult {
  received: true;
  duplicate?: boolean;
}

const PAYMENT_INTENT_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
] as const;

/**
 * Valida la firma del webhook de Stripe y devuelve el evento parseado.
 *
 * @param rawBody - Body en crudo (Buffer)
 * @param signature - Header Stripe-Signature
 * @returns Stripe.Event
 * @throws Error si la firma es inválida
 */
export const validateWebhookSignature = (rawBody: Buffer, signature: string): Stripe.Event => {
  return stripeClient.webhooks.constructEvent(rawBody, signature, stripeConfig.webhookSecret);
};

/**
 * Procesa un evento de webhook de Stripe: idempotencia, dispatch por tipo,
 * actualización de pagos. NotFoundError se trata como éxito (evitar reintentos).
 *
 * @param event - Evento de Stripe ya validado
 * @returns ProcessWebhookResult
 * @throws Error si ocurre un error no recuperable (p. ej. BD)
 */
export const processWebhookEvent = async (event: Stripe.Event): Promise<ProcessWebhookResult> => {
  const eventId = event.id;
  const eventType = event.type;

  logger.info({ eventId, eventType }, 'Webhook Stripe recibido');

  const alreadyProcessed = await ensureEventIdempotency(eventId, eventType);
  if (alreadyProcessed) {
    logger.info({ eventId }, 'Webhook Stripe: evento duplicado, omitiendo');
    return { received: true, duplicate: true };
  }

  try {
    if (PAYMENT_INTENT_EVENTS.includes(eventType as (typeof PAYMENT_INTENT_EVENTS)[number])) {
      const obj = event.data.object as Stripe.PaymentIntent;
      const piId = typeof obj === 'object' && obj?.id ? obj.id : null;
      if (piId) {
        await updatePaymentStatusFromWebhook(
          piId,
          eventType,
          obj as unknown as Record<string, unknown>
        );
      }
    } else if (eventType === 'charge.refunded') {
      await handleChargeRefundedFromWebhook(
        event.data.object as unknown as Record<string, unknown>
      );
    } else {
      logger.info({ eventId, eventType }, 'Webhook Stripe: evento no manejado');
    }
  } catch (err) {
    if (err instanceof NotFoundError) {
      logger.warn({ eventId, eventType, error: err.message }, 'Webhook Stripe: pago no encontrado');
      return { received: true };
    }
    logger.error({ err, eventId, eventType }, 'Webhook Stripe: error al procesar');
    throw err;
  }

  return { received: true };
};
