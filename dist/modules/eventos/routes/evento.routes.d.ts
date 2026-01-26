import { type Router as ExpressRouter } from 'express';
/**
 * Router de eventos
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/eventos
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 * Los prestadores pueden gestionar sus propios eventos (validación de permisos en el service)
 */
declare const eventoRouter: ExpressRouter;
export default eventoRouter;
//# sourceMappingURL=evento.routes.d.ts.map