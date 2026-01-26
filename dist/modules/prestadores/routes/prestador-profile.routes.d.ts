import { type Router as ExpressRouter } from 'express';
/**
 * Router de prestadores
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/prestadores
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
declare const prestadorRouter: ExpressRouter;
export default prestadorRouter;
//# sourceMappingURL=prestador-profile.routes.d.ts.map