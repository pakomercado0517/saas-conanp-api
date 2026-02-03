import * as activoService from '../services/activo.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, } from '../../../shared/responses/helpers.js';
/**
 * Crea un nuevo activo.
 *
 * POST /api/v1/organizations/:organizationId/activos
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
    const actividadData = {
        ...data,
        organizationId,
    };
    const activo = await activoService.createActivo(actividadData, organizationId, userId);
    return sendCreated(res, activo, 'Activo creado exitosamente');
};
/**
 * Obtiene un activo por ID.
 *
 * GET /api/v1/organizations/:organizationId/activos/:activoId
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
 * @swagger
 * /api/v1/:
 *   get:
 *     summary: Listar recursos
 *     description: Endpoint para listar recursos. Requiere autenticación. Requiere acceso a la organización.
 *     tags: [Activos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SortByQuery'
 *       - $ref: '#/components/parameters/SortOrderQuery'
 *     responses:
 *       200:
 *         description: Listado obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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