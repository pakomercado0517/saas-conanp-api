import * as catalogoService from '../services/activo-requisito-catalogo.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../shared/responses/helpers.js';
/**
 * Lista el catálogo de requisitos de activos para el área (dependencia).
 * GET /api/v1/organizations/:organizationId/activo-requisito-catalogo
 */
export const listCatalogo = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const filters = req.validatedQuery ??
        req.query;
    const data = await catalogoService.listCatalogo(organizationId, filters, userId);
    return sendSuccess(res, data, 'Catálogo obtenido exitosamente');
};
/**
 * Crea una entrada en el catálogo.
 * POST /api/v1/organizations/:organizationId/activo-requisito-catalogo
 */
export const createCatalogoEntry = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const data = req.body;
    const entry = await catalogoService.createCatalogoEntry(organizationId, data, userId);
    return sendCreated(res, entry, 'Entrada de catálogo creada exitosamente');
};
/**
 * Actualiza una entrada del catálogo.
 * PATCH /api/v1/organizations/:organizationId/activo-requisito-catalogo/:catalogoId
 */
export const updateCatalogoEntry = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const catalogoId = req.params['catalogoId'];
    const data = req.body;
    const entry = await catalogoService.updateCatalogoEntry(organizationId, catalogoId, data, userId);
    return sendSuccess(res, entry, 'Entrada de catálogo actualizada exitosamente');
};
/**
 * Elimina una entrada del catálogo.
 * DELETE /api/v1/organizations/:organizationId/activo-requisito-catalogo/:catalogoId
 */
export const deleteCatalogoEntry = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const catalogoId = req.params['catalogoId'];
    await catalogoService.deleteCatalogoEntry(organizationId, catalogoId, userId);
    return sendNoContent(res);
};
//# sourceMappingURL=activo-requisito-catalogo.controller.js.map