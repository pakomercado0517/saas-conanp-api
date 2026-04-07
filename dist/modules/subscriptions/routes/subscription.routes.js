import { Router } from 'express';
import { createSubscription, createSubscriptionCheckoutSession, getCurrentSubscription, changePlan, cancelSubscription, reactivateSubscription, releaseIncompleteSubscription, getBillingHistory, } from '../controllers/subscription.controller.js';
import { validateCreateSubscription, validateCreateSubscriptionCheckoutSession, validateUpdateSubscription, validateCancelSubscription, validateReactivateSubscription, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccessOnly, requireAdmin, subscriptionCreateLimiter, subscriptionChangePlanLimiter, } from '../../../shared/middleware/index.js';
/**
 * Router de suscripciones anidadas en organizaciones
 *
 * Montado bajo /api/v1/organizations/:organizationId/subscriptions
 * Crear y obtener suscripción actual usan solo membresía (sin exigir suscripción activa).
 */
const subscriptionOrgRouter = Router({ mergeParams: true });
/**
 * POST /api/v1/organizations/:organizationId/subscriptions
 * Crea una suscripción para la organización.
 * Solo admins de la organización pueden crear suscripciones.
 */
subscriptionOrgRouter.post('/', subscriptionCreateLimiter, authenticate, requireOrganizationAccessOnly, requireAdmin, validateCreateSubscription, createSubscription);
/**
 * POST /api/v1/organizations/:organizationId/subscriptions/checkout-session
 * Crea sesión Stripe Checkout (modo subscription); la respuesta incluye url para redirigir al usuario.
 */
subscriptionOrgRouter.post('/checkout-session', subscriptionCreateLimiter, authenticate, requireOrganizationAccessOnly, requireAdmin, validateCreateSubscriptionCheckoutSession, createSubscriptionCheckoutSession);
/**
 * GET /api/v1/organizations/:organizationId/subscriptions/current
 * Obtiene la suscripción actual de la organización.
 * Solo admins pueden gestionar/ver la suscripción (puede devolver null si no hay).
 */
subscriptionOrgRouter.get('/current', authenticate, requireOrganizationAccessOnly, requireAdmin, getCurrentSubscription);
/**
 * Router de suscripciones por ID
 *
 * Montado bajo /api/v1/subscriptions
 * Requiere autenticación. El acceso a la organización se valida en el controller.
 */
const subscriptionRouter = Router();
/**
 * PATCH /api/v1/subscriptions/:subscriptionId/plan
 * Cambia el plan de una suscripción (upgrade/downgrade).
 */
subscriptionRouter.patch('/:subscriptionId/plan', subscriptionChangePlanLimiter, authenticate, validateUpdateSubscription, changePlan);
/**
 * POST /api/v1/subscriptions/:subscriptionId/cancel
 * Cancela una suscripción (inmediato o al final del período).
 */
subscriptionRouter.post('/:subscriptionId/cancel', authenticate, validateCancelSubscription, cancelSubscription);
/**
 * POST /api/v1/subscriptions/:subscriptionId/reactivate
 * Reactiva una suscripción programada para cancelarse.
 */
subscriptionRouter.post('/:subscriptionId/reactivate', authenticate, validateReactivateSubscription, reactivateSubscription);
/**
 * POST /api/v1/subscriptions/:subscriptionId/release-incomplete
 * Cancela sub huérfana en Stripe (si existe) y normaliza la fila a FREE para reintentar contratación.
 */
subscriptionRouter.post('/:subscriptionId/release-incomplete', authenticate, releaseIncompleteSubscription);
/**
 * GET /api/v1/subscriptions/:subscriptionId/invoices
 * Obtiene el historial de facturación de la suscripción.
 */
subscriptionRouter.get('/:subscriptionId/invoices', authenticate, getBillingHistory);
export default subscriptionRouter;
export { subscriptionOrgRouter };
//# sourceMappingURL=subscription.routes.js.map