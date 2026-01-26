import type { Request, Response } from 'express';
/**
 * Crea un nuevo bloque.
 * Solo los administradores pueden crear bloques.
 *
 * POST /api/v1/organizations/:organizationId/actividades/:actividadId/bloques
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Body:
 * - actividadId: UUID (requerido)
 * - date: string YYYY-MM-DD (requerido si isTemplate=false, null si isTemplate=true)
 * - startTime: string HH:mm:ss (requerido)
 * - endTime: string HH:mm:ss (requerido)
 * - capacity: number (opcional, default: 1, mínimo: 1)
 * - isTemplate: boolean (opcional, default: false)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Bloque,
 *   message: "Bloque creado exitosamente"
 * }
 */
export declare const createBloque: (req: Request, res: Response) => Promise<Response>;
/**
 * Crea un bloque desde una plantilla.
 * Solo los administradores pueden crear bloques desde plantillas.
 *
 * POST /api/v1/organizations/:organizationId/bloques/from-template
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - templateId: UUID (requerido, ID del bloque plantilla)
 * - date: string YYYY-MM-DD (requerido, fecha específica para el nuevo bloque)
 * - capacity: number (opcional, si no se proporciona usa la de la plantilla)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Bloque,
 *   message: "Bloque creado desde plantilla exitosamente"
 * }
 */
export declare const createBloqueFromTemplate: (req: Request, res: Response) => Promise<Response>;
/**
 * Obtiene un bloque por ID.
 * Cualquier usuario con acceso a la organización puede leer bloques.
 *
 * GET /api/v1/organizations/:organizationId/bloques/:bloqueId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - bloqueId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Bloque,
 *   message: "Bloque obtenido exitosamente"
 * }
 */
export declare const getBloqueById: (req: Request, res: Response) => Promise<Response>;
/**
 * Lista bloques con paginación y filtros.
 * Cualquier usuario con acceso a la organización puede listar bloques.
 *
 * GET /api/v1/organizations/:organizationId/bloques
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
 * - sortBy: 'date' | 'startTime' | 'endTime' | 'capacity' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - actividadId: UUID (opcional, filtro)
 * - date: string YYYY-MM-DD (opcional, filtro)
 * - isTemplate: boolean (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Bloque[],
 *   pagination: { page, limit, total, totalPages },
 *   message: "Bloques obtenidos exitosamente"
 * }
 */
export declare const listBloques: (req: Request, res: Response) => Promise<Response>;
/**
 * Lista bloques de una actividad específica.
 * Cualquier usuario con acceso a la organización puede listar bloques.
 *
 * GET /api/v1/organizations/:organizationId/actividades/:actividadId/bloques
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Query:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'date' | 'startTime' | 'endTime' | 'capacity' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - date: string YYYY-MM-DD (opcional, filtro)
 * - isTemplate: boolean (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Bloque[],
 *   pagination: { page, limit, total, totalPages },
 *   message: "Bloques obtenidos exitosamente"
 * }
 */
export declare const listBloquesByActividad: (req: Request, res: Response) => Promise<Response>;
/**
 * Actualiza un bloque existente.
 * Solo los administradores pueden actualizar bloques.
 *
 * PATCH /api/v1/organizations/:organizationId/bloques/:bloqueId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - bloqueId: UUID
 *
 * Body (al menos uno requerido):
 * - date: string YYYY-MM-DD | null (opcional)
 * - startTime: string HH:mm:ss (opcional)
 * - endTime: string HH:mm:ss (opcional)
 * - capacity: number (opcional, mínimo: 1)
 * - isTemplate: boolean (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Bloque actualizado,
 *   message: "Bloque actualizado exitosamente"
 * }
 */
export declare const updateBloque: (req: Request, res: Response) => Promise<Response>;
/**
 * Elimina un bloque.
 * Solo los administradores pueden eliminar bloques.
 *
 * DELETE /api/v1/organizations/:organizationId/bloques/:bloqueId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - bloqueId: UUID
 *
 * Respuesta 204: No Content
 */
export declare const deleteBloque: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=bloque.controller.d.ts.map