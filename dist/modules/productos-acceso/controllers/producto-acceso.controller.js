import * as productoAccesoService from '../services/producto-acceso.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, } from '../../../shared/responses/helpers.js';
/**
 * POST /api/v1/organizations/:organizationId/productos-acceso
 * Crea un nuevo producto de acceso (y registro de stock con cantidad 0).
 * Solo administradores.
 */
export const createProductoAcceso = async (req, res) => {
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
    const producto = await productoAccesoService.createProductoAcceso(organizationId, data, userId);
    return sendCreated(res, producto, 'Producto de acceso creado exitosamente');
};
/**
 * GET /api/v1/organizations/:organizationId/productos-acceso/:productoAccesoId
 * Obtiene un producto de acceso por ID.
 */
export const getProductoAccesoById = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const productoAccesoId = req.params['productoAccesoId'];
    const userId = req.user.userId;
    const producto = await productoAccesoService.getProductoAccesoById(productoAccesoId, organizationId, userId);
    return sendSuccess(res, producto, 'Producto de acceso obtenido exitosamente');
};
/**
 * GET /api/v1/organizations/:organizationId/productos-acceso
 * Lista productos de acceso con paginación y filtros.
 */
export const listProductosAcceso = async (req, res) => {
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
    const result = await productoAccesoService.listProductosAcceso(organizationId, filters, userId);
    return sendPaginated(res, result.data, result.pagination, 'Productos de acceso obtenidos exitosamente');
};
/**
 * PATCH /api/v1/organizations/:organizationId/productos-acceso/:productoAccesoId
 * Actualiza un producto de acceso. Solo administradores.
 */
export const updateProductoAcceso = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const productoAccesoId = req.params['productoAccesoId'];
    const userId = req.user.userId;
    const data = req.body;
    const producto = await productoAccesoService.updateProductoAcceso(productoAccesoId, organizationId, data, userId);
    return sendSuccess(res, producto, 'Producto de acceso actualizado exitosamente');
};
/**
 * DELETE /api/v1/organizations/:organizationId/productos-acceso/:productoAccesoId
 * Elimina un producto de acceso (soft delete). Solo administradores.
 */
export const deleteProductoAcceso = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const productoAccesoId = req.params['productoAccesoId'];
    const userId = req.user.userId;
    await productoAccesoService.deleteProductoAcceso(productoAccesoId, organizationId, userId);
    return sendNoContent(res);
};
//# sourceMappingURL=producto-acceso.controller.js.map