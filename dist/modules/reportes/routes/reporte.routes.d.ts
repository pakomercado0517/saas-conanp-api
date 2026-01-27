import { type Router as ExpressRouter } from 'express';
/**
 * Router de reportes
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/reportes
 * Requiere autenticación, acceso a la organización y rol de administrador (middleware requireAdmin)
 */
declare const reporteRouter: ExpressRouter;
export default reporteRouter;
//# sourceMappingURL=reporte.routes.d.ts.map