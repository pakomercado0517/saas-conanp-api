import type { Request, Response } from 'express';
/**
 * Crea un nuevo perfil de prestador.
 * Solo los administradores pueden crear perfiles de prestador.
 *
 * POST /api/v1/organizations/:organizationId/prestadores
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - userId: UUID (requerido)
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional, default: 'activo')
 * - permitExpiresAt: string ISO DateTime (opcional)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: PrestadorProfile con relaciones User y Organization,
 *   message: "Perfil de prestador creado exitosamente"
 * }
 */
export declare const createPrestadorProfile: (req: Request, res: Response) => Promise<Response>;
/**
 * Obtiene un perfil de prestador por ID.
 * - Los administradores pueden ver cualquier perfil
 * - Los prestadores solo pueden ver su propio perfil
 *
 * GET /api/v1/organizations/:organizationId/prestadores/:prestadorId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - prestadorId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: PrestadorProfile con relaciones User y Organization,
 *   message: "Perfil de prestador obtenido exitosamente"
 * }
 */
export declare const getPrestadorProfileById: (req: Request, res: Response) => Promise<Response>;
/**
 * Lista prestadores con paginación y filtros.
 * - Los administradores pueden ver todos los prestadores
 * - Los prestadores solo pueden ver su propio perfil
 *
 * GET /api/v1/organizations/:organizationId/prestadores
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
 * - sortBy: 'status' | 'permitExpiresAt' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional, filtro)
 * - userId: UUID (opcional, filtro por usuario)
 * - permitExpiresAt: string ISO DateTime (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: PrestadorProfile[] con relaciones User y Organization,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Prestadores obtenidos exitosamente"
 * }
 */
export declare const listPrestadores: (req: Request, res: Response) => Promise<Response>;
/**
 * Actualiza un perfil de prestador existente.
 * - Los administradores pueden actualizar cualquier perfil
 * - Los prestadores solo pueden actualizar su propio perfil
 *
 * PATCH /api/v1/organizations/:organizationId/prestadores/:prestadorId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - prestadorId: UUID
 *
 * Body (al menos uno requerido):
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional)
 * - permitExpiresAt: string ISO DateTime | null (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: PrestadorProfile actualizado con relaciones User y Organization,
 *   message: "Perfil de prestador actualizado exitosamente"
 * }
 */
export declare const updatePrestadorProfile: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=prestador-profile.controller.d.ts.map