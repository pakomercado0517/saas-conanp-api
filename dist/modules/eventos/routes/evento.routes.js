import { Router } from 'express';
import { createEvento, getEventoById, listEventos, updateEvento, deleteEvento, } from '../controllers/evento.controller.js';
import { validateCreateEvento, validateUpdateEvento, validateListEventos, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess } from '../../../shared/middleware/index.js';
import evidenciaRouter from '../../../modules/evidencias/routes/evidencia.routes.js';
/**
 * Router de eventos
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/eventos
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 * Los prestadores pueden gestionar sus propios eventos (validación de permisos en el service)
 */
const eventoRouter = Router({ mergeParams: true });
/**
 * POST /api/v1/organizations/:organizationId/eventos
 * Crea un nuevo evento operativo.
 * Requiere validaciones estrictas de negocio (permiso vigente, capacidad disponible, etc.).
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
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: EventoOperativo con relaciones Actividad, PrestadorProfile, Bloque,
 *   message: "Evento creado exitosamente"
 * }
 */
eventoRouter.post('/', authenticate, requireOrganizationAccess, validateCreateEvento, createEvento);
/**
 * GET /api/v1/organizations/:organizationId/eventos
 * Lista eventos con paginación y filtros.
 * Valida permisos granulares: prestadores solo pueden ver sus propios eventos.
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
 *   data: EventoOperativo[] con relaciones Actividad, PrestadorProfile, Bloque,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Eventos obtenidos exitosamente"
 * }
 */
eventoRouter.get('/', authenticate, requireOrganizationAccess, validateListEventos, listEventos);
/**
 * GET /api/v1/organizations/:organizationId/eventos/:eventoId
 * Obtiene un evento por ID.
 * Valida permisos granulares: prestadores solo pueden ver sus propios eventos.
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
 *   data: EventoOperativo con relaciones Actividad, PrestadorProfile, Bloque,
 *   message: "Evento obtenido exitosamente"
 * }
 */
eventoRouter.get('/:eventoId', authenticate, requireOrganizationAccess, getEventoById);
/**
 * PATCH /api/v1/organizations/:organizationId/eventos/:eventoId
 * Actualiza un evento existente.
 * Valida permisos granulares y revalida capacidad si se actualizan campos relevantes.
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
 * - peopleCount: number (opcional, mínimo: 1)
 * - status: 'programado' | 'en_curso' | 'completado' | 'cancelado' (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: EventoOperativo actualizado con relaciones Actividad, PrestadorProfile, Bloque,
 *   message: "Evento actualizado exitosamente"
 * }
 */
eventoRouter.patch('/:eventoId', authenticate, requireOrganizationAccess, validateUpdateEvento, updateEvento);
/**
 * DELETE /api/v1/organizations/:organizationId/eventos/:eventoId
 * Elimina un evento (soft delete).
 * Valida permisos granulares: prestadores solo pueden eliminar sus propios eventos.
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
eventoRouter.delete('/:eventoId', authenticate, requireOrganizationAccess, deleteEvento);
/**
 * Rutas anidadas de evidencias ambientales
 * Montadas bajo /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias
 */
eventoRouter.use('/:eventoId/evidencias', evidenciaRouter);
export default eventoRouter;
//# sourceMappingURL=evento.routes.js.map