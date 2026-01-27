import { type Router as ExpressRouter } from 'express';
/**
 * Router del webhook de Stripe
 *
 * POST /api/v1/webhooks/stripe
 * Debe montarse con express.raw({ type: 'application/json' }) para validar firma.
 * Sin autenticación; la verificación se hace por firma.
 */
declare const stripeWebhookRouter: ExpressRouter;
export default stripeWebhookRouter;
//# sourceMappingURL=stripe-webhook.routes.d.ts.map