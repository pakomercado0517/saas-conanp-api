import { type Router as ExpressRouter } from 'express';
/**
 * Router de permisos
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/permisos
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
declare const permisoRouter: ExpressRouter;
export default permisoRouter;
//# sourceMappingURL=permiso.routes.d.ts.map