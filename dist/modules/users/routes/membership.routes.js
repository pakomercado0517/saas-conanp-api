import { Router } from 'express';
import { inviteUser, listMemberships, updateMembershipRole, deleteMembership, } from '../controllers/membership.controller.js';
import { validateCreateMembership, validateUpdateMembership, validateListMemberships, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess, requireAdmin, attachSubscriptionLimits, } from '@/shared/middleware/index.js';
/**
 * Router de memberships
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/memberships
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
const membershipRouter = Router({ mergeParams: true });
/**
 * POST /api/v1/organizations/:organizationId/memberships
 * Invita un usuario a una organización creando una nueva membership.
 * Solo los administradores pueden invitar usuarios.
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
membershipRouter.post('/', authenticate, requireOrganizationAccess, requireAdmin, validateCreateMembership, inviteUser);
/**
 * GET /api/v1/organizations/:organizationId/memberships
 * Lista las memberships de una organización con paginación y filtros.
 * El usuario debe tener acceso a la organización.
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
membershipRouter.get('/', authenticate, requireOrganizationAccess, attachSubscriptionLimits, // Incluir límites en la respuesta
validateListMemberships, listMemberships);
/**
 * PATCH /api/v1/organizations/:organizationId/memberships/:membershipId
 * Actualiza el rol y/o estado de una membership existente.
 * Solo los administradores pueden actualizar memberships.
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
membershipRouter.patch('/:membershipId', authenticate, requireOrganizationAccess, requireAdmin, validateUpdateMembership, updateMembershipRole);
/**
 * DELETE /api/v1/organizations/:organizationId/memberships/:membershipId
 * Elimina una membership.
 * Solo los administradores pueden eliminar memberships.
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
membershipRouter.delete('/:membershipId', authenticate, requireOrganizationAccess, requireAdmin, deleteMembership);
export default membershipRouter;
//# sourceMappingURL=membership.routes.js.map