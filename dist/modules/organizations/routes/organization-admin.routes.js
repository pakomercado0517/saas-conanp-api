import { Router } from 'express';
import { createOrganization, listOrganizations, getOrganizationById, updateOrganization, deleteOrganization, } from '../controllers/organization-admin.controller.js';
import { validateCreateOrganization, validateUpdateOrganization, validateListOrganizations, } from '../middleware/validation.middleware.js';
import { authenticate, requireSuperAdmin } from '@/shared/middleware/index.js';
/**
 * Router de administración de organizaciones (super admin)
 *
 * Todas las rutas requieren autenticación + super admin.
 * Prefijo: /api/v1/admin/organizations
 */
const adminOrganizationRouter = Router();
adminOrganizationRouter.use(authenticate, requireSuperAdmin);
adminOrganizationRouter.post('/', validateCreateOrganization, createOrganization);
adminOrganizationRouter.get('/', validateListOrganizations, listOrganizations);
adminOrganizationRouter.get('/:organizationId', getOrganizationById);
adminOrganizationRouter.patch('/:organizationId', validateUpdateOrganization, updateOrganization);
adminOrganizationRouter.delete('/:organizationId', deleteOrganization);
export default adminOrganizationRouter;
//# sourceMappingURL=organization-admin.routes.js.map