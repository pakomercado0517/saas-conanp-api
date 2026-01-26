import type { Request, Response } from 'express';
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
export declare const createActividad: (req: Request, res: Response) => Promise<Response>;
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
export declare const getActividadById: (req: Request, res: Response) => Promise<Response>;
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
export declare const listActividades: (req: Request, res: Response) => Promise<Response>;
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
export declare const updateActividad: (req: Request, res: Response) => Promise<Response>;
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
export declare const deleteActividad: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=actividad.controller.d.ts.map