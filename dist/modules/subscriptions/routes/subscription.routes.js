import { Router } from 'express';
import { createSubscription, getCurrentSubscription, changePlan, cancelSubscription, reactivateSubscription, getBillingHistory, } from '../controllers/subscription.controller.js';
import { validateCreateSubscription, validateUpdateSubscription, validateCancelSubscription, validateReactivateSubscription, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess } from '../../../shared/middleware/index.js';
/**
 * Router de suscripciones anidadas en organizaciones
 *
 * Montado bajo /api/v1/organizations/:organizationId/subscriptions
 * Requiere autenticación y acceso a la organización.
 */
const subscriptionOrgRouter = Router({ mergeParams: true });
/**
 * POST /api/v1/organizations/:organizationId/subscriptions
 * Crea una suscripción para la organización.
 */
subscriptionOrgRouter.post('/', authenticate, requireOrganizationAccess, validateCreateSubscription, createSubscription);
/**
 * GET /api/v1/organizations/:organizationId/subscriptions/current
 * Obtiene la suscripción actual de la organización.
 */
subscriptionOrgRouter.get('/current', authenticate, requireOrganizationAccess, getCurrentSubscription);
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
subscriptionRouter.patch('/:subscriptionId/plan', authenticate, validateUpdateSubscription, changePlan);
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
 * GET /api/v1/subscriptions/:subscriptionId/invoices
 * Obtiene el historial de facturación de la suscripción.
 */
subscriptionRouter.get('/:subscriptionId/invoices', authenticate, getBillingHistory);
export default subscriptionRouter;
export { subscriptionOrgRouter };
//# sourceMappingURL=subscription.routes.js.map