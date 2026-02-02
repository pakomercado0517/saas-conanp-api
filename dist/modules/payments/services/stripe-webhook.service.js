import { setTimeout as sleep } from 'node:timers/promises';
import { stripeClient, stripeConfig } from '../../../shared/stripe/index.js';
import { logger } from '../../../shared/logger/index.js';
import { AppError } from '../../../shared/errors/index.js';
import { ensureEventIdempotency, updatePaymentStatusFromWebhook, handleChargeRefundedFromWebhook, } from './payment.service.js';
import { createSubscriptionFromWebhook, updateSubscriptionFromWebhook, renewSubscriptionPeriodFromWebhook, markSubscriptionPastDueFromWebhook, handleTrialWillEndFromWebhook, } from '../../../modules/subscriptions/services/subscription.service.js';
const PAYMENT_INTENT_EVENTS = [
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'payment_intent.canceled',
];
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;
/**
 * Ejecuta el handler correspondiente al tipo de evento.
 * Lanza AppError en errores de negocio; lanza Error u otros en fallos transitorios.
 */
const dispatchWebhookEvent = async (event) => {
    const eventType = event.type;
    if (PAYMENT_INTENT_EVENTS.includes(eventType)) {
        const obj = event.data.object;
        const piId = typeof obj === 'object' && obj?.id ? obj.id : null;
        if (piId) {
            await updatePaymentStatusFromWebhook(piId, eventType, obj);
        }
    }
    else if (eventType === 'charge.refunded') {
        await handleChargeRefundedFromWebhook(event.data.object);
    }
    else if (eventType === 'customer.subscription.created') {
        const obj = event.data.object;
        const stripeSubscriptionId = obj['id'];
        await createSubscriptionFromWebhook(obj);
        logger.info({ eventId: event.id, eventType, stripeSubscriptionId }, 'Webhook Stripe: suscripción creada en BD');
    }
    else if (eventType === 'customer.subscription.updated') {
        await updateSubscriptionFromWebhook(event.data.object);
        logger.info({ eventId: event.id, eventType }, 'Webhook Stripe: suscripción actualizada');
    }
    else if (eventType === 'customer.subscription.deleted') {
        await updateSubscriptionFromWebhook(event.data.object);
        logger.info({ eventId: event.id, eventType }, 'Webhook Stripe: suscripción cancelada');
    }
    else if (eventType === 'invoice.payment_succeeded') {
        const obj = event.data.object;
        const sub = await renewSubscriptionPeriodFromWebhook(obj);
        if (sub) {
            logger.info({ eventId: event.id, eventType, subscriptionId: sub.id }, 'Webhook Stripe: período de suscripción renovado');
        }
    }
    else if (eventType === 'invoice.payment_failed') {
        await markSubscriptionPastDueFromWebhook(event.data.object);
        logger.info({ eventId: event.id, eventType }, 'Webhook Stripe: suscripción marcada past_due');
    }
    else if (eventType === 'customer.subscription.trial_will_end') {
        const obj = event.data.object;
        const trialEnd = obj['trial_end'];
        await handleTrialWillEndFromWebhook(obj);
        logger.info({ eventId: event.id, eventType, trialEnd }, 'Webhook Stripe: fin de prueba próximo');
    }
    else {
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
export const validateWebhookSignature = (rawBody, signature) => {
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
export const processWebhookEvent = async (event) => {
    const eventId = event.id;
    const eventType = event.type;
    // Solo loguear id y tipo; nunca el cuerpo del evento (puede contener datos sensibles)
    logger.info({ eventId, eventType }, 'Webhook Stripe recibido');
    const alreadyProcessed = await ensureEventIdempotency(eventId, eventType);
    if (alreadyProcessed) {
        logger.info({ eventId }, 'Webhook Stripe: evento duplicado, omitiendo');
        return { received: true, duplicate: true };
    }
    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            await dispatchWebhookEvent(event);
            return { received: true };
        }
        catch (err) {
            lastError = err;
            if (err instanceof AppError) {
                logger.warn({
                    eventId,
                    eventType,
                    error: err.message,
                    errorName: err.name,
                }, 'Webhook Stripe: error de negocio, no se reintentará');
                return { received: true };
            }
            if (attempt < MAX_RETRIES) {
                logger.warn({
                    eventId,
                    eventType,
                    attempt: attempt + 1,
                    maxRetries: MAX_RETRIES,
                    message: err instanceof Error ? err.message : String(err),
                }, 'Webhook Stripe: error transitorio, reintentando');
                await sleep(RETRY_DELAY_MS);
            }
            else {
                logger.error({
                    message: err instanceof Error ? err.message : String(err),
                    name: err instanceof Error ? err.name : undefined,
                    eventId,
                    eventType,
                }, 'Webhook Stripe: error al procesar tras reintentos');
                throw lastError;
            }
        }
    }
    throw lastError;
};
//# sourceMappingURL=stripe-webhook.service.js.map