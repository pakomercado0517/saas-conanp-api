import type { UUID } from '../../../shared/database/types.js';
import { Membership } from '../../../modules/users/models/membership.model.js';
import type { CreateMembershipDTO, UpdateMembershipDTO, ListMembershipsDTO } from '../../../modules/users/validators/membership.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
/**
 * Valida que el usuario tenga rol 'admin' en la organización especificada.
 * Verifica membresía activa con rol 'admin'.
 *
 * @param userId - ID del usuario a validar
 * @param organizationId - ID de la organización
 * @throws {ForbiddenError} Si no tiene acceso a la organización o no es admin
 */
export declare const assertIsAdmin: (userId: UUID, organizationId: UUID) => Promise<void>;
/**
 * Invita un usuario a una organización creando una nueva membership.
 * Solo los administradores pueden invitar usuarios.
 *
 * @param organizationId - ID de la organización
 * @param data - Datos de la membership (userId, role, status opcional)
 * @param inviterUserId - ID del usuario que invita (debe ser admin)
 * @returns Membership creada con relaciones User y Organization
 * @throws {ForbiddenError} Si el inviter no es admin
 * @throws {NotFoundError} Si la organización o usuario no existen
 * @throws {ConflictError} Si ya existe una membership para ese usuario en esa organización
 * @throws {ValidationError} Si el usuario está eliminado (soft delete)
 */
export declare const inviteUserToOrganization: (organizationId: UUID, data: CreateMembershipDTO, inviterUserId: UUID) => Promise<Membership>;
/**
 * Actualiza el rol y/o estado de una membership existente.
 * Solo los administradores pueden actualizar memberships.
 *
 * @param membershipId - ID de la membership a actualizar
 * @param organizationId - ID de la organización
 * @param data - Datos a actualizar (role y/o status opcionales)
 * @param updaterUserId - ID del usuario que actualiza (debe ser admin)
 * @returns Membership actualizada con relaciones User y Organization
 * @throws {ForbiddenError} Si el updater no es admin
 * @throws {NotFoundError} Si la membership no existe
 */
export declare const updateMembershipRole: (membershipId: UUID, organizationId: UUID, data: UpdateMembershipDTO, updaterUserId: UUID) => Promise<Membership>;
/**
 * Elimina una membership.
 * Solo los administradores pueden eliminar memberships.
 *
 * @param membershipId - ID de la membership a eliminar
 * @param organizationId - ID de la organización
 * @param deleterUserId - ID del usuario que elimina (debe ser admin)
 * @throws {ForbiddenError} Si el deleter no es admin
 * @throws {NotFoundError} Si la membership no existe
 */
export declare const deleteMembership: (membershipId: UUID, organizationId: UUID, deleterUserId: UUID) => Promise<void>;
/**
 * Lista las memberships de una organización con paginación y filtros.
 * El usuario debe tener acceso a la organización (membership activa).
 *
 * @param organizationId - ID de la organización
 * @param filters - Filtros de paginación, ordenamiento y filtros (role, status)
 * @param userId - ID del usuario que solicita (debe tener acceso a la organización)
 * @returns Datos paginados de memberships con relaciones User y Organization
 * @throws {ForbiddenError} Si el usuario no tiene acceso a la organización
 */
export declare const listMemberships: (organizationId: UUID, filters: ListMembershipsDTO, userId: UUID) => Promise<{
    data: Membership[];
    pagination: PaginationMeta;
}>;
//# sourceMappingURL=membership.service.d.ts.map