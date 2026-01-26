import * as actividadService from '../services/actividad.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, } from '../../../shared/responses/helpers.js';
/**
 * Crea una nueva actividad.
 * Solo los administradores pueden crear actividades.
 *
 * POST /api/v1/organizations/:organizationId/actividades
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - name: string (requerido)
 * - type: 'terrestre' | 'maritima' | 'mixta' (requerido)
 * - agendaType: 'BLOQUES' | 'HORARIO_LIBRE' (requerido)
 * - requiresGuide: boolean (opcional, default: false)
 * - impactLevel: string (opcional, máximo 50 caracteres)
 * - active: boolean (opcional, default: true)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Actividad,
 *   message: "Actividad creada exitosamente"
 * }
 */
export const createActividad = async (req, res) => {
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
    const actividadData = {
        ...data,
        organizationId,
    };
    const actividad = await actividadService.createActividad(actividadData, userId);
    return sendCreated(res, actividad, 'Actividad creada exitosamente');
};
/**
 * Obtiene una actividad por ID.
 * Cualquier usuario con acceso a la organización puede leer actividades.
 *
 * GET /api/v1/organizations/:organizationId/actividades/:actividadId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Actividad,
 *   message: "Actividad obtenida exitosamente"
 * }
 */
export const getActividadById = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const actividadId = req.params['actividadId'];
    const userId = req.user.userId;
    const actividad = await actividadService.getActividadById(actividadId, organizationId, userId);
    return sendSuccess(res, actividad, 'Actividad obtenida exitosamente');
};
/**
 * Lista actividades con paginación y filtros.
 * Cualquier usuario con acceso a la organización puede listar actividades.
 *
 * GET /api/v1/organizations/:organizationId/actividades
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
 * - sortBy: 'name' | 'type' | 'agendaType' | 'active' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - name: string (opcional, búsqueda por nombre)
 * - type: 'terrestre' | 'maritima' | 'mixta' (opcional, filtro)
 * - agendaType: 'BLOQUES' | 'HORARIO_LIBRE' (opcional, filtro)
 * - active: boolean (opcional, filtro)
 * - requiresGuide: boolean (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Actividad[],
 *   pagination: { page, limit, total, totalPages },
 *   message: "Actividades obtenidas exitosamente"
 * }
 */
export const listActividades = async (req, res) => {
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
    const filters = req.validatedQuery ??
        req.query;
    const result = await actividadService.listActividades(organizationId, filters, userId);
    return sendPaginated(res, result.data, result.pagination, 'Actividades obtenidas exitosamente');
};
/**
 * Actualiza una actividad existente.
 * Solo los administradores pueden actualizar actividades.
 *
 * PATCH /api/v1/organizations/:organizationId/actividades/:actividadId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Body (al menos uno requerido):
 * - name: string (opcional)
 * - type: 'terrestre' | 'maritima' | 'mixta' (opcional)
 * - agendaType: 'BLOQUES' | 'HORARIO_LIBRE' (opcional)
 * - requiresGuide: boolean (opcional)
 * - impactLevel: string (opcional, máximo 50 caracteres)
 * - active: boolean (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Actividad actualizada,
 *   message: "Actividad actualizada exitosamente"
 * }
 */
export const updateActividad = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const actividadId = req.params['actividadId'];
    const userId = req.user.userId;
    const data = req.body;
    const actividad = await actividadService.updateActividad(actividadId, organizationId, data, userId);
    return sendSuccess(res, actividad, 'Actividad actualizada exitosamente');
};
/**
 * Elimina una actividad (soft delete).
 * Solo los administradores pueden eliminar actividades.
 *
 * DELETE /api/v1/organizations/:organizationId/actividades/:actividadId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Respuesta 204: No Content
 */
export const deleteActividad = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const actividadId = req.params['actividadId'];
    const userId = req.user.userId;
    await actividadService.deleteActividad(actividadId, organizationId, userId);
    return sendNoContent(res);
};
//# sourceMappingURL=actividad.controller.js.map