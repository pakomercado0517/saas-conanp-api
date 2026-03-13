import { Router } from 'express';
import { createDependenciaWithAdminInvitation } from '../controllers/organization-admin-dependencia.controller.js';
import { validateCreateDependenciaAdmin } from '../../../modules/dependencias/middleware/validation.middleware.js';
import { authenticate, requireSuperAdmin, setTenantContext } from '../../../shared/middleware/index.js';
/**
 * Router de administración: crear dependencia solo con invitación (sin área).
 * Prefijo: /api/v1/admin/dependencias
 */
const adminDependenciaRouter = Router();
adminDependenciaRouter.use(authenticate, requireSuperAdmin, setTenantContext);
adminDependenciaRouter.post('/', validateCreateDependenciaAdmin, createDependenciaWithAdminInvitation);
export default adminDependenciaRouter;
//# sourceMappingURL=organization-admin-dependencia.routes.js.map