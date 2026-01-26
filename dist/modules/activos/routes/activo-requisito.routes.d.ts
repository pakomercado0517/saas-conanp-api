import { type Router as ExpressRouter } from 'express';
/**
 * Router de requisitos de activos
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/activos/:activoId/requisitos
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 * El activoId viene del parámetro de ruta del router padre
 */
declare const activoRequisitoRouter: ExpressRouter;
export default activoRequisitoRouter;
//# sourceMappingURL=activo-requisito.routes.d.ts.map