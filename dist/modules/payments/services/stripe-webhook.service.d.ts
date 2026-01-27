import type Stripe from 'stripe';
export interface ProcessWebhookResult {
    received: true;
    duplicate?: boolean;
}
/**
 * Valida la firma del webhook de Stripe y devuelve el evento parseado.
 *
 * @param rawBody - Body en crudo (Buffer)
 * @param signature - Header Stripe-Signature
 * @returns Stripe.Event
 * @throws Error si la firma es inválida
 */
export declare const validateWebhookSignature: (rawBody: Buffer, signature: string) => Stripe.Event;
/**
 * Procesa un evento de webhook de Stripe: idempotencia, dispatch por tipo,
 * actualización de pagos. NotFoundError se trata como éxito (evitar reintentos).
 *
 * @param event - Evento de Stripe ya validado
 * @returns ProcessWebhookResult
 * @throws Error si ocurre un error no recuperable (p. ej. BD)
 */
export declare const processWebhookEvent: (event: Stripe.Event) => Promise<ProcessWebhookResult>;
//# sourceMappingURL=stripe-webhook.service.d.ts.map