import { type Router as ExpressRouter } from 'express';
/**
 * Router de memberships
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/memberships
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
declare const membershipRouter: ExpressRouter;
export default membershipRouter;
//# sourceMappingURL=membership.routes.d.ts.map