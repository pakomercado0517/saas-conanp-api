import { type Router as ExpressRouter } from 'express';
/**
 * Router de suscripciones anidadas en organizaciones
 *
 * Montado bajo /api/v1/organizations/:organizationId/subscriptions
 * Requiere autenticación y acceso a la organización.
 */
declare const subscriptionOrgRouter: ExpressRouter;
/**
 * Router de suscripciones por ID
 *
 * Montado bajo /api/v1/subscriptions
 * Requiere autenticación. El acceso a la organización se valida en el controller.
 */
declare const subscriptionRouter: ExpressRouter;
export default subscriptionRouter;
export { subscriptionOrgRouter };
//# sourceMappingURL=subscription.routes.d.ts.map