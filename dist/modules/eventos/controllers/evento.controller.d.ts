import type { Request, Response } from 'express';
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
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: EventoOperativo con relaciones Actividad, PrestadorProfile, Bloque,
 *   message: "Evento creado exitosamente"
 * }
 */
export declare const createEvento: (req: Request, res: Response) => Promise<Response>;
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
 *   data: EventoOperativo con relaciones Actividad, PrestadorProfile, Bloque,
 *   message: "Evento obtenido exitosamente"
 * }
 */
export declare const getEventoById: (req: Request, res: Response) => Promise<Response>;
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
 *   data: EventoOperativo[] con relaciones Actividad, PrestadorProfile, Bloque,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Eventos obtenidos exitosamente"
 * }
 */
export declare const listEventos: (req: Request, res: Response) => Promise<Response>;
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
export declare const updateEvento: (req: Request, res: Response) => Promise<Response>;
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
export declare const deleteEvento: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=evento.controller.d.ts.map