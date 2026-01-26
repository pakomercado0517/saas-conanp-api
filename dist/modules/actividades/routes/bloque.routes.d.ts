import { type Router as ExpressRouter } from 'express';
/**
 * Router de bloques (rutas generales)
 *
 * Rutas bajo el prefijo /api/v1/organizations/:organizationId/bloques
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
declare const bloqueRouter: ExpressRouter;
/**
 * Router de bloques anidados en actividades
 *
 * Rutas bajo el prefijo /api/v1/organizations/:organizationId/actividades/:actividadId/bloques
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
declare const bloqueActividadRouter: ExpressRouter;
export default bloqueRouter;
export { bloqueActividadRouter };
//# sourceMappingURL=bloque.routes.d.ts.map