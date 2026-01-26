import * as activoService from '../services/activo.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, } from '../../../shared/responses/helpers.js';
/**
 * Crea un nuevo activo.
 *
 * POST /api/v1/organizations/:organizationId/activos
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - organizationId: UUID (requerido, debe coincidir con el parámetro)
 * - ownerId: UUID (requerido)
 * - type: 'embarcacion' | 'vehiculo' | 'guia' | 'equipo' (requerido)
 * - status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido' (opcional, default: 'pendiente')
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Activo con relaciones Organization y Owner,
 *   message: "Activo creado exitosamente"
 * }
 */
export const createActivo = async (req, res) => {
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
    // Asegurar que organizationId del body coincida con el del parámetro
    const activoData = {
        ...data,
        organizationId,
    };
    const activo = await activoService.createActivo(activoData, organizationId, userId);
    return sendCreated(res, activo, 'Activo creado exitosamente');
};
/**
 * Obtiene un activo por ID.
 *
 * GET /api/v1/organizations/:organizationId/activos/:activoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Activo con relaciones Organization y Owner,
 *   message: "Activo obtenido exitosamente"
 * }
 */
export const getActivoById = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const activoId = req.params['activoId'];
    const userId = req.user.userId;
    const activo = await activoService.getActivoById(activoId, organizationId, userId);
    return sendSuccess(res, activo, 'Activo obtenido exitosamente');
};
/**
 * Lista activos con paginación y filtros.
 *
 * GET /api/v1/organizations/:organizationId/activos
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Query:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'type' | 'status' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - ownerId: UUID (opcional, filtro por propietario)
 * - type: 'embarcacion' | 'vehiculo' | 'guia' | 'equipo' (opcional, filtro)
 * - status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido' (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Activo[] con relaciones Organization y Owner,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Activos obtenidos exitosamente"
 * }
 */
export const listActivos = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    // Usar validatedQuery si existe (cuando hay middleware de validación), sino usar req.query
    const filters = req.validatedQuery ?? req.query;
    const result = await activoService.listActivos(organizationId, filters, userId);
    return sendPaginated(res, result.data, result.pagination, 'Activos obtenidos exitosamente');
};
/**
 * Actualiza un activo existente.
 *
 * PATCH /api/v1/organizations/:organizationId/activos/:activoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Body (al menos uno requerido):
 * - type: 'embarcacion' | 'vehiculo' | 'guia' | 'equipo' (opcional)
 * - status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido' (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Activo actualizado con relaciones Organization y Owner,
 *   message: "Activo actualizado exitosamente"
 * }
 */
export const updateActivo = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const activoId = req.params['activoId'];
    const userId = req.user.userId;
    const data = req.body;
    const activo = await activoService.updateActivo(activoId, organizationId, data, userId);
    return sendSuccess(res, activo, 'Activo actualizado exitosamente');
};
/**
 * Elimina un activo (soft delete).
 *
 * DELETE /api/v1/organizations/:organizationId/activos/:activoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Respuesta 204: No Content
 */
export const deleteActivo = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const activoId = req.params['activoId'];
    const userId = req.user.userId;
    await activoService.deleteActivo(activoId, organizationId, userId);
    return sendNoContent(res);
};
/**
 * Aprueba un activo (cambia su estado a 'aprobado').
 * Solo los administradores pueden aprobar activos.
 *
 * POST /api/v1/organizations/:organizationId/activos/:activoId/aprobar
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Activo actualizado con relaciones Organization y Owner,
 *   message: "Activo aprobado exitosamente"
 * }
 */
export const approveActivo = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const activoId = req.params['activoId'];
    const userId = req.user.userId;
    const activo = await activoService.updateActivoStatus(activoId, organizationId, 'aprobado', userId);
    return sendSuccess(res, activo, 'Activo aprobado exitosamente');
};
//# sourceMappingURL=activo.controller.js.map