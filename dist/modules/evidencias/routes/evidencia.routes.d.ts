import { type Router as ExpressRouter } from 'express';
/**
 * Router de evidencias ambientales
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 * Las evidencias pertenecen a eventos, por lo que el eventoId viene del parámetro de ruta
 */
declare const evidenciaRouter: ExpressRouter;
export default evidenciaRouter;
//# sourceMappingURL=evidencia.routes.d.ts.map