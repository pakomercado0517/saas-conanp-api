import * as adminService from '../services/organization-admin.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, } from '../../../shared/responses/helpers.js';
/**
 * Crea una nueva organización (super admin)
 *
 * POST /api/v1/admin/organizations
 */
export const createOrganization = async (req, res) => {
    const data = req.body;
    const userId = req.user?.userId;
    const email = req.user?.email;
    if (!userId || !email) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const result = await adminService.createOrganization(data, { userId, email });
    return sendCreated(res, result, 'Organización creada exitosamente');
};
/**
 * Lista todas las organizaciones (super admin)
 *
 * GET /api/v1/admin/organizations
 */
export const listOrganizations = async (req, res) => {
    const filters = req.validatedQuery;
    const result = await adminService.listAllOrganizations(filters);
    return sendPaginated(res, result.data, result.pagination, 'Organizaciones obtenidas exitosamente');
};
/**
 * Obtiene una organización por ID (super admin)
 *
 * GET /api/v1/admin/organizations/:organizationId
 */
export const getOrganizationById = async (req, res) => {
    const organizationId = typeof req.params['organizationId'] === 'string'
        ? req.params['organizationId']
        : (req.params['organizationId']?.[0] ?? '');
    const org = await adminService.getOrganizationById(organizationId);
    return sendSuccess(res, org, 'Organización obtenida exitosamente');
};
/**
 * Actualiza una organización (super admin)
 *
 * PATCH /api/v1/admin/organizations/:organizationId
 */
export const updateOrganization = async (req, res) => {
    const organizationId = typeof req.params['organizationId'] === 'string'
        ? req.params['organizationId']
        : (req.params['organizationId']?.[0] ?? '');
    const data = req.body;
    const org = await adminService.updateOrganization(organizationId, data);
    return sendSuccess(res, org, 'Organización actualizada exitosamente');
};
/**
 * Elimina una organización (super admin, soft delete)
 *
 * DELETE /api/v1/admin/organizations/:organizationId
 */
export const deleteOrganization = async (req, res) => {
    const organizationId = typeof req.params['organizationId'] === 'string'
        ? req.params['organizationId']
        : (req.params['organizationId']?.[0] ?? '');
    await adminService.deleteOrganization(organizationId);
    return sendNoContent(res);
};
//# sourceMappingURL=organization-admin.controller.js.map