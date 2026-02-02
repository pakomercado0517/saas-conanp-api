import { Router, type Router as ExpressRouter } from 'express';
import {
  createSubscription,
  getCurrentSubscription,
  changePlan,
  cancelSubscription,
  reactivateSubscription,
  getBillingHistory,
} from '../controllers/subscription.controller.js';
import {
  validateCreateSubscription,
  validateUpdateSubscription,
  validateCancelSubscription,
  validateReactivateSubscription,
} from '../middleware/validation.middleware.js';
import {
  authenticate,
  requireOrganizationAccessOnly,
} from '@/shared/middleware/index.js';

/**
 * Router de suscripciones anidadas en organizaciones
 *
 * Montado bajo /api/v1/organizations/:organizationId/subscriptions
 * Crear y obtener suscripción actual usan solo membresía (sin exigir suscripción activa).
 */
const subscriptionOrgRouter: ExpressRouter = Router({ mergeParams: true });

/**
 * POST /api/v1/organizations/:organizationId/subscriptions
 * Crea una suscripción para la organización.
 * Solo requiere membresía (la organización puede no tener suscripción aún).
 */
subscriptionOrgRouter.post(
  '/',
  authenticate,
  requireOrganizationAccessOnly,
  validateCreateSubscription,
  createSubscription
);

/**
 * GET /api/v1/organizations/:organizationId/subscriptions/current
 * Obtiene la suscripción actual de la organización.
 * Solo requiere membresía (puede devolver null si no hay suscripción).
 */
subscriptionOrgRouter.get(
  '/current',
  authenticate,
  requireOrganizationAccessOnly,
  getCurrentSubscription
);

/**
 * Router de suscripciones por ID
 *
 * Montado bajo /api/v1/subscriptions
 * Requiere autenticación. El acceso a la organización se valida en el controller.
 */
const subscriptionRouter: ExpressRouter = Router();

/**
 * PATCH /api/v1/subscriptions/:subscriptionId/plan
 * Cambia el plan de una suscripción (upgrade/downgrade).
 */
subscriptionRouter.patch(
  '/:subscriptionId/plan',
  authenticate,
  validateUpdateSubscription,
  changePlan
);

/**
 * POST /api/v1/subscriptions/:subscriptionId/cancel
 * Cancela una suscripción (inmediato o al final del período).
 */
subscriptionRouter.post(
  '/:subscriptionId/cancel',
  authenticate,
  validateCancelSubscription,
  cancelSubscription
);

/**
 * POST /api/v1/subscriptions/:subscriptionId/reactivate
 * Reactiva una suscripción programada para cancelarse.
 */
subscriptionRouter.post(
  '/:subscriptionId/reactivate',
  authenticate,
  validateReactivateSubscription,
  reactivateSubscription
);

/**
 * GET /api/v1/subscriptions/:subscriptionId/invoices
 * Obtiene el historial de facturación de la suscripción.
 */
subscriptionRouter.get('/:subscriptionId/invoices', authenticate, getBillingHistory);

export default subscriptionRouter;
export { subscriptionOrgRouter };
