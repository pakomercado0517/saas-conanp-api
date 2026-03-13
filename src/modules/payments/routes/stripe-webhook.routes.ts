import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import { logger } from '@/shared/logger/index.js';
import {
  validateWebhookSignature,
  processWebhookEvent,
} from '../services/stripe-webhook.service.js';
import { withRlsBypass } from '@/shared/middleware/index.js';

/**
 * Router del webhook de Stripe
 *
 * POST /api/v1/webhooks/stripe
 * Debe montarse con express.raw({ type: 'application/json' }) para validar firma.
 * Sin autenticación; la verificación se hace por firma.
 */
const stripeWebhookRouter: ExpressRouter = Router();

stripeWebhookRouter.post('/', async (req: Request, res: Response): Promise<Response | void> => {
  const rawSignature = req.headers['stripe-signature'];
  const rawBody = req.body as Buffer | undefined;
  const signature =
    typeof rawSignature === 'string'
      ? rawSignature
      : Array.isArray(rawSignature)
        ? rawSignature[0]
        : undefined;

  if (!signature || !rawBody) {
    logger.warn(
      { hasSignature: Boolean(signature), hasBody: Boolean(rawBody) },
      'Webhook Stripe: firma inválida o body vacío'
    );
    return res.status(400).json({
      success: false,
      error: 'Solicitud inválida',
      message: 'Stripe-Signature y body son requeridos',
    });
  }

  let event;

  try {
    event = validateWebhookSignature(rawBody, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    logger.warn({ error: message }, 'Webhook Stripe: firma inválida');
    return res.status(400).json({
      success: false,
      error: 'Firma inválida',
      message: 'La firma del webhook no pudo verificarse',
    });
  }

  try {
    await withRlsBypass(() => processWebhookEvent(event));
  } catch (err) {
    logger.error(
      {
        eventId: event.id,
        eventType: event.type,
        message: err instanceof Error ? err.message : String(err),
        name: err instanceof Error ? err.name : undefined,
      },
      'Webhook Stripe: respondiendo 500 por error al procesar'
    );
    return res.status(500).json({
      success: false,
      error: 'Error al procesar',
      message: 'Ocurrió un error al procesar el webhook',
    });
  }

  return res.status(200).json({ received: true });
});

export default stripeWebhookRouter;
