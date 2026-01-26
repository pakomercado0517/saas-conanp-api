import type { Request, Response } from 'express';
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
export declare const createActivo: (req: Request, res: Response) => Promise<Response>;
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
export declare const getActivoById: (req: Request, res: Response) => Promise<Response>;
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
export declare const listActivos: (req: Request, res: Response) => Promise<Response>;
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
export declare const updateActivo: (req: Request, res: Response) => Promise<Response>;
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
export declare const deleteActivo: (req: Request, res: Response) => Promise<Response>;
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
export declare const approveActivo: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=activo.controller.d.ts.map