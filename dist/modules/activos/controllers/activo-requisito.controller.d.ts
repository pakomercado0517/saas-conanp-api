import type { Request, Response } from 'express';
/**
 * Crea un requisito de activo.
 *
 * POST /api/v1/organizations/:organizationId/activos/:activoId/requisitos
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Body:
 * - key: string (requerido, 1-255 caracteres)
 * - value: string (opcional, nullable)
 * - documentUrl: string URL http/https (opcional, nullable)
 * - validated: boolean (opcional, default: false)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: ActivoRequisito con relación Activo,
 *   message: "Requisito de activo creado exitosamente"
 * }
 */
export declare const createRequisito: (req: Request, res: Response) => Promise<Response>;
/**
 * Lista requisitos de un activo con paginación y filtros.
 *
 * GET /api/v1/organizations/:organizationId/activos/:activoId/requisitos
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Query:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'key' | 'validated' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'asc')
 * - validated: boolean (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: ActivoRequisito[] con relación Activo,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Requisitos obtenidos exitosamente"
 * }
 */
export declare const listRequisitos: (req: Request, res: Response) => Promise<Response>;
/**
 * Actualiza un requisito de activo.
 * Solo se pueden actualizar value, documentUrl y validated (no key).
 *
 * PATCH /api/v1/organizations/:organizationId/activos/:activoId/requisitos/:requisitoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 * - requisitoId: UUID
 *
 * Body (al menos uno requerido):
 * - value: string (opcional, nullable)
 * - documentUrl: string URL http/https (opcional, nullable)
 * - validated: boolean (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: ActivoRequisito actualizado con relación Activo,
 *   message: "Requisito de activo actualizado exitosamente"
 * }
 */
export declare const updateRequisito: (req: Request, res: Response) => Promise<Response>;
/**
 * Elimina un requisito de activo (hard delete).
 *
 * DELETE /api/v1/organizations/:organizationId/activos/:activoId/requisitos/:requisitoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 * - requisitoId: UUID
 *
 * Respuesta 204: No Content
 */
export declare const deleteRequisito: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=activo-requisito.controller.d.ts.map