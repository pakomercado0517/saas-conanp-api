import { type Router as ExpressRouter } from 'express';
/**
 * Router de pagos
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/payments
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
declare const paymentRouter: ExpressRouter;
export default paymentRouter;
//# sourceMappingURL=payment.routes.d.ts.map