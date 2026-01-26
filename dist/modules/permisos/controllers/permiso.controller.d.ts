import type { Request, Response } from 'express';
/**
 * Crea un nuevo permiso.
 *
 * POST /api/v1/organizations/:organizationId/permisos
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - prestadorId: UUID (requerido)
 * - actividadId: UUID (requerido)
 * - validFrom: string ISO DateTime (requerido)
 * - validTo: string ISO DateTime (requerido)
 * - status: 'activo' | 'inactivo' | 'vencido' | 'suspendido' (opcional, default: 'activo')
 * - documentUrl: string URL (opcional)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Permiso con relaciones PrestadorProfile y Actividad,
 *   message: "Permiso creado exitosamente"
 * }
 */
export declare const createPermiso: (req: Request, res: Response) => Promise<Response>;
/**
 * Obtiene un permiso por ID.
 *
 * GET /api/v1/organizations/:organizationId/permisos/:permisoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - permisoId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Permiso con relaciones PrestadorProfile y Actividad,
 *   message: "Permiso obtenido exitosamente"
 * }
 */
export declare const getPermisoById: (req: Request, res: Response) => Promise<Response>;
/**
 * Lista permisos con paginación y filtros.
 * Requiere prestadorId en los query params para filtrar por prestador.
 *
 * GET /api/v1/organizations/:organizationId/permisos
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Query:
 * - prestadorId: UUID (requerido) - ID del prestador para filtrar permisos
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'validFrom' | 'validTo' | 'status' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - actividadId: UUID (opcional, filtro por actividad)
 * - status: 'activo' | 'inactivo' | 'vencido' | 'suspendido' (opcional, filtro)
 * - validFrom: string ISO DateTime (opcional, filtro de fecha mínima)
 * - validTo: string ISO DateTime (opcional, filtro de fecha máxima)
 * - documentUrl: string (opcional, búsqueda parcial)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Permiso[] con relaciones PrestadorProfile y Actividad,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Permisos obtenidos exitosamente"
 * }
 */
export declare const listPermisos: (req: Request, res: Response) => Promise<Response>;
/**
 * Actualiza un permiso existente.
 *
 * PATCH /api/v1/organizations/:organizationId/permisos/:permisoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - permisoId: UUID
 *
 * Body (al menos uno requerido):
 * - validFrom: string ISO DateTime (opcional)
 * - validTo: string ISO DateTime (opcional)
 * - status: 'activo' | 'inactivo' | 'vencido' | 'suspendido' (opcional)
 * - documentUrl: string URL | null (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Permiso actualizado con relaciones PrestadorProfile y Actividad,
 *   message: "Permiso actualizado exitosamente"
 * }
 */
export declare const updatePermiso: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=permiso.controller.d.ts.map