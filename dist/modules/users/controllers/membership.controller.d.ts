import type { Request, Response } from 'express';
/**
 * Invita un usuario a una organización creando una nueva membership.
 * Solo los administradores pueden invitar usuarios.
 *
 * POST /api/v1/organizations/:organizationId/memberships
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - userId: UUID (requerido)
 * - role: 'admin' | 'gestor' | 'prestador' | 'observador' (requerido)
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional, default: 'activo')
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Membership con relaciones User y Organization,
 *   message: "Usuario invitado a organización exitosamente"
 * }
 */
export declare const inviteUser: (req: Request, res: Response) => Promise<Response>;
/**
 * Lista las memberships de una organización con paginación y filtros.
 * El usuario debe tener acceso a la organización.
 *
 * GET /api/v1/organizations/:organizationId/memberships
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
 * - sortBy: 'role' | 'status' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - role: 'admin' | 'gestor' | 'prestador' | 'observador' (opcional, filtro)
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Membership[] con relaciones User y Organization,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Memberships obtenidas exitosamente"
 * }
 */
export declare const listMemberships: (req: Request, res: Response) => Promise<Response>;
/**
 * Actualiza el rol y/o estado de una membership existente.
 * Solo los administradores pueden actualizar memberships.
 *
 * PATCH /api/v1/organizations/:organizationId/memberships/:membershipId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - membershipId: UUID
 *
 * Body (al menos uno requerido):
 * - role: 'admin' | 'gestor' | 'prestador' | 'observador' (opcional)
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Membership actualizada con relaciones User y Organization,
 *   message: "Membership actualizada exitosamente"
 * }
 */
export declare const updateMembershipRole: (req: Request, res: Response) => Promise<Response>;
/**
 * Elimina una membership.
 * Solo los administradores pueden eliminar memberships.
 *
 * DELETE /api/v1/organizations/:organizationId/memberships/:membershipId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - membershipId: UUID
 *
 * Respuesta 204: No Content
 */
export declare const deleteMembership: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=membership.controller.d.ts.map