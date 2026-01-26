import type { Request, Response } from 'express';
/**
 * Crea o actualiza una capacidad para una actividad y fecha.
 * Si ya existe una capacidad para esa actividad y fecha, la actualiza.
 * Solo los administradores pueden crear/actualizar capacidades.
 *
 * POST /api/v1/actividades/:actividadId/capacidad
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Body:
 * - date: string YYYY-MM-DD (requerido)
 * - limit: number (requerido, mínimo: 1)
 *
 * Respuesta 201 (creada) o 200 (actualizada):
 * {
 *   success: true,
 *   data: Capacidad,
 *   message: "Capacidad creada/actualizada exitosamente"
 * }
 */
export declare const createOrUpdateCapacidad: (req: Request, res: Response) => Promise<Response>;
/**
 * Verifica disponibilidad de capacidad para una actividad.
 * Determina automáticamente si debe verificar por bloque (BLOQUES) o por día (HORARIO_LIBRE).
 *
 * GET /api/v1/actividades/:actividadId/capacidad/verificar
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Query:
 * - date: string YYYY-MM-DD (requerido)
 * - bloqueId: UUID (opcional, requerido si agendaType = BLOQUES)
 * - cantidad: number (opcional, default: 1, mínimo: 1)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: {
 *     disponible: boolean,
 *     capacidadTotal: number,
 *     capacidadUsada: number,
 *     capacidadDisponible: number,
 *     limite: number
 *   },
 *   message: "Disponibilidad verificada exitosamente"
 * }
 */
export declare const verificarDisponibilidad: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=capacidad.controller.d.ts.map