import { setTimeout as sleep } from 'node:timers/promises';
import type Stripe from 'stripe';
import { stripeClient, stripeConfig } from '@/shared/stripe/index.js';
import { logger } from '@/shared/logger/index.js';
import { AppError } from '@/shared/errors/index.js';
import {
  ensureEventIdempotency,
  updatePaymentStatusFromWebhook,
  handleChargeRefundedFromWebhook,
} from './payment.service.js';
import {
  createSubscriptionFromWebhook,
  updateSubscriptionFromWebhook,
  handleSubscriptionDeletedFromWebhook,
  renewSubscriptionPeriodFromWebhook,
  syncSubscriptionFromInvoicePaymentSucceeded,
  markSubscriptionPastDueFromWebhook,
  handleTrialWillEndFromWebhook,
} from '@/modules/subscriptions/services/subscription.service.js';

export interface ProcessWebhookResult {
  received: true;
  duplicate?: boolean;
}

const PAYMENT_INTENT_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
] as const;

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

/**
 * Ejecuta el handler correspondiente al tipo de evento.
 * Lanza AppError en errores de negocio; lanza Error u otros en fallos transitorios.
 */
const dispatchWebhookEvent = async (event: Stripe.Event): Promise<void> => {
  const eventType = event.type;
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
    await handleChargeRefundedFromWebhook(event.data.object as unknown as Record<string, unknown>);
  } else if (eventType === 'customer.subscription.created') {
    const obj = event.data.object as unknown as Record<string, unknown>;
    const stripeSubscriptionId = obj['id'] as string | undefined;
    const persisted = await createSubscriptionFromWebhook(obj);
    if (persisted) {
      logger.info(
        { eventId: event.id, eventType, stripeSubscriptionId },
        'Webhook Stripe: suscripción persistida desde subscription.created'
      );
    } else {
      logger.warn(
        { eventId: event.id, eventType, stripeSubscriptionId },
        'Webhook Stripe: subscription.created no persistió fila en BD (revisar metadata, conflicto o logs previos)'
      );
    }
  } else if (eventType === 'customer.subscription.updated') {
    const obj = event.data.object as unknown as Record<string, unknown>;
    const stripeSubscriptionId = obj['id'] as string | undefined;
    const updatedSub = await updateSubscriptionFromWebhook(obj);
    if (updatedSub) {
      logger.info({ eventId: event.id, eventType }, 'Webhook Stripe: suscripción actualizada');
    } else {
      logger.warn(
        { eventId: event.id, eventType, stripeSubscriptionId },
        'Webhook Stripe: subscription.updated no aplicó cambios en BD'
      );
    }
  } else if (eventType === 'customer.subscription.deleted') {
    await handleSubscriptionDeletedFromWebhook(
      event.data.object as unknown as Record<string, unknown>
    );
    logger.info(
      { eventId: event.id, eventType },
      'Webhook Stripe: suscripción eliminada en Stripe procesada'
    );
  } else if (eventType === 'invoice.payment_succeeded') {
    const obj = event.data.object as unknown as Record<string, unknown>;
    const renewed = await renewSubscriptionPeriodFromWebhook(obj);
    if (renewed) {
      logger.info(
        { eventId: event.id, eventType, subscriptionId: renewed.id },
        'Webhook Stripe: período de suscripción renovado'
      );
    }
    // Mutuamente excluyente con renew por billing_reason; ejecutar siempre evita omitir sync si cambia el orden o el payload.
    const synced = await syncSubscriptionFromInvoicePaymentSucceeded(obj);
    if (synced) {
      logger.info(
        { eventId: event.id, eventType, subscriptionId: synced.id },
        'Webhook Stripe: suscripción sincronizada tras primer pago (invoice subscription_create|update)'
      );
    }
  } else if (eventType === 'invoice.payment_failed') {
    await markSubscriptionPastDueFromWebhook(
      event.data.object as unknown as Record<string, unknown>
    );
    logger.info({ eventId: event.id, eventType }, 'Webhook Stripe: suscripción marcada past_due');
  } else if (eventType === 'customer.subscription.trial_will_end') {
    const obj = event.data.object as unknown as Record<string, unknown>;
    const trialEnd = obj['trial_end'] as number | undefined;
    await handleTrialWillEndFromWebhook(obj);
    logger.info(
      { eventId: event.id, eventType, trialEnd },
      'Webhook Stripe: fin de prueba próximo'
    );
  } else {
    logger.info({ eventId: event.id, eventType }, 'Webhook Stripe: evento no manejado');
  }
};

// const SUBSCRIPTION_EVENTS = [
//   'customer.subscription.created',
//   'customer.subscription.updated',
//   'customer.subscription.deleted',
//   'customer.subscription.trial_will_end',
// ] as const;

// const INVOICE_EVENTS = ['invoice.payment_succeeded', 'invoice.payment_failed'] as const;

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

  // Solo loguear id y tipo; nunca el cuerpo del evento (puede contener datos sensibles)
  logger.info({ eventId, eventType }, 'Webhook Stripe recibido');

  const alreadyProcessed = await ensureEventIdempotency(eventId, eventType);
  if (alreadyProcessed) {
    logger.info({ eventId }, 'Webhook Stripe: evento duplicado, omitiendo');
    return { received: true, duplicate: true };
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await dispatchWebhookEvent(event);
      return { received: true };
    } catch (err) {
      lastError = err;
      if (err instanceof AppError) {
        logger.warn(
          {
            eventId,
            eventType,
            error: err.message,
            errorName: err.name,
          },
          'Webhook Stripe: error de negocio, no se reintentará'
        );
        return { received: true };
      }
      if (attempt < MAX_RETRIES) {
        logger.warn(
          {
            eventId,
            eventType,
            attempt: attempt + 1,
            maxRetries: MAX_RETRIES,
            message: err instanceof Error ? err.message : String(err),
          },
          'Webhook Stripe: error transitorio, reintentando'
        );
        await sleep(RETRY_DELAY_MS);
      } else {
        logger.error(
          {
            message: err instanceof Error ? err.message : String(err),
            name: err instanceof Error ? err.name : undefined,
            eventId,
            eventType,
          },
          'Webhook Stripe: error al procesar tras reintentos'
        );
        throw lastError;
      }
    }
  }

  throw lastError;
};
