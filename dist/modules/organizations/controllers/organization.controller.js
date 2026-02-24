import * as organizationService from '../services/organization.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, } from '../../../shared/responses/helpers.js';
/**
 * Crea una nueva organización
 *
 * POST /api/v1/organizations
 */
export const createOrganization = async (req, res) => {
    const data = req.body;
    const result = await organizationService.createOrganization(data);
    return sendCreated(res, result, 'Organización creada exitosamente');
};
/**
 * Obtiene la configuración de acceso (brazaletes/pasaporte) de la organización.
 * El frontend usa esto para mostrar u ocultar secciones de brazaletes, stock y ventas.
 *
 * GET /api/v1/organizations/:organizationId/config-acceso
 */
export const getConfigAcceso = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const config = await organizationService.getConfigAcceso(organizationId, userId);
    return sendSuccess(res, config, 'Configuración de acceso obtenida exitosamente');
};
/**
 * Obtiene una organización por ID
 *
 * GET /api/v1/organizations/:organizationId
 */
export const getOrganizationById = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const userId = req.user.userId;
    const org = await organizationService.getOrganizationById(req.organizationId, userId);
    return sendSuccess(res, org, 'Organización obtenida exitosamente');
};
/**
 * Lista organizaciones con paginación y filtros
 *
 * GET /api/v1/organizations
 */
export const listOrganizations = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const filters = req.validatedQuery;
    const userId = req.user.userId;
    const result = await organizationService.listOrganizations(filters, userId);
    return sendPaginated(res, result.data, result.pagination, 'Organizaciones obtenidas exitosamente');
};
/**
 * Actualiza una organización
 *
 * PATCH /api/v1/organizations/:organizationId
 */
export const updateOrganization = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const data = req.body;
    const userId = req.user.userId;
    const org = await organizationService.updateOrganization(req.organizationId, data, userId);
    return sendSuccess(res, org, 'Organización actualizada exitosamente');
};
/**
 * Elimina una organización (soft delete)
 *
 * DELETE /api/v1/organizations/:organizationId
 */
export const deleteOrganization = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const userId = req.user.userId;
    await organizationService.deleteOrganization(req.organizationId, userId);
    return sendNoContent(res);
};
//# sourceMappingURL=organization.controller.js.map