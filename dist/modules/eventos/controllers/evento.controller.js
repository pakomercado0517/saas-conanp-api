import * as eventoService from '../services/evento.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, } from '../../../shared/responses/helpers.js';
/**
 * Crea un nuevo evento operativo.
 * Requiere validaciones estrictas de negocio (permiso vigente, capacidad disponible, etc.).
 *
 * POST /api/v1/organizations/:organizationId/eventos
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - actividadId: UUID (requerido)
 * - prestadorId: UUID (requerido)
 * - date: string YYYY-MM-DD (requerido)
 * - agendaType: 'BLOQUES' | 'HORARIO_LIBRE' (requerido)
 * - Si agendaType = 'BLOQUES':
 *   - bloqueId: UUID (requerido)
 * - Si agendaType = 'HORARIO_LIBRE':
 *   - startTime: string HH:mm:ss (requerido)
 *   - endTime: string HH:mm:ss (requerido, debe ser posterior a startTime)
 * - peopleCount: number (opcional, default: 1, mínimo: 1)
 * - paymentRequired: boolean (opcional, default: false). Si true, el evento requiere pago
 *   completado antes de confirmarse (en_curso/completado). Cuando paymentRequired = true
 *   debe indicar al menos 1 persona (peopleCount >= 1).
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: EventoOperativo con relaciones Actividad, PrestadorProfile, Bloque
 *         (incluye paymentRequired, paidAt),
 *   message: "Evento creado exitosamente"
 * }
 */
export const createEvento = async (req, res) => {
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
    const evento = await eventoService.createEvento(data, organizationId, userId);
    return sendCreated(res, evento, 'Evento creado exitosamente');
};
/**
 * Obtiene un evento por ID.
 * Valida permisos granulares: prestadores solo pueden ver sus propios eventos.
 *
 * GET /api/v1/organizations/:organizationId/eventos/:eventoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - eventoId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: EventoOperativo con relaciones Actividad, PrestadorProfile, Bloque
 *         (incluye paymentRequired, paidAt),
 *   message: "Evento obtenido exitosamente"
 * }
 */
export const getEventoById = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const eventoId = req.params['eventoId'];
    const userId = req.user.userId;
    const evento = await eventoService.getEventoById(eventoId, organizationId, userId);
    return sendSuccess(res, evento, 'Evento obtenido exitosamente');
};
/**
 * Lista eventos con paginación y filtros.
 * Valida permisos granulares: prestadores solo pueden ver sus propios eventos.
 *
 * GET /api/v1/organizations/:organizationId/eventos
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
 * - sortBy: 'date' | 'startTime' | 'endTime' | 'status' | 'peopleCount' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - actividadId: UUID (opcional, filtro por actividad)
 * - prestadorId: UUID (opcional, filtro por prestador)
 * - status: 'programado' | 'en_curso' | 'completado' | 'cancelado' (opcional, filtro)
 * - date: string YYYY-MM-DD (opcional, filtro por fecha exacta)
 * - dateFrom: string YYYY-MM-DD (opcional, filtro de fecha mínima)
 * - dateTo: string YYYY-MM-DD (opcional, filtro de fecha máxima)
 * - bloqueId: UUID (opcional, filtro por bloque)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: EventoOperativo[] con relaciones Actividad, PrestadorProfile, Bloque
 *         (cada uno incluye paymentRequired, paidAt),
 *   pagination: { page, limit, total, totalPages },
 *   message: "Eventos obtenidos exitosamente"
 * }
 */
export const listEventos = async (req, res) => {
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
    const result = await eventoService.listEventos(organizationId, filters, userId);
    return sendPaginated(res, result.data, result.pagination, 'Eventos obtenidos exitosamente');
};
/**
 * Actualiza un evento existente.
 * Valida permisos granulares y revalida capacidad si se actualizan campos relevantes.
 *
 * PATCH /api/v1/organizations/:organizationId/eventos/:eventoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - eventoId: UUID
 *
 * Body (al menos uno requerido):
 * - date: string YYYY-MM-DD (opcional)
 * - bloqueId: UUID | null (opcional)
 * - startTime: string HH:mm:ss (opcional)
 * - endTime: string HH:mm:ss (opcional, debe ser posterior a startTime si ambos están presentes)
 * - peopleCount: number (opcional, mínimo: 1; si paymentRequired = true, debe ser >= 1)
 * - status: 'programado' | 'en_curso' | 'completado' | 'cancelado' (opcional)
 * - paymentRequired: boolean (opcional). No se puede confirmar (status en_curso o completado)
 *   si el evento requiere pago y no hay pago completado.
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: EventoOperativo actualizado con relaciones Actividad, PrestadorProfile, Bloque
 *         (incluye paymentRequired, paidAt),
 *   message: "Evento actualizado exitosamente"
 * }
 */
export const updateEvento = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const eventoId = req.params['eventoId'];
    const userId = req.user.userId;
    const data = req.body;
    const evento = await eventoService.updateEvento(eventoId, organizationId, data, userId);
    return sendSuccess(res, evento, 'Evento actualizado exitosamente');
};
/**
 * Elimina un evento (soft delete).
 * Valida permisos granulares: prestadores solo pueden eliminar sus propios eventos.
 *
 * DELETE /api/v1/organizations/:organizationId/eventos/:eventoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - eventoId: UUID
 *
 * Respuesta 204: No Content
 */
export const deleteEvento = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const eventoId = req.params['eventoId'];
    const userId = req.user.userId;
    await eventoService.deleteEvento(eventoId, organizationId, userId);
    return sendNoContent(res);
};
//# sourceMappingURL=evento.controller.js.map